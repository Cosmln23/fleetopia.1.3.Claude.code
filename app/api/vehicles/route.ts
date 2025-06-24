import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { vehicleQuerySchema, createVehicleSchema } from '@/lib/validations';
import { dbUtils } from '@/lib/db-utils';
import { Prisma } from '@prisma/client';


export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Get user's fleets with caching
    const userFleets = await dbUtils.getUserFleets(userId);
    const fleetIds = userFleets.map(fleet => fleet.id);

    // If user has no fleets, return empty array
    if (fleetIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          vehicles: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0
          }
        }
      });
    }

    // Find vehicles with pagination and count (optimized query)
    const [vehicles, totalCount] = await Promise.all([
      prisma.vehicle.findMany({
        where: {
          fleetId: { in: fleetIds },
          ...(status ? { status: { equals: status as any } } : {})
        },
        select: {
          id: true,
          name: true,
          licensePlate: true,
          type: true,
          status: true,
          driverName: true,
          createdAt: true,
          lat: true,
          lng: true,
          gpsProvider: true,
          gpsEnabled: true,
          fuelConsumption: true
        },
        orderBy: {
          name: 'asc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.vehicle.count({
        where: {
          fleetId: { in: fleetIds },
          ...(status ? { status: { equals: status as any } } : {})
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        vehicles,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    // If it's a known Prisma error for DB connection, return a default empty response
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P1001') {
      return NextResponse.json({
        success: true,
        data: {
          vehicles: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0
          }
        }
      });
    }

    console.error('Failed to fetch vehicles:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== VEHICLE POST START ===');
    const { userId } = await auth();
    console.log('Auth userId:', userId);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    // Basic validation using zod schema
    const validation = createVehicleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          message: 'Invalid request body',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const {
      name,
      type,
      licensePlate,
      driverName,
      status,
      lat,
      lng,
      currentRoute,
      fuelConsumption,
      gpsProvider,
      gpsEnabled
    } = validation.data;

    // Check for duplicate license plate
    const existingVehicle = await prisma.vehicle.findFirst({
      where: { 
        licensePlate,
        fleet: {
          userId: userId
        }
      }
    });

    if (existingVehicle) {
      return NextResponse.json(
        { error: 'A vehicle with this license plate already exists in your fleet' },
        { status: 409 }
      );
    }
    
    // Find or create a fleet for the authenticated user
    let fleet = await prisma.fleet.findFirst({
      where: { userId: userId }
    });
    
    if (!fleet) {
      // Create a fleet for this user
      fleet = await prisma.fleet.create({
        data: {
          name: `User's Fleet`,
          status: 'active',
          userId: userId,
        },
      });
    }

    const vehicleData = {
      name,
      type,
      licensePlate,
      driverName,
      status,
      lat,
      lng,
      currentRoute,
      fuelConsumption,
      gpsProvider,
      gpsEnabled,
      fleetId: fleet.id,
    };

    const newVehicle = await prisma.vehicle.create({
      data: vehicleData,
    });
    
    if (!newVehicle) {
      throw new Error('Vehicle creation failed in database.');
    }

    return NextResponse.json({ 
      success: true, 
      data: newVehicle 
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create vehicle:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 
