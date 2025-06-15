import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vehicleId, cargoOfferId, proposal } = body;

    if (!vehicleId || !cargoOfferId || !proposal) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const cargoOffer = await prisma.cargoOffer.findUnique({
      where: { id: cargoOfferId },
    });

    if (!cargoOffer) {
      return NextResponse.json({ message: 'Cargo offer not found' }, { status: 404 });
    }
    
    const vehicle = await prisma.vehicle.findUnique({
        where: {id: vehicleId}
    })

    if(!vehicle) {
        return NextResponse.json({ message: 'Vehicle not found' }, { status: 404 });
    }


    // Create a new route
    const newRoute = await prisma.route.create({
      data: {
        name: `Route for ${cargoOffer.title}`,
        startPoint: { lat: 0, lng: 0 }, // Placeholder
        endPoint: { lat: 0, lng: 0 }, // Placeholder
        fleetId: vehicle.fleetId,
        vehicleId: vehicleId,
        cargoOfferId: cargoOfferId, // Link the route to the cargo offer
      },
    });

    // Update vehicle status and current route
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { 
        status: 'assigned',
        currentRoute: `${cargoOffer.fromAddress}, ${cargoOffer.fromCountry} → ${cargoOffer.toAddress}, ${cargoOffer.toCountry}`,
      },
    });
    
    // Cargo offer status can be updated here if needed
    // For now, we assume 'assigned' means it's taken off the marketplace implicitly


    return NextResponse.json({ message: 'Route created successfully', route: newRoute }, { status: 201 });
  } catch (error) {
    console.error('Error creating route:', error);
    return NextResponse.json({ message: 'Error creating route' }, { status: 500 });
  }
} 