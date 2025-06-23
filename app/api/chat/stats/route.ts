import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Găsește toate cargo offers unde user-ul este owner sau acceptor
    const userCargoOffers = await prisma.cargoOffer.findMany({
      where: {
        OR: [
          { userId: userId },
          { acceptedByUserId: userId }
        ]
      },
      include: {
        chatMessages: {
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        user: {
          select: { id: true, name: true, email: true }
        },
        acceptedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Procesează conversațiile active (care au mesaje)
    const conversations = userCargoOffers
      .filter(offer => offer.chatMessages.length > 0)
      .map(offer => {
        // Determină celalalt user (cel cu care vorbești)
        const otherUser = offer.userId === userId ? offer.acceptedBy : offer.user;
        
        // Calculează mesajele necitite trimise de celalalt user
        const unreadMessages = offer.chatMessages.filter(msg => 
          msg.senderId !== userId && !msg.read
        );
        
        const lastMessage = offer.chatMessages[0]; // Cel mai recent mesaj
        
        // Determină numele afișat mai inteligent
        const displayName = otherUser?.name 
          || offer.companyName 
          || otherUser?.email?.split('@')[0] 
          || 'Unknown User';

        return {
          id: `${offer.id}-${otherUser?.id || 'unknown'}`,
          cargoOfferId: offer.id,
          cargoTitle: offer.title,
          otherUserName: displayName,
          otherUserId: otherUser?.id,
          lastMessage: lastMessage?.content || 'No messages yet',
          lastMessageTime: lastMessage?.createdAt || offer.createdAt,
          unreadCount: unreadMessages.length,
          fromCountry: offer.fromCountry,
          toCountry: offer.toCountry
        };
      })
      .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

    // Calculează totalul de mesaje necitite
    const totalUnreadCount = conversations.reduce((total: number, conv) => total + conv.unreadCount, 0);

    return NextResponse.json({
      conversations,
      totalUnreadCount
    });

  } catch (error) {
    console.error('Failed to fetch chat stats:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}