import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import prisma from '@/lib/prisma';
import { createCargoOfferSchema } from '@/lib/validations';

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

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate request body
    const validation = createCargoOfferSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const {
      title,
      fromCountry,
      toCountry,
      fromPostalCode,
      toPostalCode,
      fromCity,
      toCity,
      fromAddress,
      toAddress,
      weight,
      volume,
      cargoType,
      price,
      priceType,
      loadingDate,
      deliveryDate,
      companyName,
      requirements,
      urgency
    } = validation.data;

    // Create cargo offer
    const cargoOffer = await prisma.cargoOffer.create({
      data: {
        title: title || `${fromCity} → ${toCity}`,
        fromCountry,
        toCountry,
        fromPostalCode,
        toPostalCode,
        fromCity,
        toCity,
        fromAddress,
        toAddress,
        weight,
        volume,
        cargoType,
        price,
        priceType,
        loadingDate,
        deliveryDate,
        companyName,
        requirements,
        urgency,
        userId: user.id,
        status: 'NEW'
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: cargoOffer 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating cargo offer:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}