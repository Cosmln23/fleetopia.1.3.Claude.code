import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all cargo offers
export async function GET() {
  try {
    const cargoOffers = await prisma.cargoOffer.findMany({
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