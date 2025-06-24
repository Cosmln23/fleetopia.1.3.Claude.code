import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const before = searchParams.get('before');
    
    try {
      // Try to get real cargo offers from database
      let whereClause: any = {
        status: 'available'
      };

      if (before) {
        const beforeDate = new Date(before);
        whereClause.createdAt = {
          lte: beforeDate
        };
      }

      const cargoOffers = await prisma.cargoOffer.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc'
        },
        take: 10,
        select: {
          id: true,
          title: true,
          fromCity: true,
          toCity: true,
          weight: true,
          price: true,
          status: true,
          description: true,
          createdAt: true,
          updatedAt: true
        }
      });

      // Return real data only - no fallback to mock data
      return NextResponse.json(cargoOffers);
      
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error fetching cargo offers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}