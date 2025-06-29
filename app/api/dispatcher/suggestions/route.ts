/**
 * Dispatcher API - Get Suggestions Endpoint
 * REST API for frontend integration as specified in user's plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { matchingEngine } from '@/lib/algorithms/matching-engine';
import { marketplaceConnector } from '@/lib/connectors/marketplace-connector';
import { fleetManager } from '@/lib/algorithms/fleet-manager';

export const dynamic = 'force-dynamic';

// GET /api/dispatcher/suggestions - Get route suggestions
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5', 10);
    const urgencyOnly = searchParams.get('urgencyOnly') === 'true';
    const minProfit = parseFloat(searchParams.get('minProfit') || '0');
    const maxDistance = parseFloat(searchParams.get('maxDistance') || '100');
    const vehicleType = searchParams.get('vehicleType') as 'VAN' | 'TRUCK' | 'SEMI' | undefined;

    console.log(`🎯 API: Getting ${limit} suggestions with filters`);

    // Build filters object as per user's plan
    const filters = {
      urgencyOnly,
      minProfit: minProfit > 0 ? minProfit : undefined,
      maxDistance,
      vehicleType,
      excludeRisky: searchParams.get('excludeRisky') === 'true'
    };

    // Get matches from matching engine
    const matches = await matchingEngine.findBestMatches(limit, filters);

    // Get additional statistics as per user's plan
    const totalAvailableCargo = await getTotalAvailableCargo();
    const availableVehiclesCount = await getAvailableVehiclesCount();

    // Format response as per user's plan structure
    const response = {
      status: 'success',
      suggestions: matches.map(match => ({
        id: `${match.cargo.id}-${match.vehicle.id}`,
        cargo: {
          id: match.cargo.id,
          route: `${match.cargo.fromCity} → ${match.cargo.toCity}`,
          weight: match.cargo.weight,
          cargoType: match.cargo.cargoType,
          price: match.cargo.price,
          urgency: match.cargo.urgency,
          loadingDate: match.cargo.loadingDate,
          deliveryDate: match.cargo.deliveryDate
        },
        vehicle: {
          id: match.vehicle.id,
          name: match.vehicle.name,
          licensePlate: match.vehicle.licensePlate,
          type: match.vehicle.vehicleType,
          status: match.vehicle.status
        },
        details: {
          score: match.score,
          estimatedProfit: match.estimatedProfit,
          profitMargin: match.details.profitMargin,
          distanceToPickup: match.vehicleMatch.distanceToPickup,
          travelTime: match.vehicleMatch.travelTimeToPickup,
          totalDuration: match.cargoAnalysis.estimatedDuration,
          riskLevel: match.riskLevel,
          urgencyScore: match.details.urgencyScore,
          proximityScore: match.details.proximityScore,
          profitScore: match.details.profitScore
        },
        recommendation: {
          text: match.recommendation,
          confidence: match.details.urgencyScore + match.details.profitScore / 2,
          reasons: match.details.advantages
        }
      })),
      metadata: {
        generated_at: new Date().toISOString(),
        total_matches: matches.length,
        total_available_cargo: totalAvailableCargo,
        available_vehicles: availableVehiclesCount,
        filters_applied: filters,
        execution_time_ms: 0 // Will be calculated
      },
      summary: {
        best_score: matches.length > 0 ? Math.max(...matches.map(m => m.score)) : 0,
        average_profit: matches.length > 0 ? matches.reduce((sum, m) => sum + m.estimatedProfit, 0) / matches.length : 0,
        urgent_count: matches.filter(m => m.cargo.urgency === 'high').length,
        high_profit_count: matches.filter(m => m.estimatedProfit > 500).length
      }
    };

    console.log(`✅ API: Returned ${matches.length} suggestions`);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ API Error in suggestions:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to get suggestions',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper functions
async function getTotalAvailableCargo(): Promise<number> {
  try {
    const stats = await marketplaceConnector.getMarketplaceStats();
    return stats.activeCargo;
  } catch (error) {
    console.warn('Warning: Could not get cargo stats:', error);
    return 0;
  }
}

async function getAvailableVehiclesCount(): Promise<number> {
  try {
    const vehicles = await fleetManager.getAvailableVehicles();
    return vehicles.length;
  } catch (error) {
    console.warn('Warning: Could not get vehicle count:', error);
    return 0;
  }
}