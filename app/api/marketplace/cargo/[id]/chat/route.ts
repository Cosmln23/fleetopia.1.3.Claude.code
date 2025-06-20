import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';



export const dynamic = 'force-dynamic';
// GET all chat messages for a specific cargo offer
export async function GET(
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
      select: { userId: true, acceptedByUserId: true }
    });

    if (!cargoOffer) {
      return NextResponse.json({ message: 'Offer not found' }, { status: 404 });
    }

    // Check if the current user is part of the conversation
    if (userId !== cargoOffer.userId && userId !== cargoOffer.acceptedByUserId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { cargoOfferId: offerId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, name: true, image: true }
        }
      }
    });

    return NextResponse.json(messages);

  } catch (error) {
    console.error('[API_CHAT_GET] Error fetching messages:', error);
    return NextResponse.json({ message: 'Error fetching messages' }, { status: 500 });
  }
}

// POST a new chat message to a specific cargo offer
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
    

    const { message } = await request.json();
    const content = message;
    if (!content) {
      return NextResponse.json({ message: 'Message content cannot be empty' }, { status: 400 });
    }

    const cargoOffer = await prisma.cargoOffer.findUnique({
      where: { id: offerId },
      select: { userId: true, acceptedByUserId: true }
    });

    if (!cargoOffer) {
      return NextResponse.json({ message: 'Offer not found' }, { status: 404 });
    }

    // Check if the current user is part of the conversation
    if (userId !== cargoOffer.userId && userId !== cargoOffer.acceptedByUserId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const newMessage = await prisma.chatMessage.create({
      data: {
        content,
        cargoOfferId: offerId,
        senderId: userId,
      },
      include: {
        sender: {
          select: { id: true, name: true, image: true }
        }
      }
    });

    return NextResponse.json(newMessage, { status: 201 });

  } catch (error) {
    console.error('[API_CHAT_POST] Error sending message:', error);
    return NextResponse.json({ message: 'Error sending message' }, { status: 500 });
  }
} 