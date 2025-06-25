import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { clerkGmailIntegration } from '@/lib/services/clerk-gmail-integration';

// Validation schema for input data
const sendEmailSchema = z.object({
  to: z.string().email({ message: 'Invalid recipient email address.' }),
  subject: z.string().min(1, { message: 'Subject cannot be empty.' }),
  body: z.string().min(1, { message: 'Email body cannot be empty.' }),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Validate input data
    const body = await req.json();
    const validationResult = sendEmailSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input data.', 
          details: validationResult.error.flatten().fieldErrors 
        }, 
        { status: 400 }
      );
    }

    const { to, subject, body: emailBody } = validationResult.data;

    // 2. Get the Gmail adapter for the user
    const gmailAdapter = await clerkGmailIntegration.getGmailAdapter(userId);

    // 3. Send the email
    const result = await gmailAdapter.sendEmail({
      to: [to],
      subject,
      body: emailBody,
      isHTML: false, // Assuming plain text for notifications, can be changed to true if needed
    });

    if (!result.success) {
      throw new Error(result.error || 'An error occurred while sending the email via Gmail.');
    }

    return NextResponse.json({ success: true, message: 'Notification sent successfully.' });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error on server.';
    console.error('Error sending notification:', errorMessage);

    // Provide a specific error message if the agent is not connected to Gmail
    if (errorMessage.includes('User does not have a Gmail account connected')) {
        return NextResponse.json(
            {
              error: 'Gmail account is not connected.',
              details: 'You must connect your Gmail account from the Settings page to send notifications.',
            },
            { status: 403 } // Forbidden
          );
    }

    return NextResponse.json(
      {
        error: 'Could not send notification.',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
} 