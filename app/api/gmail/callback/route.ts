import { NextRequest, NextResponse } from 'next/server';
import { clerkGmailIntegration } from '@/lib/services/clerk-gmail-integration';

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // This is the userId
    const error = searchParams.get('error');

    if (error) {
      console.error('Error from Google OAuth:', error);
      return NextResponse.redirect(`${appUrl}/settings?error=gmail_oauth_failed&details=${encodeURIComponent(error)}`);
    }

    if (!code || !state) {
      console.error('Missing parameters in Google OAuth callback');
      return NextResponse.redirect(`${appUrl}/settings?error=gmail_missing_params`);
    }

    const userId = state;

    // Exchange the code for tokens and save them
    const tokens = await clerkGmailIntegration.exchangeCodeForTokens(code);
    await clerkGmailIntegration.saveGmailTokens(userId, tokens);

    // Redirect the user back to the settings page with a success message
    return NextResponse.redirect(`${appUrl}/settings?success=gmail_connected`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in Gmail callback process:', errorMessage);
    return NextResponse.redirect(`${appUrl}/settings?error=gmail_callback_failed&details=${encodeURIComponent(errorMessage)}`);
  }
} 