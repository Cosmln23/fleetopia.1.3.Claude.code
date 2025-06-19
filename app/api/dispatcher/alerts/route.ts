import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all unread system alerts
export async function GET() {
  try {
    const alerts = await prisma.systemAlert.findMany({
      where: {
        read: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching system alerts:', error);
    return NextResponse.json({ message: 'Error fetching system alerts' }, { status: 500 });
  }
}

// POST to mark alerts as read (optional, for future use)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { alertIds } = body;

        if (!alertIds || !Array.isArray(alertIds)) {
            return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
        }

        await prisma.systemAlert.updateMany({
            where: {
                id: {
                    in: alertIds,
                },
            },
            data: {
                read: true,
            },
        });

        return NextResponse.json({ message: 'Alerts marked as read' });
    } catch (error) {
        console.error('Error updating alerts:', error);
        return NextResponse.json({ message: 'Error updating alerts' }, { status: 500 });
    }
} 
