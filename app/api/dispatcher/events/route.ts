import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

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

    // Simple, clean response to avoid Content-Length issues
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        connected: true,
        alerts: [],
        recentCargo: []
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
