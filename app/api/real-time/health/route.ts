import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'Real-time API is operational'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      }, 
      { status: 500 }
    );
  }
}