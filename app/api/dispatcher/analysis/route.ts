import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { DispatcherAnalysis } from '@/lib/dispatcher-types';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Optimized: Parallel queries with proper field selection to avoid N+1 problems
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const [userFleets, newOffers] = await Promise.all([
      prisma.fleet.findMany({
        where: { userId: session.user.id },
        include: {
          vehicles: {
            where: {
              status: { in: ['idle', 'assigned'] }
            },
            select: {
              id: true,
              name: true,
              licensePlate: true,
              status: true,
              type: true,
              fuelConsumption: true
            }
          }
        }
      }),
      prisma.cargoOffer.findMany({
        where: {
          status: 'NEW',
          createdAt: { gte: yesterday }
        },
        select: {
          id: true,
          title: true,
          price: true,
          fromCity: true,
          toCity: true,
          fromCountry: true,
          toCountry: true,
          distance: true,
          urgency: true,
          weight: true,
          cargoType: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10 // Limit for performance
      })
    ]);

    const availableVehicles = userFleets.reduce((acc, fleet) => acc + fleet.vehicles.length, 0);

    // Generate real suggestions based on available vehicles and cargo offers
    const suggestions = [];
    if (availableVehicles > 0 && newOffers.length > 0) {
      // Get all available vehicles for assignment
      const availableVehiclesList = userFleets.flatMap(fleet => fleet.vehicles);
      
      // Take up to 3 most recent offers as suggestions
      const topOffers = newOffers.slice(0, Math.min(3, newOffers.length));
      
      for (const [index, offer] of topOffers.entries()) {
        // Assign the next available vehicle (round-robin style)
        const selectedVehicle = availableVehiclesList[index % availableVehiclesList.length];
        
        if (selectedVehicle) {
          suggestions.push({
            id: `suggestion-${offer.id}-${selectedVehicle.id}`,
            cargoOfferId: offer.id,
            vehicleId: selectedVehicle.id,
            vehicleName: selectedVehicle.name,
            vehicleLicensePlate: selectedVehicle.licensePlate,
            title: offer.title,
            estimatedProfit: offer.price * 0.7, // Assume 70% profit margin
            estimatedDistance: offer.distance || 500, // Default 500km if no distance
            estimatedDuration: Math.ceil((offer.distance || 500) / 80), // 80km/h average
            priority: offer.urgency as 'high' | 'medium' | 'low',
            confidence: 85,
            reasoning: `${offer.title} - Assign to ${selectedVehicle.name} (${selectedVehicle.licensePlate})`
          });
        }
      }
    }

    // Calculate today's profit from completed deliveries (if any)
    const realProfit = 0; // Start with 0 until we have real completed jobs tracking
    
    const analysis: DispatcherAnalysis = {
      availableVehicles,
      newOffers: newOffers.length,
      todayProfit: realProfit,
      suggestions,
      alerts: availableVehicles === 0 ? ['⚠️ All vehicles are busy. Consider adding more vehicles to your fleet.'] : []
    };
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Dispatcher analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to get dispatcher analysis' },
      { status: 500 }
    );
  }
}