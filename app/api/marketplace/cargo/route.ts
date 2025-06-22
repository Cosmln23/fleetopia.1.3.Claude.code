import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { CargoStatus } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';
import { createCargoOfferSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

// GET all cargo offers with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const listType = url.searchParams.get('listType') || 'all';

    const whereConditions: any = {};

    if (listType === 'all') {
      whereConditions.status = 'NEW';
    } else if (listType === 'my_offers') {
      whereConditions.userId = userId;
    } else if (listType === 'accepted_offers') {
      whereConditions.acceptedByUserId = userId;
    } else if (listType === 'conversations') {
      whereConditions.OR = [
        { userId: userId },
        { OfferRequest: { some: { transporterId: userId } } },
      ];
    }

    const cargoOffers = await prisma.cargoOffer.findMany({
      where: whereConditions,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: cargoOffers });
  } catch (error) {
    console.error('Failed to fetch cargo offers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST a new cargo offer
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const validation = createCargoOfferSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.errors }, { status: 400 });
    }
    
    const data = validation.data;

    const newCargoOffer = await prisma.cargoOffer.create({
      data: {
        ...data,
        userId: userId,
        status: CargoStatus.NEW,
      },
    });

    return NextResponse.json({ success: true, data: newCargoOffer }, { status: 201 });

  } catch (error) {
    console.error('Failed to create cargo offer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
