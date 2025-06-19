import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DispatcherAnalysis } from '@/lib/dispatcher-types';
import { Prisma } from '@prisma/client';

const standbyAnalysis: DispatcherAnalysis = {
  availableVehicles: 0,
  newOffers: 0,
  todayProfit: 0,
  suggestions: [],
  alerts: ['Dispatcher on standby. Add a vehicle to activate analysis.']
};

const defaultAnalysis: DispatcherAnalysis = {
  availableVehicles: 0,
  newOffers: 0,
  todayProfit: 0,
  suggestions: [],
  alerts: ['⚠️ Could not connect to the database. Displaying default data.']
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // --- The "Interruptor" (Switch) Logic ---
    let vehicleCount = 0;
    try {
      vehicleCount = await prisma.vehicle.count({
        where: { fleet: { userId: session.user.id } },
      });
    } catch (error) {
      console.warn('Could not count vehicles:', error);
      return NextResponse.json(standbyAnalysis);
    }

    if (vehicleCount === 0) {
      return NextResponse.json(standbyAnalysis);
    }
    // --- End of Switch Logic ---

    // Optimized: Parallel queries with proper field selection to avoid N+1 problems
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let userFleets = [];
    let newOffers = [];
    
    try {
      [userFleets, newOffers] = await Promise.all([
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
                type: true
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
    } catch (error) {
      console.warn('Database query failed:', error);
      return NextResponse.json(standbyAnalysis);
    }

    const availableVehicles = userFleets.reduce((acc, fleet) => acc + fleet.vehicles.length, 0);

    // Generate real suggestions based on available vehicles and cargo offers
    const suggestions: any[] = [];
    if (availableVehicles > 0 && newOffers.length > 0) {
      // Get all available vehicles for assignment
      const availableVehiclesList = userFleets.flatMap(fleet => fleet.vehicles);
      
      // Take up to 3 most recent offers as suggestions
      const topOffers = newOffers.slice(0, Math.min(3, newOffers.length));
      
      topOffers.forEach((offer, index) => {
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
            estimatedDistance: 500, // Default 500km if no distance
            estimatedDuration: Math.ceil(500 / 80), // 80km/h average
            priority: offer.urgency as 'high' | 'medium' | 'low',
            confidence: 85,
            reasoning: `${offer.title} - Assign to ${selectedVehicle.name} (${selectedVehicle.licensePlate})`
          });
        }
      });
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

    // If it's a known Prisma error for DB connection, return default data
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P1001') {
      return NextResponse.json(defaultAnalysis);
    }

    const errorMessage = error instanceof Error ? error.message : 'An unknown internal error occurred';
    return NextResponse.json(
      { error: 'Failed to get dispatcher analysis', details: errorMessage },
      { status: 500 }
    );
  }
}
