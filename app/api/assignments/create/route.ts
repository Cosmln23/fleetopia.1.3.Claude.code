import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type PrismaTransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cargoOfferId, vehicleId } = body;

    if (!cargoOfferId || !vehicleId) {
      return new NextResponse(JSON.stringify({ error: 'Missing cargoOfferId or vehicleId' }), { status: 400 });
    }

    // Use a Prisma transaction to ensure all or nothing
    const result = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
      // 1. Verify and update the cargo offer
      const cargoOffer = await tx.cargoOffer.findUnique({
        where: { id: cargoOfferId },
      });

      if (!cargoOffer || cargoOffer.status !== 'NEW') {
        throw new Error('Cargo offer is not available for assignment.');
      }
      
      const updatedCargoOffer = await tx.cargoOffer.update({
        where: { id: cargoOfferId },
        data: { status: 'TAKEN' },
      });

      // 2. Verify and update the vehicle
      const vehicle = await tx.vehicle.findUnique({
        where: { id: vehicleId },
      });

      if (!vehicle || vehicle.status !== 'idle') {
        throw new Error('Vehiculul nu este disponibil pentru asignare.');
      }

      const updatedVehicle = await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'assigned' },
      });

      // 3. Create the new route, linking them
      const newRoute = await tx.route.create({
        data: {
          name: `Traseu pentru ${cargoOffer.id}`,
          startPoint: { address: cargoOffer.fromAddress },
          endPoint: { address: cargoOffer.toAddress },
          status: 'PLANNED',
          fleetId: vehicle.fleetId,
          vehicleId: vehicleId,
          cargoOfferId: cargoOfferId,
        },
      });

      return { updatedCargoOffer, updatedVehicle, newRoute };
    });

    return NextResponse.json({ 
      message: 'Assignment successful!', 
      data: result 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Assignment transaction failed:', error);
    return new NextResponse(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 });
  }
} 