import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const offerId = params.id;

    // Find the offer and verify ownership
    const offer = await prisma.cargoOffer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      return NextResponse.json({ message: 'Offer not found' }, { status: 404 });
    }

    if (offer.userId !== userId) {
      return NextResponse.json({ message: 'You can only accept your own offers' }, { status: 403 });
    }

    if (offer.status !== 'NEW') {
      return NextResponse.json({ message: 'Only NEW offers can be accepted' }, { status: 400 });
    }

    // Update offer status to COMPLETED (accepted and delivered)
    const updatedOffer = await prisma.cargoOffer.update({
      where: { id: offerId },
      data: {
        status: 'COMPLETED',
        acceptedAt: new Date(),
      },
    });

    return NextResponse.json({ 
      message: 'Offer accepted successfully',
      offer: updatedOffer 
    });

  } catch (error) {
    console.error('Error accepting offer:', error);
    return NextResponse.json(
      { message: 'Failed to accept offer' },
      { status: 500 }
    );
  }
} 