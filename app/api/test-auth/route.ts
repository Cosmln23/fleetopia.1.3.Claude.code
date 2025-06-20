import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    console.log('=== TEST AUTH ENDPOINT ===');
    
    console.log('1. Getting auth...');
    const authResult = await auth();
    console.log('2. Auth result:', authResult);
    
    const { userId } = authResult;
    console.log('3. Extracted userId:', userId);
    
    // Test environment variables
    const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    
    console.log('4. Environment check:', {
      hasPublishableKey: !!clerkPublishableKey,
      hasSecretKey: !!clerkSecretKey,
      publishableKeyPrefix: clerkPublishableKey?.substring(0, 10),
      secretKeyPrefix: clerkSecretKey?.substring(0, 10)
    });
    
    return NextResponse.json({
      success: true,
      auth: {
        userId: userId || 'NULL',
        hasUserId: !!userId,
        userIdType: typeof userId
      },
      environment: {
        hasPublishableKey: !!clerkPublishableKey,
        hasSecretKey: !!clerkSecretKey,
        publishableKeyPrefix: clerkPublishableKey?.substring(0, 15) + '...',
        nodeEnv: process.env.NODE_ENV
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('=== AUTH TEST ERROR ===');
    console.error('Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error?.constructor?.name,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 