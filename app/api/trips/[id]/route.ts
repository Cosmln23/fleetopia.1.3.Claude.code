import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { updateTripSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

// GET /api/trips/[id] - Get single trip
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tripId = params.id;

    const trip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        OR: [
          {
            cargo: {
              userId: userId
            }
          },
          {
            vehicle: {
              fleet: {
                userId: userId
              }
            }
          }
        ]
      },
      include: {
        cargo: {
          select: {
            id: true,
            title: true,
            fromCity: true,
            toCity: true,
            fromAddress: true,
            toAddress: true,
            weight: true,
            price: true,
            urgency: true,
            status: true,
            pickupLat: true,
            pickupLng: true,
            deliveryLat: true,
            deliveryLng: true,
            deadline: true
          }
        },
        vehicle: {
          select: {
            id: true,
            name: true,
            licensePlate: true,
            type: true,
            status: true,
            currentLat: true,
            currentLng: true,
            capacityKg: true,
            vehicleType: true,
            fuelConsumption: true
          }
        }
      }
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(trip);

  } catch (error) {
    console.error('Error fetching trip:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/trips/[id] - Update trip
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tripId = params.id;
    const body = await request.json();
    
    // Validate input
    const validatedData = updateTripSchema.parse(body);

    // Check if trip exists and user has access
    const existingTrip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        OR: [
          {
            cargo: {
              userId: userId
            }
          },
          {
            vehicle: {
              fleet: {
                userId: userId
              }
            }
          }
        ]
      }
    });

    if (!existingTrip) {
      return NextResponse.json(
        { error: 'Trip not found or access denied' },
        { status: 404 }
      );
    }

    // Update trip
    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: validatedData,
      include: {
        cargo: {
          select: {
            id: true,
            title: true,
            fromCity: true,
            toCity: true,
            weight: true,
            price: true,
            urgency: true
          }
        },
        vehicle: {
          select: {
            id: true,
            name: true,
            licensePlate: true,
            type: true
          }
        }
      }
    });

    return NextResponse.json(updatedTrip);

  } catch (error) {
    console.error('Error updating trip:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/trips/[id] - Delete trip
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tripId = params.id;

    // Check if trip exists and user has access
    const existingTrip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        OR: [
          {
            cargo: {
              userId: userId
            }
          },
          {
            vehicle: {
              fleet: {
                userId: userId
              }
            }
          }
        ]
      }
    });

    if (!existingTrip) {
      return NextResponse.json(
        { error: 'Trip not found or access denied' },
        { status: 404 }
      );
    }

    // Only allow deletion of SUGGESTED trips
    if (existingTrip.status !== 'SUGGESTED') {
      return NextResponse.json(
        { error: 'Can only delete suggested trips' },
        { status: 400 }
      );
    }

    // Delete trip
    await prisma.trip.delete({
      where: { id: tripId }
    });

    return NextResponse.json({ message: 'Trip deleted successfully' });

  } catch (error) {
    console.error('Error deleting trip:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}