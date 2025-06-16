import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CargoOffer } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET all cargo offers with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromLocation = searchParams.get('fromLocation');
    const toLocation = searchParams.get('toLocation');
    const maxWeight = searchParams.get('maxWeight');
    const listType = searchParams.get('listType'); // e.g., 'my_offers', 'accepted_offers'
    const session = await getServerSession(authOptions);

    const filters: any = {};

    if (listType === 'my_offers') {
      if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      filters.userId = session.user.id;
    } else if (listType === 'accepted_offers') {
      if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      filters.acceptedByUserId = session.user.id;
      filters.status = { in: ['TAKEN', 'COMPLETED'] };
    } else if (listType === 'conversations') {
      if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      filters.OR = [
        { userId: session.user.id },
        { acceptedByUserId: session.user.id }
      ];
      filters.status = 'TAKEN';
    } else {
      filters.status = { in: ['NEW', 'TAKEN'] };
    }

    if (fromLocation) {
      filters.fromCountry = { contains: fromLocation, mode: 'insensitive' };
    }
    if (toLocation) {
      filters.toCountry = { contains: toLocation, mode: 'insensitive' };
    }
    if (maxWeight && !isNaN(parseFloat(maxWeight))) {
      filters.weight = { lte: parseFloat(maxWeight) };
    }
    
    const cargoOffers = await prisma.cargoOffer.findMany({
      where: filters,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(cargoOffers);

  } catch (error) {
    console.error('[API_CARGO_GET] Failed to fetch cargo offers:', error);
    return NextResponse.json(
      { error: 'Server error while fetching cargo offers.' },
      { status: 500 }
    );
  }
}

// POST a new cargo offer
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const companyNameFromSession = session.user.name; // Get company name from session
    const body = await request.json();
    
    const {
      title, fromAddress, fromCountry, fromCity, toAddress, toCountry, toCity, weight,
      loadingDate, deliveryDate, price,
      fromPostalCode, toPostalCode, volume, cargoType, priceType,
      requirements, urgency
    } = body;

    // Basic validation
    if (!title || !fromAddress || !fromCountry || !fromCity || !toAddress || !toCountry || !toCity || !weight || !loadingDate || !deliveryDate || !price) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const dataToCreate: any = {
      title,
      fromAddress,
      fromCountry,
      fromCity,
      fromPostalCode: fromPostalCode || null,
      toAddress,
      toCountry,
      toCity,
      toPostalCode: toPostalCode || null,
      weight: parseFloat(weight),
      volume: volume ? parseFloat(volume) : null,
      cargoType: cargoType || 'General',
      loadingDate: new Date(loadingDate),
      deliveryDate: new Date(deliveryDate),
      price: parseFloat(price),
      priceType: priceType || 'fixed',
      companyName: companyNameFromSession, // Use company name from session
      requirements: typeof requirements === 'string' ? requirements.split(',').map(req => req.trim()).filter(Boolean) : [],
      urgency: urgency || 'medium',
      user: {
        connect: {
          id: userId,
        },
      },
    };

    const newCargoOffer = await prisma.cargoOffer.create({
      data: dataToCreate,
    });

    // Create a system alert
    await prisma.systemAlert.create({
      data: {
        message: `New cargo offer: ${newCargoOffer.title} from ${newCargoOffer.fromCountry} to ${newCargoOffer.toCountry}`,
        type: 'cargo',
        relatedId: newCargoOffer.id,
      },
    });

    return NextResponse.json(newCargoOffer, { status: 201 });
  } catch (error) {
    console.error('[API_CARGO_POST] Error creating cargo offer:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Error creating cargo offer', error: errorMessage }, { status: 500 });
  }
} 