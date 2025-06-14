import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany();

    // Prisma returns lat and lng as separate fields, so we just pass them through.
    // The previous error was because I was trying to destructure a non-existent 'location' object.
    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error('Failed to fetch real-time data:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 