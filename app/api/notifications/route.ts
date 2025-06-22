import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let unreadMessageCount = 0;
  let unreadConversationIds: string[] = [];
  let unreadAlertCount = 0;

  try {
    // --- Get Unread Messages ---
    try {
      const unreadMessages = await prisma.chatMessage.findMany({
        where: {
          cargoOffer: {
            OR: [{ userId }, { acceptedByUserId: userId }],
          },
          senderId: { not: userId },
          read: false,
        },
        select: {
          cargoOfferId: true,
        },
      });
      
      unreadMessageCount = unreadMessages.length;
      if (unreadMessageCount > 0) {
        unreadConversationIds = Array.from(new Set(unreadMessages.map(msg => msg.cargoOfferId)));
      }
    } catch (e) {
      console.error("Failed to fetch unread messages:", e);
      // Do not crash the entire endpoint if this fails
    }

    // --- Get Unread Alerts ---
    // This part remains problematic. For now, we will keep it disabled 
    // to guarantee the chat notifications work.
    // try {
    //   unreadAlertCount = await prisma.systemAlert.count({
    //     where: {
    //       user: { id: userId }, // Correct relation needed
    //       read: false
    //     }
    //   });
    // } catch(e) {
    //   console.error("Failed to fetch unread alerts:", e);
    // }

    return NextResponse.json({
      unreadMessageCount,
      unreadConversationIds,
      unreadAlertCount,
    });

  } catch (error) {
    console.error('[NOTIFICATIONS_GET_GLOBAL]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 