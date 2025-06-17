import { NextResponse, NextRequest } from 'next/server';
import { createApiHandler, apiResponse, checkResourceOwnership } from '@/lib/api-helpers';
import { acceptSuggestionSchema } from '@/lib/validations';
import { rateLimiters } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';
import { dbUtils } from '@/lib/db-utils';

export const POST = createApiHandler({
  requireAuth: true,
  rateLimiter: rateLimiters.create,
  bodySchema: acceptSuggestionSchema.pick({ suggestionId: true })
})(async ({ session, body }) => {
  try {
    const { suggestionId } = body!;

    // Extract IDs from suggestion (format: suggestion-cargoId-vehicleId)
    const parts = suggestionId.split('-');
    if (parts.length < 3) {
      return apiResponse.error('Invalid suggestion ID format');
    }

    const cargoOfferId = parts[1];
    const vehicleId = parts[2];
    
    // Validate IDs format (basic UUID check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(cargoOfferId) || !uuidRegex.test(vehicleId)) {
      return apiResponse.error('Invalid cargo or vehicle ID format');
    }
      
    try {
      // Use cached database operation with transaction
      const result = await dbUtils.acceptCargoOffer(cargoOfferId, vehicleId, session.user.id);

      return apiResponse.success({ 
        message: `Successfully assigned ${result.vehicle.name} to cargo "${result.cargo.title}"`,
        assignment: {
          cargoId: cargoOfferId,
          vehicleId: vehicleId,
          cargoTitle: result.cargo.title,
          vehicleName: result.vehicle.name,
          route: `${result.cargo.fromCity} → ${result.cargo.toCity}`
        }
      });

    } catch (dbError) {
      console.error('Database error during accept:', dbError);
      if (dbError instanceof Error) {
        return apiResponse.error(dbError.message);
      }
      return apiResponse.error('Failed to accept suggestion');
    }
  } catch (error) {
    console.error('Accept suggestion error:', error);
    throw error;
  }
});