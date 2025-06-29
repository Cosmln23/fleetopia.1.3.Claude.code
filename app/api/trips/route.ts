import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { createTripSchema, tripQuerySchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

// GET /api/trips - Retrieve trips with filtering
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validatedQuery = tripQuerySchema.parse(query);
    const { page = 1, limit = 20, status, cargoId, vehicleId } = validatedQuery;

    // Build where clause
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (cargoId) {
      where.cargoId = cargoId;
    }
    
    if (vehicleId) {
      where.vehicleId = vehicleId;
    }

    // Only show trips for user's vehicles or cargo
    where.OR = [
      {
        cargo: {
          userId: userId
        }
      },
      {
        vehicle: {
          fleet: {
            userId: userId
          }
        }
      }
    ];

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch trips with relations
    const [trips, totalCount] = await Promise.all([
      prisma.trip.findMany({
        where,
        include: {
          cargo: {
            select: {
              id: true,
              title: true,
              fromCity: true,
              toCity: true,
              weight: true,
              price: true,
              urgency: true,
              status: true
            }
          },
          vehicle: {
            select: {
              id: true,
              name: true,
              licensePlate: true,
              type: true,
              status: true
            }
          }
        },
        orderBy: [
          { status: 'asc' }, // SUGGESTED first
          { estimatedProfit: 'desc' }, // Higher profit first
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.trip.count({ where })
    ]);

    return NextResponse.json({
      trips,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/trips - Create new trip suggestion
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = createTripSchema.parse(body);
    const { cargoId, vehicleId, estimatedProfit, estimatedDuration, distanceKm, status } = validatedData;

    // Verify user has access to cargo or vehicle
    const [cargo, vehicle] = await Promise.all([
      prisma.cargoOffer.findFirst({
        where: {
          id: cargoId,
          OR: [
            { userId: userId }, // User owns cargo
            { status: { in: ['NEW', 'OPEN'] } } // Public cargo
          ]
        }
      }),
      prisma.vehicle.findFirst({
        where: {
          id: vehicleId,
          fleet: {
            userId: userId // User owns vehicle
          }
        }
      })
    ]);

    if (!cargo) {
      return NextResponse.json(
        { error: 'Cargo not found or access denied' },
        { status: 404 }
      );
    }

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found or access denied' },
        { status: 404 }
      );
    }

    // Check if trip already exists
    const existingTrip = await prisma.trip.findFirst({
      where: {
        cargoId,
        vehicleId,
        status: { in: ['SUGGESTED', 'ACCEPTED', 'IN_PROGRESS'] }
      }
    });

    if (existingTrip) {
      return NextResponse.json(
        { error: 'Trip already exists for this cargo-vehicle combination' },
        { status: 409 }
      );
    }

    // Create trip
    const trip = await prisma.trip.create({
      data: {
        cargoId,
        vehicleId,
        estimatedProfit,
        estimatedDuration,
        distanceKm,
        status: status || 'SUGGESTED'
      },
      include: {
        cargo: {
          select: {
            id: true,
            title: true,
            fromCity: true,
            toCity: true,
            weight: true,
            price: true,
            urgency: true
          }
        },
        vehicle: {
          select: {
            id: true,
            name: true,
            licensePlate: true,
            type: true
          }
        }
      }
    });

    return NextResponse.json(trip, { status: 201 });

  } catch (error) {
    console.error('Error creating trip:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}