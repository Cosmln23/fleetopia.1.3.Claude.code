import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(request: Request) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { conversationId } = await request.json();

    if (!conversationId) {
        return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    // Using raw SQL to bypass persistent type generation issues
    await prisma.$executeRaw(
      Prisma.sql`UPDATE "ChatMessage" SET "read" = true WHERE "cargoOfferId" = ${conversationId} AND "senderId" != ${userId} AND "read" = false`
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[CHAT_MARK_AS_READ_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 