import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clerkGmailIntegration } from '@/lib/services/clerk-gmail-integration';

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = await clerkGmailIntegration.getConnectionStatus(userId);

    return NextResponse.json({ success: true, status });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error checking Gmail status:', errorMessage);
    return NextResponse.json(
      {
        error: 'Could not check Gmail connection status.',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
} 