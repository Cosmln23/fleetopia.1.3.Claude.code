import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET - Polling endpoint for dispatcher events (replaces SSE)
export async function GET(request: NextRequest) {
  try {
    console.log('=== POLLING DISPATCHER EVENTS START ===');
    
    const authResult = await auth();
    const { userId } = authResult;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if there's any cargo in the system
    const cargoCount = await prisma.cargoOffer.count({
      where: {
        status: {
          in: ['NEW', 'TAKEN']
        }
      }
    });

    // Get recent cargo if any exists
    let recentCargo = [];
    if (cargoCount > 0) {
      recentCargo = await prisma.cargoOffer.findMany({
        where: {
          status: 'NEW',
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
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
          createdAt: true
        }
      });
    }

    // Smart response based on cargo availability
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        connected: true,
        cargoCount,
        alerts: [],
        recentCargo: recentCargo
      }
    };

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('Polling error:', error);
    
    return new NextResponse(JSON.stringify({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
