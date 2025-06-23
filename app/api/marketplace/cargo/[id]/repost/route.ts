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
      return NextResponse.json({ message: 'You can only repost your own offers' }, { status: 403 });
    }

    if (offer.status !== 'TAKEN' && offer.status !== 'COMPLETED') {
      return NextResponse.json({ message: 'Only TAKEN or COMPLETED offers can be reposted' }, { status: 400 });
    }

    // Update offer status back to NEW and reset acceptance data
    const updatedOffer = await prisma.cargoOffer.update({
      where: { id: offerId },
      data: {
        status: 'NEW',
        acceptedByUserId: null,
        acceptedAt: null,
      },
    });

    return NextResponse.json({ 
      message: 'Offer reposted successfully',
      offer: updatedOffer 
    });

  } catch (error) {
    console.error('Error reposting offer:', error);
    return NextResponse.json(
      { message: 'Failed to repost offer' },
      { status: 500 }
    );
  }
} 