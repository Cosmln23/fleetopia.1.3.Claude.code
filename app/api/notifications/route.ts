import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface Notification {
    id: string;
    type: 'alert'; // DOAR alerte sistem, nu mai includem 'message'
    text: string;
    relatedId: string;
    createdAt: Date;
    read: boolean;
}

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const notifications: Notification[] = [];

  try {
    // --- ELIMINAT: Mesajele chat sunt acum gestionate separat de chat dropdown ---
    // Bell icon (🔔) = DOAR notificări sistem
    // Message icon (💬) = DOAR mesaje chat
    
    // --- Get Unread System Alerts ---
    // Since SystemAlert doesn't have userId, we need to filter by cargoOffer relation
    const unreadAlerts = await prisma.systemAlert.findMany({
        where: {
            read: false,
            cargoOffer: {
                OR: [{ userId }, { acceptedByUserId: userId }],
            },
        },
        select: {
            id: true,
            message: true,
            relatedId: true,
            createdAt: true,
            read: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 25,
    });

    unreadAlerts.forEach(alert => {
        notifications.push({
            id: alert.id,
            type: 'alert',
            text: alert.message,
            relatedId: alert.relatedId || '',
            createdAt: alert.createdAt,
            read: alert.read
        });
    });
    
    // Sort all notifications by date
    notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json({
        notifications: notifications.slice(0, 50) // Final limit
    });

  } catch (error) {
    console.error('[NOTIFICATIONS_GET]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 