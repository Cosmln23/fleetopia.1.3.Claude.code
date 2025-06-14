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