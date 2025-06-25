import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { clerkGmailIntegration } from '@/lib/services/clerk-gmail-integration';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if environment variables are set
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error('Google OAuth credentials are not configured in .env.local');
      return NextResponse.json(
        {
          error: 'Gmail integration is not configured on the server.',
          details: 'Missing Google OAuth credentials in environment variables.',
        },
        { status: 503 } // Service Unavailable
      );
    }

    const authUrl = clerkGmailIntegration.getAuthUrl(userId);

    return NextResponse.json({ success: true, authUrl });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating Gmail authorization URL:', errorMessage);
    return NextResponse.json(
      {
        error: 'Could not generate authorization URL.',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
} 