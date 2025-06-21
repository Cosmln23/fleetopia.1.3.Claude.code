import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const event = payload.data;

    if (payload.type === 'user.created') {
      await prisma.user.create({
        data: {
          id: event.id,
          email: event.email_addresses[0]?.email_address,
          name: `${event.first_name || ''} ${event.last_name || ''}`.trim() || 'User',
          role: 'client',
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clerk webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}