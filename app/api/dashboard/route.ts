import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let activeVehicles = 0;
    let aiAgentsOnline = 0;
    let completedOffersToday: { price: number }[] = [];
    let totalVehicles = 0;

    try {
      // Get vehicle count (only available vehicles)
      activeVehicles = await prisma.vehicle.count({
        where: { 
          OR: [
            { status: 'assigned' },
            { status: 'idle' },
            { status: 'in_transit' }
          ]
        }
      });

      // Get AI agents count
      aiAgentsOnline = await prisma.aIAgent.count({
        where: { status: 'active' }
      });

      // Calculate today's revenue from completed cargo offers
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      completedOffersToday = await prisma.cargoOffer.findMany({
        where: {
          status: 'COMPLETED',
          updatedAt: { gte: today }
        },
        select: { price: true }
      });

      // Calculate basic fleet efficiency from vehicle status
      totalVehicles = await prisma.vehicle.count();
    } catch (dbError) {
      console.warn('Database query failed, using default values:', dbError);
      // Use default values when database is not accessible
    }

    const revenueToday = completedOffersToday.reduce((sum, offer) => sum + offer.price, 0);
    const totalTrips = completedOffersToday.length;
    const fuelEfficiency = totalVehicles > 0 ? ((activeVehicles / totalVehicles) * 100) : 0;

    const dashboardData = {
      activeVehicles,
      aiAgentsOnline,
      revenueToday: revenueToday || 0,
      fuelEfficiency: Number(fuelEfficiency.toFixed(1)),
      totalTrips,
      averageDeliveryTime: 0,
      costSavings: 0,
      aiProcessingRate: aiAgentsOnline * 60
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.warn('Dashboard API error:', error);
    // Return empty data instead of error
    return NextResponse.json({
      activeVehicles: 0,
      aiAgentsOnline: 0,
      revenueToday: 0,
      fuelEfficiency: 0,
      totalTrips: 0,
      averageDeliveryTime: 0,
      costSavings: 0,
      aiProcessingRate: 0
    });
  }
}
