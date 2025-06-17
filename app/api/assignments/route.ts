import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cargoOfferId, vehicleId } = body;

    if (!cargoOfferId || !vehicleId) {
      return NextResponse.json(
        { error: 'cargoOfferId and vehicleId are required' },
        { status: 400 }
      );
    }

    // Use a transaction to ensure all operations succeed or none do.
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch the offer to get its details
      const offer = await tx.cargoOffer.findUnique({
        where: { id: cargoOfferId },
      });

      if (!offer) {
        throw new Error('Cargo offer not found.');
      }
      if (offer.status !== 'NEW') {
          throw new Error('This offer is no longer available for assignment.');
      }

      // 2. Fetch the vehicle to ensure it's idle and get its fleetId
      const vehicle = await tx.vehicle.findUnique({
          where: { id: vehicleId }
      });

      if (!vehicle) {
          throw new Error('Vehicle not found.');
      }
      if (vehicle.status !== 'idle') {
          throw new Error('This vehicle is not idle and cannot be assigned.');
      }

      // 3. Update the CargoOffer status to 'TAKEN'
      const updatedOffer = await tx.cargoOffer.update({
        where: { id: cargoOfferId },
        data: { status: 'TAKEN' },
      });

      // 4. Update the Vehicle status to 'assigned'
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'assigned', currentRoute: `${offer.fromAddress} -> ${offer.toAddress}` },
      });

      // 5. Create a new Route record linking the two
      await tx.route.create({
        data: {
          name: `Route for: ${offer.title}`,
          startPoint: { address: offer.fromAddress, country: offer.fromCountry },
          endPoint: { address: offer.toAddress, country: offer.toCountry },
          status: 'planned',
          fleetId: vehicle.fleetId, // A vehicle must belong to a fleet
          vehicleId: vehicleId,
          cargoOfferId: cargoOfferId,
        },
      });

      return updatedOffer;
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Failed to assign offer:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to assign offer', details: errorMessage },
      { status: 500 }
    );
  }
} 