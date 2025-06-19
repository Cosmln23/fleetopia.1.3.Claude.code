import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createApiHandler, apiResponse } from '@/lib/api-helpers';
import { vehicleQuerySchema, createVehicleSchema } from '@/lib/validations';
import { rateLimiters } from '@/lib/rate-limit';
import { dbUtils } from '@/lib/db-utils';
import { Prisma } from '@prisma/client';

export const GET = createApiHandler({
  requireAuth: true,
  rateLimiter: rateLimiters.search,
  querySchema: vehicleQuerySchema
})(async ({ session, query }) => {
  try {
    const { status, page, limit } = query!;
    const offset = (page - 1) * limit;

    // Get user's fleets with caching
    const userFleets = await dbUtils.getUserFleets(session.user.id);
    const fleetIds = userFleets.map(fleet => fleet.id);

    // If user has no fleets, return empty array
    if (fleetIds.length === 0) {
      return apiResponse.success({
        vehicles: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
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
          lng: true
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

    return apiResponse.success({
      vehicles,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    // If it's a known Prisma error for DB connection, return a default empty response
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P1001') {
      return apiResponse.success({
        vehicles: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        }
      });
    }

    console.error('Failed to fetch vehicles:', error);
    throw error;
  }
});

export const POST = createApiHandler({
  requireAuth: true,
  rateLimiter: rateLimiters.create,
  bodySchema: createVehicleSchema
})(async ({ session, body }) => {
  try {
    const {
      name,
      type,
      licensePlate,
      driverName,
      status,
      lat,
      lng,
      currentRoute,
      fuelConsumption
    } = body!;

    // Check for duplicate license plate
    const existingVehicle = await prisma.vehicle.findFirst({
      where: { 
        licensePlate,
        fleet: {
          userId: session.user.id
        }
      }
    });

    if (existingVehicle) {
      return apiResponse.conflict('A vehicle with this license plate already exists in your fleet');
    }
    
    // Find or create a fleet for the authenticated user
    let fleet = await prisma.fleet.findFirst({
      where: { userId: session.user.id }
    });
    
    if (!fleet) {
      // Create a fleet for this user
      fleet = await prisma.fleet.create({
        data: {
          name: `${session.user.name || 'User'}'s Fleet`,
          status: 'active',
          userId: session.user.id,
        },
      });
    }

    const newVehicle = await dbUtils.createVehicle({
      name,
      type,
      licensePlate,
      driverName,
      status,
      lat,
      lng,
      currentRoute,
      fuelConsumption,
      fleetId: fleet.id,
    }, session.user.id);

    return apiResponse.success(newVehicle, 201);

  } catch (error) {
    console.error('Failed to create vehicle:', error);
    throw error;
  }
}); 
