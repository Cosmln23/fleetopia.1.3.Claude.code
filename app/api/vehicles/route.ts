import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  try {
    const vehicles = await prisma.vehicle.findMany({
      where: status ? { status: { equals: status as any } } : {},
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(vehicles);
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
    
    // Find the first fleet to associate the vehicle with.
    let fleet = await prisma.fleet.findFirst();
    
    if (!fleet) {
      // If no fleet exists, we need a user to own it.
      let user = await prisma.user.findFirst();
      
      if (!user) {
        // If no user exists, create a default system user.
        user = await prisma.user.create({
          data: {
            name: 'System Admin',
            email: `admin@${Date.now()}.system`, // Unique email
            role: 'admin',
          },
        });
      }

      // Now create a default fleet owned by that user.
      fleet = await prisma.fleet.create({
        data: {
          name: 'Default Fleet',
          status: 'active',
          userId: user.id,
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