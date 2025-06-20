import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET - Polling endpoint for dispatcher events (replaces SSE)
export async function GET(request: NextRequest) {
  try {
    console.log('=== POLLING DISPATCHER EVENTS START ===');
    
    console.log('1. Getting auth for polling...');
    const authResult = await auth();
    console.log('2. Full auth result:', authResult);
    
    const { userId } = authResult;
    console.log('3. Extracted userId:', { userId: userId ? 'PRESENT' : 'NULL', userIdType: typeof userId });
    
    if (!userId) {
      console.log('4. Polling No userId - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('5. Auth successful, preparing response...');
    
    // For now, return a simple response without Prisma to isolate the issue
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      userId: userId,
      data: {
        alerts: [],
        recentCargo: [],
        connected: true,
        message: 'Polling endpoint working'
      }
    };

    console.log('6. Returning simple polling response');
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('=== POLLING DISPATCHER EVENTS ERROR ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('Full error object:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        type: error?.constructor?.name
      },
      { status: 500 }
    );
  }
}
