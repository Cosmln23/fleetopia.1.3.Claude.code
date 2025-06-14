import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all cargo offers with optional filtering
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fromLocation = searchParams.get('fromLocation');
  const toLocation = searchParams.get('toLocation');
  const maxWeight = searchParams.get('maxWeight');

  const where: any = {};

  if (fromLocation) {
    where.fromLocation = { contains: fromLocation, mode: 'insensitive' };
  }
  if (toLocation) {
    where.toLocation = { contains: toLocation, mode: 'insensitive' };
  }
  if (maxWeight) {
    where.weight = { lte: parseFloat(maxWeight) };
  }


  try {
    const cargoOffers = await prisma.cargoOffer.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(cargoOffers);
  } catch (error) {
    console.error('Error fetching cargo offers:', error);
    return NextResponse.json({ message: 'Error fetching cargo offers' }, { status: 500 });
  }
}

// POST a new cargo offer
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      fromLocation,
      toLocation,
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

    if (!title || !fromLocation || !toLocation || !weight || !loadingDate || !deliveryDate || !price) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const newCargoOffer = await prisma.cargoOffer.create({
      data: {
        title,
        fromLocation,
        toLocation,
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
      },
    });

    // Create a system alert for the AI Dispatcher
    await prisma.systemAlert.create({
      data: {
        message: `New cargo posted: ${title} from ${fromLocation} to ${toLocation}.`,
        type: urgency === 'high' ? 'urgent' : 'info',
      },
    });

    return NextResponse.json(newCargoOffer, { status: 201 });
  } catch (error) {
    console.error('Error creating cargo offer:', error);
    return NextResponse.json({ message: 'Error creating cargo offer' }, { status: 500 });
  }
} 