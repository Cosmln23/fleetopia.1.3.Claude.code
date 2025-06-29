/**
 * Dispatcher API - Assign Cargo Endpoint
 * REST API for cargo assignment as specified in user's plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { matchingEngine } from '@/lib/algorithms/matching-engine';
import { marketplaceConnector } from '@/lib/connectors/marketplace-connector';
import { gpsFleetConnector } from '@/lib/connectors/gps-fleet-connector';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// POST /api/dispatcher/assign-cargo - Assign cargo to vehicle
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { cargoId, vehicleId, suggestionId, autoOptimize } = body;

    if (!cargoId || !vehicleId) {
      return NextResponse.json(
        { error: 'Cargo ID and Vehicle ID are required' },
        { status: 400 }
      );
    }

    console.log(`🎯 API: Assigning cargo ${cargoId} to vehicle ${vehicleId}`);

    // Validate cargo and vehicle exist
    const [cargo, vehicle] = await Promise.all([
      marketplaceConnector.getCargoDetails(cargoId),
      gpsFleetConnector.getVehicleStatus(vehicleId)
    ]);

    if (!cargo) {
      return NextResponse.json(
        { error: 'Cargo not found' },
        { status: 404 }
      );
    }

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Check if vehicle is available
    if (!['idle', 'assigned'].includes(vehicle.status)) {
      return NextResponse.json(
        { 
          error: 'Vehicle not available for assignment',
          vehicle_status: vehicle.status
        },
        { status: 400 }
      );
    }

    // Check capacity compatibility
    const vehicleCapacity = await gpsFleetConnector.getVehicleCapacity(vehicleId);
    if (vehicleCapacity && cargo.weight > vehicleCapacity.availableCapacity) {
      return NextResponse.json(
        { 
          error: 'Cargo weight exceeds vehicle capacity',
          cargo_weight: cargo.weight,
          available_capacity: vehicleCapacity.availableCapacity
        },
        { status: 400 }
      );
    }

    // If auto-optimize is enabled, find the best match for this cargo
    if (autoOptimize) {
      console.log('🔄 Auto-optimization enabled, finding best vehicle...');
      
      const matches = await matchingEngine.findBestMatches(10);
      const cargoMatches = matches.filter(m => m.cargo.id === cargoId);
      
      if (cargoMatches.length > 0) {
        const bestMatch = cargoMatches[0];
        if (bestMatch.vehicle.id !== vehicleId) {
          return NextResponse.json({
            status: 'optimization_suggestion',
            message: 'Better vehicle match found',
            current_assignment: {
              cargo_id: cargoId,
              vehicle_id: vehicleId,
              score: cargoMatches.find(m => m.vehicle.id === vehicleId)?.score || 0
            },
            suggested_assignment: {
              cargo_id: cargoId,
              vehicle_id: bestMatch.vehicle.id,
              vehicle_name: bestMatch.vehicle.name,
              score: bestMatch.score,
              profit_improvement: bestMatch.estimatedProfit - (cargoMatches.find(m => m.vehicle.id === vehicleId)?.estimatedProfit || 0),
              reasons: bestMatch.details.advantages
            },
            proceed_anyway: false
          });
        }
      }
    }

    // Create assignment in database
    const assignment = await prisma.assignment.create({
      data: {
        cargoOfferId: cargoId,
        vehicleId: vehicleId,
        userId: userId,
        status: 'active',
        assignedAt: new Date(),
        estimatedPickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        estimatedDeliveryTime: cargo.deliveryDate
      },
      include: {
        cargoOffer: true,
        vehicle: true
      }
    });

    // Update cargo status
    await marketplaceConnector.updateCargoStatus(cargoId, 'inactive');

    // Update vehicle status
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { 
        status: 'assigned',
        currentRoute: `${cargo.fromCity} → ${cargo.toCity}`,
        updatedAt: new Date()
      }
    });

    // Calculate assignment metrics
    const matches = await matchingEngine.findBestMatches(1);
    const assignmentMatch = matches.find(m => m.cargo.id === cargoId && m.vehicle.id === vehicleId);

    const response = {
      status: 'success',
      message: 'Cargo successfully assigned to vehicle',
      assignment: {
        id: assignment.id,
        cargo: {
          id: cargo.id,
          route: `${cargo.fromCity} → ${cargo.toCity}`,
          weight: cargo.weight,
          cargoType: cargo.cargoType,
          loadingDate: cargo.loadingDate,
          deliveryDate: cargo.deliveryDate
        },
        vehicle: {
          id: vehicle.id,
          name: vehicle.name,
          licensePlate: vehicle.licensePlate,
          driverName: vehicle.driverName,
          vehicleType: vehicle.vehicleType
        },
        metrics: assignmentMatch ? {
          match_score: assignmentMatch.score,
          estimated_profit: assignmentMatch.estimatedProfit,
          profit_margin: assignmentMatch.details.profitMargin,
          distance_to_pickup: assignmentMatch.vehicleMatch.distanceToPickup,
          estimated_duration: assignmentMatch.cargoAnalysis.estimatedDuration,
          risk_level: assignmentMatch.riskLevel
        } : null,
        timeline: {
          assigned_at: assignment.assignedAt,
          estimated_pickup: assignment.estimatedPickupTime,
          estimated_delivery: assignment.estimatedDeliveryTime
        }
      },
      recommendations: [
        'Monitor vehicle progress via GPS tracking',
        'Confirm pickup time with driver',
        'Set delivery notifications for customer',
        assignmentMatch?.riskLevel === 'high' ? 'High-risk assignment - monitor closely' : 'Standard monitoring required'
      ].filter(Boolean)
    };

    console.log(`✅ API: Assignment created successfully (ID: ${assignment.id})`);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ API Error in cargo assignment:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to assign cargo to vehicle',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/dispatcher/assign-cargo - Get assignment suggestions
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const cargoId = searchParams.get('cargoId');
    const vehicleId = searchParams.get('vehicleId');

    if (!cargoId && !vehicleId) {
      return NextResponse.json(
        { error: 'Either cargoId or vehicleId is required' },
        { status: 400 }
      );
    }

    console.log('🎯 API: Getting assignment suggestions');

    let suggestions;
    
    if (cargoId) {
      // Find best vehicles for specific cargo
      const matches = await matchingEngine.findBestMatches(10);
      suggestions = matches
        .filter(m => m.cargo.id === cargoId)
        .slice(0, 5)
        .map(match => ({
          vehicle: {
            id: match.vehicle.id,
            name: match.vehicle.name,
            licensePlate: match.vehicle.licensePlate,
            status: match.vehicle.status,
            vehicleType: match.vehicle.vehicleType
          },
          match_score: match.score,
          estimated_profit: match.estimatedProfit,
          distance_to_pickup: match.vehicleMatch.distanceToPickup,
          recommendation: match.recommendation,
          risk_level: match.riskLevel
        }));
    } else if (vehicleId) {
      // Find best cargo for specific vehicle
      suggestions = await matchingEngine.findMatchesForVehicle(vehicleId, 5);
      suggestions = suggestions.map(match => ({
        cargo: {
          id: match.cargo.id,
          route: `${match.cargo.fromCity} → ${match.cargo.toCity}`,
          weight: match.cargo.weight,
          cargoType: match.cargo.cargoType,
          urgency: match.cargo.urgency
        },
        match_score: match.score,
        estimated_profit: match.estimatedProfit,
        recommendation: match.recommendation,
        risk_level: match.riskLevel
      }));
    }

    return NextResponse.json({
      status: 'success',
      suggestions,
      metadata: {
        suggestion_type: cargoId ? 'vehicles_for_cargo' : 'cargo_for_vehicle',
        target_id: cargoId || vehicleId,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ API Error getting assignment suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to get assignment suggestions' },
      { status: 500 }
    );
  }
}