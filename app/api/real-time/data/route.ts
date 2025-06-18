import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

// Minimal fallback data for better user experience when no vehicles found
const getFallbackVehicles = () => [
  {
    id: 'placeholder-1',
    name: 'No vehicles found',
    licensePlate: 'Add vehicles in Fleet Management',
    make: 'FleetOpia',
    model: 'Guide',
    year: 2024,
    type: 'Information',
    status: 'idle',
    driverName: 'System Message',
    lat: 44.4268,
    lng: 26.1025,
    fleetId: 'system',
    fuelConsumption: 0,
    currentRoute: 'Please add your vehicles to see real-time data',
    gpsData: {
      latitude: 44.4268,
      longitude: 26.1025,
      speed: 0,
      timestamp: new Date().toISOString()
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export async function GET(request: NextRequest) {
  try {
    // Check if this is a health check or if we need to return demo data
    const url = new URL(request.url);
    const demo = url.searchParams.get('demo');
    
    if (demo === 'true') {
      return NextResponse.json({ 
        vehicles: getFallbackVehicles(),
        isDemo: true,
        message: 'Demo data - no authentication required'
      });
    }

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      // Return demo data instead of error for better UX
      return NextResponse.json({ 
        vehicles: getFallbackVehicles(),
        isDemo: true,
        message: 'Please log in to see your actual vehicles'
      });
    }

    // Find user's fleets
    const userFleets = await prisma.fleet.findMany({
      where: { userId: session.user.id },
      select: { id: true }
    });

    const fleetIds = userFleets.map(fleet => fleet.id);

    // If user has no fleets, return demo data with message
    if (fleetIds.length === 0) {
      return NextResponse.json({ 
        vehicles: getFallbackVehicles(),
        isDemo: true,
        message: 'No fleets found. Add vehicles in Fleet Management to see real data.'
      });
    }

    // Find vehicles belonging to user's fleets
    const vehicles = await prisma.vehicle.findMany({
      where: {
        fleetId: { in: fleetIds }
      },
      include: {
        fleet: {
          select: { name: true }
        },
        gpsLogs: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });

    // Transform vehicles to include proper gpsData format
    const transformedVehicles = vehicles.map(vehicle => ({
      ...vehicle,
      gpsData: vehicle.gpsLogs && vehicle.gpsLogs.length > 0 ? {
        latitude: vehicle.gpsLogs[0].lat,
        longitude: vehicle.gpsLogs[0].lng,
        speed: vehicle.gpsLogs[0].speed || 0,
        timestamp: vehicle.gpsLogs[0].timestamp.toISOString()
      } : (vehicle.lat && vehicle.lng ? {
        latitude: vehicle.lat,
        longitude: vehicle.lng,
        speed: 0,
        timestamp: new Date().toISOString()
      } : null),
      // Add missing fields for compatibility
      make: 'Unknown',
      model: 'Unknown',
      year: 2020
    }));

    // If no vehicles found, return demo data with message
    if (transformedVehicles.length === 0) {
      return NextResponse.json({ 
        vehicles: getFallbackVehicles(),
        isDemo: true,
        message: 'No vehicles found. Add vehicles in Fleet Management to see real data.'
      });
    }

    return NextResponse.json({ 
      vehicles: transformedVehicles,
      isDemo: false,
      message: 'Real-time data loaded successfully'
    });

  } catch (error) {
    console.error('Failed to fetch real-time data:', error);
    
    // Return demo data instead of error for better UX
    return NextResponse.json({ 
      vehicles: getFallbackVehicles(),
      isDemo: true,
      error: 'Database connection failed - showing demo data',
      message: 'Unable to connect to database. Showing demo vehicles.'
    }, { status: 200 }); // Return 200 instead of 500 for better UX
  }
} 