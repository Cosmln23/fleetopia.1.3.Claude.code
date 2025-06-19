import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CargoOffer } from '@prisma/client';
import { createApiHandler, apiResponse } from '@/lib/api-helpers';
import { cargoQuerySchema, createCargoOfferSchema } from '@/lib/validations';
import { rateLimiters } from '@/lib/rate-limit';
import { dbUtils } from '@/lib/db-utils';

// GET all cargo offers with optional filtering
export const GET = createApiHandler({
  rateLimiter: rateLimiters.search,
  querySchema: cargoQuerySchema
})(async ({ req, query, session }) => {
  try {
    const { fromLocation, toLocation, maxWeight, listType, page, limit } = query!;
    const offset = (page - 1) * limit;

    const filters: any = {};

    // Handle different list types with proper authorization
    if (listType === 'my_offers') {
      if (!session?.user?.id) return apiResponse.unauthorized();
      filters.userId = session.user.id;
    } else if (listType === 'accepted_offers') {
      if (!session?.user?.id) return apiResponse.unauthorized();
      filters.acceptedByUserId = session.user.id;
      filters.status = { in: ['TAKEN', 'COMPLETED'] };
    } else if (listType === 'conversations') {
      if (!session?.user?.id) return apiResponse.unauthorized();
      filters.OR = [
        { userId: session.user.id },
        { acceptedByUserId: session.user.id }
      ];
      filters.status = 'TAKEN';
    } else if (listType === 'all' || !listType) {
      filters.status = { in: ['NEW', 'TAKEN'] };
    } else {
      return apiResponse.error('Invalid listType parameter', 400);
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
    let result = [];
    try {
      result = await dbUtils.getCargoOffers(filters, page, limit);
    } catch (dbError) {
      console.warn('[API_CARGO_GET] Database query failed:', dbError);
      // Return empty array instead of error
      result = [];
    }

    return apiResponse.success(result);

  } catch (error) {
    console.warn('[API_CARGO_GET] Failed to fetch cargo offers:', error);
    // Return empty array instead of throwing error
    return apiResponse.success([]);
  }
});

// POST a new cargo offer
export const POST = createApiHandler({
  requireAuth: true,
  rateLimiter: rateLimiters.create,
  bodySchema: createCargoOfferSchema
})(async ({ session, body }) => {
  try {
    const {
      title, fromAddress, fromCountry, fromCity, toAddress, toCountry, toCity, weight,
      loadingDate, deliveryDate, price,
      fromPostalCode, toPostalCode, volume, cargoType, priceType,
      requirements, urgency
    } = body!;

    const userId = session.user.id;
    const companyNameFromSession = session.user.name;

    // Validate delivery date is after loading date
    const loadingDateTime = new Date(loadingDate);
    const deliveryDateTime = new Date(deliveryDate);
    
    if (deliveryDateTime <= loadingDateTime) {
      return apiResponse.error('Delivery date must be after loading date');
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
      const { dispatcherEvents } = await import('@/app/api/dispatcher/events/route');
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

    return apiResponse.success(newCargoOffer, 201);
  } catch (error) {
    console.error('[API_CARGO_POST] Error creating cargo offer:', error);
    throw error;
  }
}); 
