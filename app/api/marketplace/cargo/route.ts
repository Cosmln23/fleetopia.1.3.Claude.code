import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CargoOffer } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';
import { cargoQuerySchema, createCargoOfferSchema } from '@/lib/validations';
import { dbUtils } from '@/lib/db-utils';
import { dispatcherEvents } from '@/lib/dispatcher-events';

// GET all cargo offers with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any = {};
    
    if (status) {
      whereConditions.status = status;
    }
    
    if (type) {
      whereConditions.cargoType = type;
    }

    // Find cargo offers with pagination
    const [cargoOffers, totalCount] = await Promise.all([
      prisma.cargoOffer.findMany({
        where: whereConditions,
        select: {
          id: true,
          title: true,
          description: true,
          origin: true,
          destination: true,
          weight: true,
          price: true,
          status: true,
          cargoType: true,
          pickupDate: true,
          deliveryDate: true,
          createdAt: true,
          userId: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.cargoOffer.count({
        where: whereConditions,
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        cargoOffers,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch cargo offers:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
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
    
    // Basic validation using zod schema
    const validation = createCargoOfferSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          message: 'Invalid request body',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      origin,
      destination,
      weight,
      price,
      cargoType,
      pickupDate,
      deliveryDate,
      originPostalCode,
      destinationPostalCode
    } = validation.data;

    const newCargoOffer = await prisma.cargoOffer.create({
      data: {
        title,
        description,
        origin,
        destination,
        weight,
        price,
        cargoType,
        pickupDate: new Date(pickupDate),
        deliveryDate: new Date(deliveryDate),
        originPostalCode,
        destinationPostalCode,
        status: 'available',
        userId: userId,
      },
    });

    // Create a system alert
    await prisma.systemAlert.create({
      data: {
        message: `New cargo offer: ${newCargoOffer.title} from ${newCargoOffer.origin} to ${newCargoOffer.destination}`,
        type: 'cargo',
        relatedId: newCargoOffer.id,
      },
    });

    // Send real-time notification to all dispatchers
    try {
      await dispatcherEvents.emitToAll('new-cargo', {
        id: newCargoOffer.id,
        title: newCargoOffer.title,
        fromCountry: newCargoOffer.origin,
        toCountry: newCargoOffer.destination,
        urgency: newCargoOffer.cargoType,
        price: newCargoOffer.price,
        timestamp: new Date().toISOString()
      });
    } catch (eventError) {
      console.log('Real-time notification failed:', eventError);
      // Don't fail the main request if notifications fail
    }

    return NextResponse.json({ 
      success: true, 
      data: newCargoOffer 
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create cargo offer:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 
