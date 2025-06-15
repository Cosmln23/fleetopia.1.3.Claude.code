import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// GET all cargo offers with optional filtering
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const weight = searchParams.get('weight');
  const urgency = searchParams.get('urgency');

  const filters: any = {};
  if (from) filters.fromLocation = { contains: from, mode: 'insensitive' };
  if (to) filters.toLocation = { contains: to, mode: 'insensitive' };
  if (weight) filters.weight = { gte: parseFloat(weight) };
  if (urgency) filters.urgency = urgency;

  try {
    const cargoOffers = await prisma.cargoOffer.findMany({
      where: filters,
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(cargoOffers);
  } catch (error) {
    console.error('Failed to fetch cargo offers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cargo offers' },
      { status: 500 }
    );
  }
}

// POST a new cargo offer
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      fromAddress,
      fromCountry,
      fromPostalCode,
      toAddress,
      toCountry,
      toPostalCode,
      weight,
      volume,
      cargoType,
      loadingDate,
      deliveryDate,
      price,
      priceType,
      companyName,
      requirements,
      urgency,
    } = body;

    if (!title || !fromAddress || !fromCountry || !toAddress || !toCountry || !weight || !loadingDate || !deliveryDate || !price) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const newCargoOffer = await prisma.cargoOffer.create({
      data: {
        title,
        fromAddress,
        fromCountry,
        fromPostalCode,
        toAddress,
        toCountry,
        toPostalCode,
        weight: parseFloat(weight),
        volume: volume ? parseFloat(volume) : null,
        cargoType,
        loadingDate: new Date(loadingDate),
        deliveryDate: new Date(deliveryDate),
        price: parseFloat(price),
        priceType,
        companyName: companyName || 'Private User',
        requirements: requirements || [],
        urgency,
        userId: null
      },
    });

    // Create a system alert
    await prisma.systemAlert.create({
      data: {
        message: `New cargo offer: ${newCargoOffer.title} from ${newCargoOffer.fromAddress}, ${newCargoOffer.fromCountry} to ${newCargoOffer.toAddress}, ${newCargoOffer.toCountry}`,
        type: 'cargo',
        relatedId: newCargoOffer.id,
      },
    });

    return NextResponse.json(newCargoOffer, { status: 201 });
  } catch (error) {
    console.error('Error creating cargo offer:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Error creating cargo offer', error: errorMessage }, { status: 500 });
  }
} 