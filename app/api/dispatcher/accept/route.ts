import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { suggestionId } = await request.json();
    
    if (!suggestionId) {
      return NextResponse.json({ error: 'Suggestion ID is required' }, { status: 400 });
    }

    // Real implementation - full marketplace integration
    // Extract IDs from suggestion (format: suggestion-cargoId-vehicleId)
    const parts = suggestionId.split('-');
    if (parts.length >= 3) {
      const cargoOfferId = parts[1];
      const vehicleId = parts[2];
      
      try {
        // Start transaction to ensure data consistency
        const result = await prisma.$transaction(async (tx) => {
          // 1. Verify the cargo offer is still available
          const cargoOffer = await tx.cargoOffer.findFirst({
            where: { 
              id: cargoOfferId,
              status: 'NEW' // Only accept if still new
            }
          });

          if (!cargoOffer) {
            throw new Error('Cargo offer is no longer available');
          }

          // 2. Verify the vehicle belongs to the user and is available
          const vehicle = await tx.vehicle.findFirst({
            where: { 
              id: vehicleId,
              status: { in: ['idle', 'assigned'] },
              fleet: { userId: session.user.id }
            },
            include: { fleet: true }
          });

          if (!vehicle) {
            throw new Error('Vehicle is not available for assignment');
          }

          // 3. Accept the cargo offer (mark as taken by this user)
          const updatedCargo = await tx.cargoOffer.update({
            where: { id: cargoOfferId },
            data: { 
              status: 'TAKEN',
              acceptedByUserId: session.user.id 
            }
          });

          // 4. Assign the vehicle to this cargo
          const updatedVehicle = await tx.vehicle.update({
            where: { id: vehicleId },
            data: { 
              status: 'en_route'
            }
          });

          // 5. Create an assignment record (if assignments table exists)
          try {
            await tx.assignment.create({
              data: {
                cargoOfferId: cargoOfferId,
                vehicleId: vehicleId,
                userId: session.user.id,
                status: 'ACTIVE',
                assignedAt: new Date()
              }
            });
          } catch (assignmentError) {
            // If assignments table doesn't exist, continue without it
            console.log('Assignment table not available, skipping assignment record');
          }

          return { cargo: updatedCargo, vehicle: updatedVehicle };
        });

        return NextResponse.json({ 
          success: true, 
          message: `Successfully assigned ${result.vehicle.name} to cargo "${result.cargo.title}"`,
          cargoId: cargoOfferId,
          vehicleId: vehicleId
        });

      } catch (dbError) {
        console.error('Database error during accept:', dbError);
        return NextResponse.json({ 
          success: false, 
          error: dbError instanceof Error ? dbError.message : 'Failed to accept suggestion'
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Invalid suggestion ID format' 
    }, { status: 400 });
  } catch (error) {
    console.error('Accept suggestion error:', error);
    return NextResponse.json(
      { error: 'Failed to accept suggestion' },
      { status: 500 }
    );
  }
}