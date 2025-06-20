import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET - Polling endpoint for dispatcher events (replaces SSE)
export async function GET(request: NextRequest) {
  try {
    console.log('=== POLLING DISPATCHER EVENTS START ===');
    
    console.log('1. Getting auth for polling...');
    const { userId } = await auth();
    console.log('2. Polling Auth result:', { userId: userId ? 'PRESENT' : 'NULL' });
    
    if (!userId) {
      console.log('3. Polling No userId - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('4. Fetching latest events...');
    
    // Get recent system alerts (last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const recentAlerts = await prisma.systemAlert.findMany({
      where: {
        createdAt: {
          gte: fiveMinutesAgo
        },
        read: false
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    console.log('5. Found alerts:', recentAlerts.length);

    // Get recent cargo offers (last 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    const recentCargo = await prisma.cargoOffer.findMany({
      where: {
        createdAt: {
          gte: tenMinutesAgo
        },
        status: 'NEW'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      select: {
        id: true,
        title: true,
        fromCountry: true,
        toCountry: true,
        price: true,
        urgency: true,
        createdAt: true
      }
    });

    console.log('6. Found recent cargo:', recentCargo.length);

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        alerts: recentAlerts,
        recentCargo: recentCargo,
        connected: true
      }
    };

    console.log('7. Returning polling response');
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('=== POLLING DISPATCHER EVENTS ERROR ===');
    console.error('Polling Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
