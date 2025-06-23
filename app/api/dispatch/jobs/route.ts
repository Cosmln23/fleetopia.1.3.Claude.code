import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

// Define the possible statuses based on the Prisma schema enum
const validCargoStatuses = ['NEW', 'TAKEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'];

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');

  let whereClause: any = {
    NOT: {
      status: 'NEW',
    },
  };

  if (statusParam) {
    const statuses = statusParam.split(',');
    // Convert to uppercase FIRST, then filter for valid enum values
    const validStatuses = statuses
      .map(s => s.toUpperCase())
      .filter(s => validCargoStatuses.includes(s));
    
    if (validStatuses.length > 0) {
       whereClause = {
         status: {
           in: validStatuses,
         },
       };
    }
  }

    const jobs = await prisma.cargoOffer.findMany({
      where: whereClause,
      orderBy: {
        updatedAt: 'desc',
      },
    });
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Failed to fetch dispatch jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dispatch jobs' },
      { status: 500 }
    );
  }
} 
