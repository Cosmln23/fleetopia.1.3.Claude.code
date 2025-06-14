
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, performance } = body;

    const agent = await prisma.aIAgent.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(performance !== undefined && { performance }),
        updatedAt: new Date()
      }
    });

    return NextResponse.json(agent);
  } catch (error) {
    console.error('Update agent error:', error);
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
  }
}
