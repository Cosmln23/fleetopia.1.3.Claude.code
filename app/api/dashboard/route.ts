import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's fleets
    const userFleets = await prisma.fleet.findMany({
      where: { userId: userId },
      include: {
        vehicles: {
          select: {
            id: true,
            status: true,
          }
        }
      }
    });

    const fleetIds = userFleets.map(fleet => fleet.id);

    // Get dashboard metrics
    const [
      totalVehicles,
      activeVehicles,
      totalCargoOffers,
      activeCargoOffers,
      recentAlerts
    ] = await Promise.all([
      // Total vehicles in user's fleets
      prisma.vehicle.count({
        where: { fleetId: { in: fleetIds } }
      }),
      
      // Active vehicles
      prisma.vehicle.count({
        where: { 
          fleetId: { in: fleetIds },
          status: 'active'
        }
      }),
      
      // Total cargo offers by user
      prisma.cargoOffer.count({
        where: { userId: userId }
      }),
      
      // Active cargo offers
      prisma.cargoOffer.count({
        where: { 
          userId: userId,
          status: 'available'
        }
      }),
      
      // Recent system alerts
      prisma.systemAlert.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          message: true,
          type: true,
          createdAt: true,
          read: true
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalVehicles,
          activeVehicles,
          totalCargoOffers,
          activeCargoOffers
        },
        recentAlerts,
        fleets: userFleets.map(fleet => ({
          id: fleet.id,
          name: fleet.name,
          vehicleCount: fleet.vehicles.length,
          activeVehicles: fleet.vehicles.filter(v => v.status === 'active').length
        }))
      }
    });

  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
