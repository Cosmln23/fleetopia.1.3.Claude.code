import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getUnreadMessagesCount(userId: string): Promise<number> {
    // This is a simplified logic. 
    // A more robust solution would involve a dedicated 'is_read' flag on the ChatMessage model.
    // For now, we count messages in chats where the user is a participant but not the sender of the last message.
    // This is an approximation of "unread".

    const userChats = await prisma.cargoOffer.findMany({
        where: {
            OR: [
                { userId: userId }, // User is the owner of the cargo
                { acceptedByUserId: userId } // User has accepted the cargo
            ],
            chatMessages: {
                some: {} // Ensure there are messages in the chat
            }
        },
        include: {
            chatMessages: {
                orderBy: {
                    createdAt: 'desc'
                },
                take: 1
            }
        }
    });

    // Count chats where the last message is not from the current user
    const unreadChats = userChats.filter(chat => 
        chat.chatMessages.length > 0 && chat.chatMessages[0].senderId !== userId
    );

    // A proper implementation would require tracking read status per user per chat.
    // For this task, we will consider any chat where the last message isn't from the user as "unread".
    return unreadChats.length;
}


export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const unreadMessages = await getUnreadMessagesCount(userId);
    
    // For alerts, we rely on the logic already in the marketplace store. 
    // This API will just return the message count for now.
    // The hook combines this with the alerts from the Zustand store.
    const newAlerts = 0; // This can be extended later if needed

    return NextResponse.json({
      unreadMessages,
      newAlerts,
    });

  } catch (error) {
    console.error('[NOTIFICATIONS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 