import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';



export const dynamic = 'force-dynamic';
// GET all chat messages for a specific cargo offer
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log('=== CHAT GET START ===');
    const { userId } = await auth();
    console.log('Auth userId:', userId);
    
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const offerId = params.id;
    console.log('Offer ID:', offerId);
    

    const cargoOffer = await prisma.cargoOffer.findUnique({
      where: { id: offerId },
      select: { userId: true, acceptedByUserId: true }
    });

    if (!cargoOffer) {
      return NextResponse.json({ message: 'Offer not found' }, { status: 404 });
    }

    // Security check: Only allow chat between the offer owner and someone who has sent an offer request
    const hasSentOffer = await prisma.offerRequest.findFirst({
      where: {
        cargoOfferId: offerId,
        transporterId: userId,
      },
    });

    if (userId !== cargoOffer.userId && !hasSentOffer) {
      return NextResponse.json({ message: 'You do not have permission to view this chat.' }, { status: 403 });
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
    console.log('=== CHAT POST START ===');
    const { userId } = await auth();
    console.log('Auth userId:', userId);
    
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const offerId = params.id;
    console.log('Offer ID:', offerId);
    

    const body = await request.json();
    console.log('Request body:', body);
    const content = body.content || body.message;
    if (!content) {
      return NextResponse.json({ message: 'Message content cannot be empty' }, { status: 400 });
    }

    console.log('Finding cargo offer...');
    const cargoOffer = await prisma.cargoOffer.findUnique({
      where: { id: offerId },
      select: { userId: true, acceptedByUserId: true }
    });
    console.log('Cargo offer found:', cargoOffer);

    if (!cargoOffer) {
      return NextResponse.json({ message: 'Offer not found' }, { status: 404 });
    }

    // Security check: Only allow chat between the offer owner and someone who has sent an offer request
    const canChat = await prisma.offerRequest.findFirst({
      where: {
        cargoOfferId: offerId,
        transporterId: userId,
      },
    });

    if (userId !== cargoOffer.userId && !canChat) {
      return NextResponse.json({ message: 'You must send an offer to start chatting.' }, { status: 403 });
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