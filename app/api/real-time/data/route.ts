import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user's fleets
    const userFleets = await prisma.fleet.findMany({
      where: { userId: session.user.id },
      select: { id: true }
    });

    const fleetIds = userFleets.map(fleet => fleet.id);

    // If user has no fleets, return empty array
    if (fleetIds.length === 0) {
      return NextResponse.json({ vehicles: [] });
    }

    // Find vehicles belonging to user's fleets
    const vehicles = await prisma.vehicle.findMany({
      where: {
        fleetId: { in: fleetIds }
      }
    });

    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error('Failed to fetch real-time data:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 