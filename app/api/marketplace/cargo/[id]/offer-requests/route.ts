import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

const sendOfferSchema = z.object({
  price: z.number().positive('Price must be a positive number.'),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const cargoOfferId = params.id;
    const body = await request.json();

    const validation = sendOfferSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid request body', errors: validation.error.errors }, { status: 400 });
    }
    const { price } = validation.data;

    const cargoOffer = await prisma.cargoOffer.findUnique({
      where: { id: cargoOfferId },
    });

    if (!cargoOffer) {
      return NextResponse.json({ message: 'Cargo offer not found' }, { status: 404 });
    }
    
    if (cargoOffer.userId === userId) {
        return NextResponse.json({ message: 'You cannot make an offer on your own cargo.' }, { status: 403 });
    }

    // Use prisma transaction to ensure both operations succeed or fail together
    const [, , chatOffer] = await prisma.$transaction([
      // 1. Create or update the offer request
      prisma.offerRequest.upsert({
        where: { cargoOfferId_transporterId: { cargoOfferId, transporterId: userId } },
        update: { price, status: 'PENDING' },
        create: {
          cargoOfferId,
          transporterId: userId,
          price,
        },
      }),

      // 2. Create the automated chat message
      prisma.chatMessage.create({
        data: {
          cargoOfferId,
          senderId: userId,
          content: `Sent an offer of ${price}€.`,
        },
      }),
      
      // 3. Fetch the offer with necessary details to open the chat
      prisma.cargoOffer.findUnique({
        where: { id: cargoOfferId },
        include: {
            user: true, // Owner of the cargo
        }
      })
    ]);

    return NextResponse.json({ message: 'Offer sent successfully!', chatOffer }, { status: 201 });

  } catch (error) {
    console.error('[API_SEND_OFFER] Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 