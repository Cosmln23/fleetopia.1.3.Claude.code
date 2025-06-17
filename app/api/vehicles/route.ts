import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Find user's fleets
    const userFleets = await prisma.fleet.findMany({
      where: { userId: session.user.id },
      select: { id: true }
    });

    const fleetIds = userFleets.map(fleet => fleet.id);

    // If user has no fleets, return empty array
    if (fleetIds.length === 0) {
      return NextResponse.json([]);
    }

    // Find vehicles with pagination and count
    const [vehicles, totalCount] = await Promise.all([
      prisma.vehicle.findMany({
        where: {
          fleetId: { in: fleetIds },
          ...(status ? { status: { equals: status as any } } : {})
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
      vehicles,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Failed to fetch vehicles:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      type,
      licensePlate,
      driverName,
      status,
      lat,
      lng,
      currentRoute,
    } = body;

    // Basic validation
    if (!name || !licensePlate || !driverName) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields: name, licensePlate, driverName' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
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

    const newVehicle = await prisma.vehicle.create({
      data: {
        name,
        type,
        licensePlate,
        driverName,
        status,
        lat: lat || 0,
        lng: lng || 0,
        fleetId: fleet.id,
      },
    });

    return NextResponse.json(newVehicle, { status: 201 });

  } catch (error) {
    console.error('Failed to create vehicle:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 