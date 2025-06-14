import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    const cargoOffer = await prisma.cargoOffer.findUnique({
      where: { id },
    });

    if (!cargoOffer) {
      return NextResponse.json({ message: 'Cargo offer not found' }, { status: 404 });
    }

    await prisma.cargoOffer.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Cargo offer deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting cargo offer with id ${id}:`, error);
    return NextResponse.json({ message: 'Error deleting cargo offer' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  try {
    const body = await request.json();
    
    const updatedCargoOffer = await prisma.cargoOffer.update({
      where: { id },
      data: {
        ...body,
        // Ensure numeric fields are correctly typed
        weight: body.weight ? parseFloat(body.weight) : undefined,
        volume: body.volume ? parseFloat(body.volume) : undefined,
        price: body.price ? parseFloat(body.price) : undefined,
        loadingDate: body.loadingDate ? new Date(body.loadingDate) : undefined,
        deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : undefined,
        requirements: body.requirements ? body.requirements.split(',').map((req: string) => req.trim()).filter(Boolean) : undefined,
      },
    });

    return NextResponse.json(updatedCargoOffer, { status: 200 });
  } catch (error) {
    console.error(`Error updating cargo offer with id ${id}:`, error);
    return NextResponse.json({ message: 'Error updating cargo offer' }, { status: 500 });
  }
} 