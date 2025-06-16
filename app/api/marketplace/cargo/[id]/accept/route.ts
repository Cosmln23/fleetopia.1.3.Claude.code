import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const offerId = params.id;
    const userId = session.user.id;

    const cargoOffer = await prisma.cargoOffer.findUnique({
      where: { id: offerId },
    });

    if (!cargoOffer) {
      return NextResponse.json({ message: 'Offer not found' }, { status: 404 });
    }

    if (cargoOffer.userId === userId) {
      return NextResponse.json({ message: 'You cannot accept your own offer' }, { status: 400 });
    }

    if (cargoOffer.status !== 'NEW') {
      return NextResponse.json({ message: 'Offer is no longer available' }, { status: 400 });
    }

    const updatedOffer = await prisma.cargoOffer.update({
      where: { id: offerId },
      data: {
        status: 'TAKEN',
        acceptedByUserId: userId,
      },
    });

    return NextResponse.json(updatedOffer);
  } catch (error) {
    console.error('[API_CARGO_ACCEPT_POST] Error accepting cargo offer:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Error accepting cargo offer', error: errorMessage }, { status: 500 });
  }
} 