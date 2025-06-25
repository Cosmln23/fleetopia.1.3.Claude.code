import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';



export const dynamic = 'force-dynamic';
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const offerId = params.id;
    

    const cargoOffer = await prisma.cargoOffer.findUnique({
      where: { id: offerId },
    });

    if (!cargoOffer) {
      return NextResponse.json({ message: 'Offer not found' }, { status: 404 });
    }

    // Only the poster can mark as delivered
    if (cargoOffer.userId !== userId) {
      return NextResponse.json({ message: 'Only the poster can mark as delivered' }, { status: 400 });
    }

    if (cargoOffer.status !== 'TAKEN') {
      return NextResponse.json({ message: 'Offer must be accepted to mark as delivered' }, { status: 400 });
    }

    const updatedOffer = await prisma.cargoOffer.update({
      where: { id: offerId },
      data: {
        status: 'COMPLETED',
      },
    });

    return NextResponse.json(updatedOffer);
  } catch (error) {
    console.error('[API_CARGO_DELIVER_POST] Error marking cargo as delivered:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Error marking cargo as delivered', error: errorMessage }, { status: 500 });
  }
} 