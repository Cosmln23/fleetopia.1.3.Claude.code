import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { acceptSuggestionSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';
import { dbUtils } from '@/lib/db-utils';

export async function POST(request: NextRequest) {
  try {
    // Get session for authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    
    // Basic validation using zod schema
    const validation = acceptSuggestionSchema.pick({ suggestionId: true }).safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          message: 'Invalid request body',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { suggestionId } = validation.data;

    // Extract IDs from suggestion (format: suggestion-cargoId-vehicleId)
    const parts = suggestionId.split('-');
    if (parts.length < 3) {
      return NextResponse.json(
        { error: 'Invalid suggestion ID format' },
        { status: 400 }
      );
    }

    const cargoOfferId = parts[1];
    const vehicleId = parts[2];
    
    // Validate IDs format (basic UUID check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(cargoOfferId) || !uuidRegex.test(vehicleId)) {
      return NextResponse.json(
        { error: 'Invalid cargo or vehicle ID format' },
        { status: 400 }
      );
    }
      
    try {
      // Use cached database operation with transaction
      const result = await dbUtils.acceptCargoOffer(cargoOfferId, vehicleId, session.user.id);

      return NextResponse.json({ 
        success: true,
        data: {
          message: `Successfully assigned ${result.vehicle.name} to cargo "${result.cargo.title}"`,
          assignment: {
            cargoId: cargoOfferId,
            vehicleId: vehicleId,
            cargoTitle: result.cargo.title,
            vehicleName: result.vehicle.name,
            route: `${result.cargo.fromCity} → ${result.cargo.toCity}`
          }
        }
      });

    } catch (dbError) {
      console.error('Database error during accept:', dbError);
      if (dbError instanceof Error) {
        return NextResponse.json(
          { error: dbError.message },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to accept suggestion' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Accept suggestion error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
