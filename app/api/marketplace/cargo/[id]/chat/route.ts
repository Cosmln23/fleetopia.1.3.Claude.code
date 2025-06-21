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

    // Allow the owner and anyone interested in the offer to chat
    if (userId === cargoOffer.userId) {
      // Owner can always chat
    } else if (cargoOffer.acceptedByUserId && userId !== cargoOffer.acceptedByUserId) {
      // If offer is already accepted by someone else, deny access
      return NextResponse.json({ message: 'This offer is already in negotiation with another user' }, { status: 403 });
    }
    // Otherwise, allow any authenticated user to start a conversation

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
    const content = body.content || body.message;
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

    // Allow the owner and anyone interested in the offer to chat
    if (userId === cargoOffer.userId) {
      // Owner can always chat
    } else if (cargoOffer.acceptedByUserId && userId !== cargoOffer.acceptedByUserId) {
      // If offer is already accepted by someone else, deny access
      return NextResponse.json({ message: 'This offer is already in negotiation with another user' }, { status: 403 });
    }
    // Otherwise, allow any authenticated user to start a conversation

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