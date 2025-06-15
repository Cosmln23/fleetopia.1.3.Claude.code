import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const fleet = await prisma.fleet.findFirst();
    if (!fleet) {
         return new NextResponse(
            JSON.stringify({ error: 'No fleet found. Please create a fleet before adding vehicles.' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
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
        currentRoute: currentRoute || 'N/A',
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