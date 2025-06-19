import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Return empty array instead of demo data
const getEmptyResponse = (message: string) => ({
  vehicles: [],
  isDemo: false,
  message
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      // Return empty data instead of demo data
      return NextResponse.json(getEmptyResponse('Please log in to see your vehicles'));
    }

    // Find user's fleets
    const userFleets = await prisma.fleet.findMany({
      where: { userId: session.user.id },
      select: { id: true }
    });

    const fleetIds = userFleets.map(fleet => fleet.id);

    // If user has no fleets, return empty data
    if (fleetIds.length === 0) {
      return NextResponse.json(getEmptyResponse('No fleets found. Add vehicles in Fleet Management.'));
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

    // If no vehicles found, return empty data
    if (transformedVehicles.length === 0) {
      return NextResponse.json(getEmptyResponse('No vehicles found. Add vehicles in Fleet Management.'));
    }

    return NextResponse.json({ 
      vehicles: transformedVehicles,
      isDemo: false,
      message: 'Real-time data loaded successfully'
    });

  } catch (error) {
    console.warn('Failed to fetch real-time data:', error);
    
    // Return empty data instead of demo data
    return NextResponse.json(getEmptyResponse('Unable to connect to database.'));
  }
} 
