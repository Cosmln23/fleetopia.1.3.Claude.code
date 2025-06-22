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
    const unreadMessages = await prisma.chatMessage.findMany({
        where: {
            cargoOffer: {
                OR: [
                    { userId: userId },
                    { acceptedByUserId: userId }
                ]
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

    // For alerts, we rely on the logic already in the marketplace store.
    const unreadAlerts = await prisma.systemAlert.count({
        where: {
            userId: userId,
            read: false
        }
    });

    return NextResponse.json({
      unreadMessageCount,
      unreadConversationIds,
      unreadAlertCount: unreadAlerts
    });

  } catch (error) {
    console.error('[NOTIFICATIONS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 