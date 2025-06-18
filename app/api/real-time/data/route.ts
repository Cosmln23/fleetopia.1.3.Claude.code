import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

// Fallback demo data for when database is unavailable or user has no vehicles
const getFallbackVehicles = () => [
  {
    id: 'demo-1',
    name: 'Demo Truck 1',
    licensePlate: 'DEMO-001',
    make: 'Volvo',
    model: 'FH16',
    year: 2020,
    type: 'Heavy Truck',
    status: 'idle',
    driverName: 'Demo Driver 1',
    lat: 44.4268,
    lng: 26.1025,
    fleetId: 'demo-fleet',
    fuelConsumption: 35.0,
    currentRoute: 'Bucharest - Demo Route',
    gpsData: {
      latitude: 44.4268,
      longitude: 26.1025,
      speed: 0,
      timestamp: new Date().toISOString()
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'demo-2',
    name: 'Demo Van 1',
    licensePlate: 'DEMO-002',
    make: 'Mercedes',
    model: 'Sprinter',
    year: 2019,
    type: 'Delivery Van',
    status: 'in_transit',
    driverName: 'Demo Driver 2',
    lat: 44.4378,
    lng: 26.0968,
    fleetId: 'demo-fleet',
    fuelConsumption: 25.0,
    currentRoute: 'Bucharest - Demo Delivery',
    gpsData: {
      latitude: 44.4378,
      longitude: 26.0968,
      speed: 65,
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