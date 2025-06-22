import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Step 1: Find all conversation IDs (cargoOffer IDs) the user is part of.
    const userConversations = await prisma.cargoOffer.findMany({
        where: {
            OR: [
                { userId: userId },
                { acceptedByUserId: userId }
            ]
        },
        select: {
            id: true
        }
    });

    const conversationIds = userConversations.map(c => c.id);

    if (conversationIds.length === 0) {
        return NextResponse.json({
            unreadMessageCount: 0,
            unreadConversationIds: [],
            unreadAlertCount: 0
        });
    }

    // Step 2: Find unread messages within those conversations.
    const unreadMessages = await prisma.chatMessage.findMany({
        where: {
            cargoId: {
                in: conversationIds
            },
            senderId: {
                not: userId
            },
            read: false
        },
        select: {
            cargoId: true
        }
    });

    const unreadMessageCount = unreadMessages.length;
    const unreadConversationIds = [...new Set(unreadMessages.map(msg => msg.cargoId))];

    // Get unread alerts count
    const unreadAlerts = await prisma.systemAlert.count({
        where: {
            // Filter alerts linked to the user's conversations
            cargoOffer: {
                id: {
                    in: conversationIds,
                }
            },
            read: false,
        },
    });

    return NextResponse.json({
      unreadMessageCount,
      unreadConversationIds: Array.from(unreadConversationIds),
      unreadAlertCount: unreadAlerts
    });

  } catch (error) {
    console.error('[NOTIFICATIONS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 