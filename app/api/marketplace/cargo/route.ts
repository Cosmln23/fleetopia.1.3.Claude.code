import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { CargoStatus } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';
import { createCargoOfferSchema, createCargoOfferWithGeoValidationSchema } from '@/lib/validations';

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
    console.log('=== CARGO POST API START ===');
    const { userId } = await auth();
    console.log('Auth userId:', userId);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Request body received:', JSON.stringify(body, null, 2));

    const validation = createCargoOfferSchema.safeParse(body);

    if (!validation.success) {
      console.error('Validation failed:', validation.error.errors);
      return NextResponse.json({ error: 'Validation failed', details: validation.error.errors }, { status: 400 });
    }
    
    const data = validation.data;
    console.log('Validated data:', JSON.stringify(data, null, 2));

    // Additional geographic validation if addresses are provided
    if ((data.fromAddress && data.fromPostalCode) || (data.toAddress && data.toPostalCode)) {
      console.log('Performing geographic validation...');
      
      const geoValidation = await createCargoOfferWithGeoValidationSchema.safeParseAsync(body);
      
      if (!geoValidation.success) {
        console.error('Geographic validation failed:', geoValidation.error.errors);
        return NextResponse.json({ 
          error: 'Address validation failed', 
          details: geoValidation.error.errors,
          message: 'Please verify that your addresses, cities, and postal codes are correct and exist on maps.'
        }, { status: 400 });
      }
    }

    // Check if all required fields are present for Prisma
    const prismaData = {
      ...data,
      userId: userId,
      status: CargoStatus.NEW,
    };
    
    console.log('Prisma data to create:', JSON.stringify(prismaData, null, 2));

    const newCargoOffer = await prisma.cargoOffer.create({
      data: prismaData,
    });

    console.log('Cargo offer created successfully:', newCargoOffer.id);
    return NextResponse.json({ success: true, data: newCargoOffer }, { status: 201 });

  } catch (error) {
    console.error('Failed to create cargo offer - DETAILED ERROR:', error);
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 });
  }
} 
