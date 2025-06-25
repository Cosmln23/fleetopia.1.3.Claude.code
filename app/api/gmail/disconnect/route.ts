import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clerkGmailIntegration } from '@/lib/services/clerk-gmail-integration';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await clerkGmailIntegration.disconnectGmail(userId);

    return NextResponse.json({ success: true, message: 'Gmail account disconnected successfully.' });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error disconnecting Gmail account:', errorMessage);
    return NextResponse.json(
      {
        error: 'Could not disconnect Gmail account.',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
} 