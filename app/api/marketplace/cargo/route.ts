import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CargoOffer } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cargoQuerySchema, createCargoOfferSchema } from '@/lib/validations';
import { dbUtils } from '@/lib/db-utils';
import { dispatcherEvents } from '@/lib/dispatcher-events';

// GET all cargo offers with optional filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const url = new URL(request.url);
    
    // Parse query parameters
    const fromLocation = url.searchParams.get('fromLocation');
    const toLocation = url.searchParams.get('toLocation');
    const maxWeight = url.searchParams.get('maxWeight') ? parseFloat(url.searchParams.get('maxWeight')!) : undefined;
    const listType = url.searchParams.get('listType') || 'all';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const offset = (page - 1) * limit;
    const filters: any = {};

    // Handle different list types with proper authorization
    if (listType === 'my_offers') {
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      filters.userId = session.user.id;
    } else if (listType === 'accepted_offers') {
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      filters.acceptedByUserId = session.user.id;
      filters.status = { in: ['TAKEN', 'COMPLETED'] };
    } else if (listType === 'conversations') {
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      filters.OR = [
        { userId: session.user.id },
        { acceptedByUserId: session.user.id }
      ];
      filters.status = 'TAKEN';
    } else if (listType === 'all' || !listType) {
      filters.status = { in: ['NEW', 'TAKEN'] };
    } else {
      return NextResponse.json({ error: 'Invalid listType parameter' }, { status: 400 });
    }

    // Apply location filters
    if (fromLocation) {
      filters.fromCountry = { contains: fromLocation, mode: 'insensitive' };
    }
    if (toLocation) {
      filters.toCountry = { contains: toLocation, mode: 'insensitive' };
    }
    if (maxWeight) {
      filters.weight = { lte: maxWeight };
    }
    
    // Use cached query for better performance - wrap in try/catch
    let result;
    try {
      result = await dbUtils.getCargoOffers(filters, page, limit);
    } catch (dbError) {
      console.warn('[API_CARGO_GET] Database query failed:', dbError);
      // Return empty result instead of error
      result = { cargoOffers: [], pagination: { page, limit, total: 0, pages: 0 } };
    }

    return NextResponse.json({ success: true, data: result });

  } catch (error) {
    console.warn('[API_CARGO_GET] Failed to fetch cargo offers:', error);
    // Return empty result instead of throwing error
    return NextResponse.json({ 
      success: true, 
      data: { cargoOffers: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } }
    });
  }
}

// POST a new cargo offer
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
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
      title, fromAddress, fromCountry, fromCity, toAddress, toCountry, toCity, weight,
      loadingDate, deliveryDate, price,
      fromPostalCode, toPostalCode, volume, cargoType, priceType,
      requirements, urgency
    } = validation.data;

    const userId = session.user.id;
    const companyNameFromSession = session.user.name;

    // Validate delivery date is after loading date
    const loadingDateTime = new Date(loadingDate);
    const deliveryDateTime = new Date(deliveryDate);
    
    if (deliveryDateTime <= loadingDateTime) {
      return NextResponse.json(
        { error: 'Delivery date must be after loading date' },
        { status: 400 }
      );
    }

    const dataToCreate = {
      title,
      fromAddress,
      fromCountry,
      fromCity,
      fromPostalCode: fromPostalCode || null,
      toAddress,
      toCountry,
      toCity,
      toPostalCode: toPostalCode || null,
      weight,
      volume: volume || null,
      cargoType,
      loadingDate: loadingDateTime,
      deliveryDate: deliveryDateTime,
      price,
      priceType,
      companyName: companyNameFromSession,
      requirements,
      urgency,
      user: {
        connect: {
          id: userId,
        },
      },
    };

    const newCargoOffer = await dbUtils.createCargoOffer(dataToCreate, userId);

    // Create a system alert
    await prisma.systemAlert.create({
      data: {
        message: `New cargo offer: ${newCargoOffer.title} from ${newCargoOffer.fromCountry} to ${newCargoOffer.toCountry}`,
        type: 'cargo',
        relatedId: newCargoOffer.id,
      },
    });

    // Send real-time notification to all dispatchers
    try {
      await dispatcherEvents.emitToAll('new-cargo', {
        id: newCargoOffer.id,
        title: newCargoOffer.title,
        fromCountry: newCargoOffer.fromCountry,
        toCountry: newCargoOffer.toCountry,
        urgency: newCargoOffer.urgency,
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
    console.error('[API_CARGO_POST] Error creating cargo offer:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 
