import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { CargoOffer, CargoStatus } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';
import { cargoQuerySchema, createCargoOfferSchema } from '@/lib/validations';
// import { dbUtils } from '@/lib/db-utils';
// import { dispatcherEvents } from '@/lib/dispatcher-events';

export const dynamic = 'force-dynamic';

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
    
    if (status && Object.values(CargoStatus).includes(status as CargoStatus)) {
      whereConditions.status = status as CargoStatus;
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
          fromCountry: true,
          toCountry: true,
          fromCity: true,
          toCity: true,
          weight: true,
          price: true,
          status: true,
          cargoType: true,
          loadingDate: true,
          deliveryDate: true,
          createdAt: true,
          userId: true,
          companyName: true,
          companyRating: true,
          distance: true,
          volume: true,
          requirements: true,
          urgency: true,
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
    console.log('=== CARGO POST START ===');
    
    const { userId } = await auth();
    console.log('Auth userId:', userId);
    
    if (!userId) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Testing Prisma connection...');
    
    // Test basic Prisma query first
    try {
      const testCount = await prisma.user.count();
      console.log('Prisma connection OK, user count:', testCount);
    } catch (prismaError: any) {
      console.error('Prisma connection failed:', prismaError);
      throw new Error(`Database connection failed: ${prismaError.message}`);
    }

    // Verify if user exists in database, create if missing
    console.log('Checking if user exists...');
    let user = await prisma.user.findUnique({ where: { id: userId } });
    console.log('User found:', !!user);
    
    if (!user) {
      console.log('Creating new user...');
      user = await prisma.user.create({
        data: {
          id: userId,
          role: 'client',
        }
      });
      console.log('User created:', user.id);
    }

    const body = await request.json();
    console.log('Received request body:', body);
    const validation = createCargoOfferSchema.safeParse(body);
    
    if (!validation.success) {
      console.error('Validation failed:', validation.error.errors);
      return new NextResponse(JSON.stringify({
        error: 'Validation failed',
        message: 'Invalid request body',
        details: validation.error.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const {
      title,
      fromAddress,
      fromCountry,
      fromCity,
      fromPostalCode,
      toAddress,
      toCountry,
      toCity,
      toPostalCode,
      weight,
      volume,
      price,
      priceType,
      cargoType,
      loadingDate,
      deliveryDate,
      requirements,
      urgency,
      companyName
    } = validation.data;

    console.log('Creating cargo offer with data:', validation.data);

    const newCargoOffer = await prisma.cargoOffer.create({
      data: {
        userId: userId,
        title,
        fromAddress,
        fromCountry,
        fromCity,
        toAddress,
        toCountry,
        toCity,
        weight,
        price,
        cargoType,
        loadingDate: new Date(loadingDate),
        deliveryDate: new Date(deliveryDate),
        fromPostalCode,
        toPostalCode,
        volume,
        priceType,
        requirements,
        urgency,
        companyName,
        status: CargoStatus.NEW
      },
    });

    console.log('Successfully created cargo offer:', newCargoOffer.id);

    // Create a system alert
    console.log('Creating system alert...');
    await prisma.systemAlert.create({
      data: {
        message: `New cargo offer: ${newCargoOffer.title} from ${newCargoOffer.fromCountry} to ${newCargoOffer.toCountry}`,
        type: 'cargo',
        relatedId: newCargoOffer.id,
      },
    });

    // Send real-time notification to all dispatchers - TEMPORARILY DISABLED FOR DEBUGGING
    // try {
    //   await dispatcherEvents.emitToAll('new-cargo', {
    //     id: newCargoOffer.id,
    //     title: newCargoOffer.title,
    //     fromCountry: newCargoOffer.fromCountry,
    //     toCountry: newCargoOffer.toCountry,
    //     urgency: newCargoOffer.urgency,
    //     price: newCargoOffer.price,
    //     timestamp: new Date().toISOString()
    //   });
    // } catch (eventError) {
    //   console.log('Real-time notification failed:', eventError);
    // }

    return new NextResponse(JSON.stringify({
      success: true,
      data: newCargoOffer
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('=== CARGO CREATE ERROR ===');
    console.error('Error details:', error);
    if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
    }
    // The next two lines might fail if 'body' or 'validation' are not defined,
    // so we wrap them in a try-catch block for safety.
    try {
      const parsedBody = await (request as any)._body;
      console.error('Request body was:', parsedBody);
      // Also log validation data if it exists
      const validationResult = createCargoOfferSchema.safeParse(parsedBody);
      if (validationResult.success) {
        console.error('Validation data was:', validationResult.data);
      } else {
        console.error('Validation failed, errors:', validationResult.error.errors);
      }
    } catch (e) {
      console.error('Could not log request body or validation data.');
    }
    
    return new NextResponse(JSON.stringify({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : 'No stack trace'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 
