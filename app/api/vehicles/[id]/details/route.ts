import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';



export const dynamic = 'force-dynamic';
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const vehicleId = params.id;

    // First, verify that the vehicle belongs to the user
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        fleet: {
          userId: userId
        }
      }
    });

    if (!vehicle) {
      return NextResponse.json({ message: 'Vehicle not found or access denied.' }, { status: 404 });
    }

    // Find the most recent 'assigned' route for the vehicle
    const route = await prisma.route.findFirst({
      where: {
        vehicleId: vehicleId,
        // Optional: you might want to filter by status as well, 
        // e.g., only show details for 'assigned' or 'in_transit' routes
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!route || !route.cargoOfferId) {
      return NextResponse.json({ message: 'No assigned cargo details found for this vehicle.' }, { status: 404 });
    }

    // Fetch the cargo offer details using the ID from the route
    const cargoOffer = await prisma.cargoOffer.findUnique({
      where: {
        id: route.cargoOfferId,
      },
    });

    if (!cargoOffer) {
      return NextResponse.json({ message: 'Cargo offer details not found.' }, { status: 404 });
    }

    return NextResponse.json(cargoOffer);

  } catch (error) {
    console.error(`Error fetching vehicle details:`, error);
    return NextResponse.json({ error: 'Failed to fetch vehicle details' }, { status: 500 });
  }
} 