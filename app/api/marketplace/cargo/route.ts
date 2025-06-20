import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CargoOffer, CargoStatus } from '@prisma/client';
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
    console.log('=== POST CARGO OFFER START ===');
    
    console.log('1. Getting auth...');
    const { userId } = await auth();
    console.log('2. Auth result:', { userId: userId ? 'PRESENT' : 'NULL', userIdLength: userId?.length });
    
    if (!userId) {
      console.log('3. No userId - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('4. Reading request body...');
    const body = await request.json();
    console.log('5. Body received:', { 
      hasTitle: !!body.title,
      hasFromAddress: !!body.fromAddress,
      hasToAddress: !!body.toAddress,
      hasWeight: !!body.weight,
      hasPrice: !!body.price
    });
    
    console.log('6. Starting validation...');
    const validation = createCargoOfferSchema.safeParse(body);
    console.log('7. Validation result:', { 
      success: validation.success, 
      errorCount: validation.success ? 0 : validation.error.errors.length 
    });
    
    if (!validation.success) {
      console.log('8. Validation failed:', validation.error.errors);
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          message: 'Invalid request body',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    console.log('9. Extracting validated data...');
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

    console.log('10. Preparing prisma create...');
    console.log('11. Data to create:', {
      title,
      fromCountry,
      toCountry,
      weight,
      price,
      userId: userId ? 'PRESENT' : 'NULL'
    });

    console.log('12. Creating cargo offer in database...');
    const newCargoOffer = await prisma.cargoOffer.create({
      data: {
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
        status: CargoStatus.NEW,
        userId: userId,
      },
    });

    console.log('13. Cargo offer created successfully:', { id: newCargoOffer.id });

    console.log('14. Creating system alert...');
    // Create a system alert
    await prisma.systemAlert.create({
      data: {
        message: `New cargo offer: ${newCargoOffer.title} from ${newCargoOffer.fromCountry} to ${newCargoOffer.toCountry}`,
        type: 'cargo',
        relatedId: newCargoOffer.id,
      },
    });

    console.log('15. System alert created');

    // Send real-time notification to all dispatchers
    try {
      console.log('16. Sending real-time notification...');
      await dispatcherEvents.emitToAll('new-cargo', {
        id: newCargoOffer.id,
        title: newCargoOffer.title,
        fromCountry: newCargoOffer.fromCountry,
        toCountry: newCargoOffer.toCountry,
        urgency: newCargoOffer.urgency,
        price: newCargoOffer.price,
        timestamp: new Date().toISOString()
      });
      console.log('17. Real-time notification sent successfully');
    } catch (eventError) {
      console.log('17. Real-time notification failed:', eventError);
    }

    console.log('18. Returning success response');
    return NextResponse.json({ 
      success: true, 
      data: newCargoOffer 
    }, { status: 201 });

  } catch (error) {
    console.error('=== POST CARGO OFFER ERROR ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Full error object:', error);
    console.error('=== END ERROR DETAILS ===');
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 
