import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vehicleId = params.id;

    // First, verify that the vehicle belongs to the user
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        fleet: {
          userId: session.user.id
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
    console.error(`Error fetching details for vehicle ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch vehicle details' }, { status: 500 });
  }
} 