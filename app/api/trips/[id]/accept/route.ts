import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// POST /api/trips/[id]/accept - Accept a trip suggestion
export async function POST(
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
        cargo: true,
        vehicle: true
      }
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'Trip not found or access denied' },
        { status: 404 }
      );
    }

    // Can only accept SUGGESTED trips
    if (trip.status !== 'SUGGESTED') {
      return NextResponse.json(
        { error: 'Can only accept suggested trips' },
        { status: 400 }
      );
    }

    // Check if cargo is still available
    if (!['NEW', 'OPEN'].includes(trip.cargo.status)) {
      return NextResponse.json(
        { error: 'Cargo is no longer available' },
        { status: 400 }
      );
    }

    // Check if vehicle is still available
    if (!['idle', 'assigned'].includes(trip.vehicle.status)) {
      return NextResponse.json(
        { error: 'Vehicle is no longer available' },
        { status: 400 }
      );
    }

    // Use transaction to ensure consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update trip status to ACCEPTED
      const updatedTrip = await tx.trip.update({
        where: { id: tripId },
        data: {
          status: 'ACCEPTED',
          updatedAt: new Date()
        },
        include: {
          cargo: {
            select: {
              id: true,
              title: true,
              fromCity: true,
              toCity: true,
              weight: true,
              price: true
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

      // Update cargo status to TAKEN
      await tx.cargoOffer.update({
        where: { id: trip.cargoId },
        data: {
          status: 'TAKEN',
          acceptedByUserId: userId,
          acceptedAt: new Date()
        }
      });

      // Update vehicle status to assigned
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: {
          status: 'assigned',
          lastUpdate: new Date()
        }
      });

      // Create assignment record for compatibility
      await tx.assignment.create({
        data: {
          cargoOfferId: trip.cargoId,
          vehicleId: trip.vehicleId,
          userId: userId,
          status: 'ACTIVE',
          assignedAt: new Date()
        }
      });

      return updatedTrip;
    });

    return NextResponse.json({
      ...result,
      message: 'Trip accepted successfully'
    });

  } catch (error) {
    console.error('Error accepting trip:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}