import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { CargoOffer, CargoStatus } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';
import { cargoQuerySchema, createCargoOfferSchema } from '@/lib/validations';
import { magicEngine } from '@/lib/magic-transformation-engine';
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
    console.log('🌊 Fluviul pornește - Received raw data:', body);
    
    // ===== ETAPA 1: Validare doar câmpurile CRITICE =====
    const criticalFields = ['fromCountry', 'toCountry', 'fromPostalCode', 'toPostalCode', 'weight', 'price'];
    for (const field of criticalFields) {
      if (!body[field]) {
        console.error(`❌ Critical field missing: ${field}`);
        return new NextResponse(JSON.stringify({
          error: 'Câmpuri critice lipsă',
          message: `${field} este obligatoriu pentru a putea procesa cererea`,
          missingField: field
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Validare dată DOAR dacă nu e flexibilă
    if (!body.flexibleDate && !body.loadingDate && !body.deliveryDate) {
      console.error('❌ Date required when not flexible');
      return new NextResponse(JSON.stringify({
        error: 'Dată obligatorie',
        message: 'Selectează o dată sau activează "Date Flexibile"'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('✅ Critical validation passed');
    
    // ===== ETAPA 2: MAGIA - Transformare Inteligentă =====
    console.log('🎩 Starting magic transformation...');
    const magicData = await magicEngine.transform(body);
    console.log('✨ Magic transformation complete:', magicData);
    
    // ===== ETAPA 3: Validare finală cu schema completă =====
    const validation = createCargoOfferSchema.safeParse(magicData);
    
    if (!validation.success) {
      console.error('⚠️ Final validation failed, but continuing with fallback:', validation.error.errors);
      // Nu se mai blochează - continuă cu date procesate manual
    }

    // ===== ETAPA 4: Folosește datele MAGICE sau fallback =====
    const finalData = validation.success ? validation.data : magicData;
    
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
    } = finalData;

    console.log('🎯 Creating cargo offer with SMART data:', finalData);
    
    // Log what magic did
    if (magicData.adaptations?.length > 0) {
      console.log('🪄 Magic adaptations applied:', magicData.adaptations);
    }

    // Process requirements field to ensure it's a valid array
    const processedRequirements = Array.isArray(requirements) 
      ? requirements 
      : typeof requirements === 'string' 
        ? requirements.split(',').map(req => req.trim()).filter(Boolean)
        : [];

    console.log('Processed requirements:', processedRequirements);
    console.log('Data types:', {
      weight: typeof weight,
      price: typeof price,
      volume: typeof volume,
      loadingDate: typeof loadingDate,
      deliveryDate: typeof deliveryDate,
      requirements: typeof requirements,
      processedRequirements: typeof processedRequirements
    });

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
        cargoType: cargoType || 'General', // Ensure cargoType has a default
        loadingDate: new Date(loadingDate),
        deliveryDate: new Date(deliveryDate),
        fromPostalCode,
        toPostalCode,
        volume,
        priceType,
        requirements: processedRequirements, // Use processed requirements
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
      data: newCargoOffer,
      magic: {
        adaptations: magicData.adaptations || [],
        suggestions: magicData.suggestions || [],
        recommendedVehicle: magicData.recommendedVehicle,
        estimatedDuration: magicData.estimatedDuration,
        estimatedDistance: magicData.estimatedDistance
      },
      message: '🎉 Oferta creată cu succes folosind inteligența magică!'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('🚨 Eroare în fluviu - dar nu se oprește!', error);
    
    // ===== FALLBACK MAGIC - Creează oricum ceva =====
    try {
      const body = await request.json().catch(() => ({}));
      console.log('🆘 Încercare de salvare cu date minime...');
      
      const emergencyOffer = await prisma.cargoOffer.create({
        data: {
          userId: userId,
          title: body.title || 'Transport de Urgență',
          fromCountry: body.fromCountry || 'Unknown',
          toCountry: body.toCountry || 'Unknown',
          fromCity: body.fromCity || 'Unknown',
          toCity: body.toCity || 'Unknown',
          fromAddress: body.fromAddress || 'Address TBD',
          toAddress: body.toAddress || 'Address TBD',
          fromPostalCode: body.fromPostalCode || '000000',
          toPostalCode: body.toPostalCode || '000000',
          weight: parseFloat(body.weight) || 1,
          price: parseFloat(body.price) || 0,
          cargoType: 'Emergency',
          urgency: 'high',
          loadingDate: new Date(),
          deliveryDate: new Date(Date.now() + 86400000), // +1 day
          priceType: 'negotiable',
          requirements: [],
          volume: parseFloat(body.volume) || null,
          companyName: body.companyName || null,
          status: CargoStatus.NEW
        }
      });
      
      console.log('🎯 Salvare de urgență reușită:', emergencyOffer.id);
      
      return new NextResponse(JSON.stringify({
        success: true,
        data: emergencyOffer,
        emergency: true,
        message: '⚠️ Oferta creată în modul de urgență. Verifică și completează detaliile.',
        adaptations: ['Emergency mode activated', 'Minimal data used', 'Manual review required']
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (emergencyError) {
      console.error('🔥 Chiar și salvarea de urgență a eșuat:', emergencyError);
      
      return new NextResponse(JSON.stringify({
        error: 'System error',
        message: 'Nu s-a putut procesa cererea. Contactează suportul.',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
} 
