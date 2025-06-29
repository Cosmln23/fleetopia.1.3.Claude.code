/**
 * Dispatcher API - Fleet Status Endpoint
 * REST API for fleet status as specified in user's plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { gpsFleetConnector } from '@/lib/connectors/gps-fleet-connector';
import { fleetManager } from '@/lib/algorithms/fleet-manager';

export const dynamic = 'force-dynamic';

// GET /api/dispatcher/fleet-status - Get fleet status
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeVehicles = searchParams.get('includeVehicles') === 'true';
    const includePositions = searchParams.get('includePositions') === 'true';

    console.log('🚛 API: Getting fleet status');

    // Get fleet status and utilization
    const [fleetStatus, fleetUtilization] = await Promise.all([
      gpsFleetConnector.getFleetStatus(),
      fleetManager.getFleetUtilization()
    ]);

    // Build response data
    const response: any = {
      status: 'success',
      fleet_overview: {
        total_vehicles: fleetStatus.totalVehicles,
        active_vehicles: fleetStatus.activeVehicles,
        idle_vehicles: fleetStatus.idleVehicles,
        in_transit_vehicles: fleetStatus.inTransitVehicles,
        maintenance_vehicles: fleetStatus.maintenanceVehicles,
        online_vehicles: fleetStatus.onlineVehicles,
        utilization_rate: fleetUtilization.utilizationRate,
        average_speed: fleetStatus.averageSpeed,
        total_distance: fleetStatus.totalDistance
      },
      performance_metrics: {
        utilization_percentage: fleetUtilization.utilizationRate,
        average_distance_per_vehicle: fleetUtilization.averageDistance,
        operational_efficiency: calculateEfficiencyScore(fleetStatus),
        fuel_efficiency: 'N/A', // Would be calculated from real data
        revenue_per_vehicle: 'N/A' // Would be calculated from real data
      },
      status_breakdown: {
        available: fleetStatus.idleVehicles,
        assigned: fleetStatus.activeVehicles - fleetStatus.inTransitVehicles,
        in_transit: fleetStatus.inTransitVehicles,
        maintenance: fleetStatus.maintenanceVehicles,
        offline: fleetStatus.totalVehicles - fleetStatus.onlineVehicles
      },
      metadata: {
        generated_at: new Date().toISOString(),
        data_freshness: 'real-time',
        last_gps_update: new Date().toISOString(),
        system_status: 'operational'
      }
    };

    // Include detailed vehicle list if requested
    if (includeVehicles) {
      const availableVehicles = await fleetManager.getAvailableVehicles();
      
      response.vehicles = availableVehicles.map(vehicle => ({
        id: vehicle.id,
        name: vehicle.name,
        license_plate: vehicle.licensePlate,
        driver_name: vehicle.driverName,
        status: vehicle.status,
        vehicle_type: vehicle.vehicleType,
        capacity_kg: vehicle.capacityKg,
        fuel_consumption: vehicle.fuelConsumption,
        gps_enabled: vehicle.gpsEnabled,
        last_update: vehicle.lastUpdate,
        current_route: vehicle.currentRoute,
        location: includePositions ? {
          lat: vehicle.currentLat || vehicle.lat,
          lng: vehicle.currentLng || vehicle.lng,
          last_update: vehicle.lastUpdate
        } : undefined
      }));
    }

    // Include vehicle positions if requested
    if (includePositions) {
      const positions = await gpsFleetConnector.getVehiclePositions();
      
      response.vehicle_positions = positions.map(pos => ({
        vehicle_id: pos.vehicleId,
        coordinates: {
          lat: pos.lat,
          lng: pos.lng
        },
        speed: pos.speed,
        heading: pos.heading,
        timestamp: pos.timestamp,
        address: pos.address
      }));
    }

    // Add recommendations based on fleet status
    response.recommendations = generateFleetRecommendations(fleetStatus, fleetUtilization);

    console.log(`✅ API: Fleet status retrieved for ${fleetStatus.totalVehicles} vehicles`);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ API Error in fleet status:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to get fleet status',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateEfficiencyScore(fleetStatus: any): number {
  // Calculate efficiency based on active vs total vehicles
  if (fleetStatus.totalVehicles === 0) return 0;
  
  const activeRatio = fleetStatus.activeVehicles / fleetStatus.totalVehicles;
  const onlineRatio = fleetStatus.onlineVehicles / fleetStatus.totalVehicles;
  const maintenanceRatio = fleetStatus.maintenanceVehicles / fleetStatus.totalVehicles;
  
  // Score out of 100
  let score = 100;
  score *= activeRatio; // Reward active vehicles
  score *= onlineRatio; // Reward GPS connectivity
  score *= (1 - maintenanceRatio * 0.5); // Penalize maintenance but not heavily
  
  return Math.round(score);
}

function generateFleetRecommendations(fleetStatus: any, utilization: any): string[] {
  const recommendations: string[] = [];
  
  if (utilization.utilizationRate < 60) {
    recommendations.push('Low fleet utilization detected - consider more aggressive route assignment');
  }
  
  if (fleetStatus.maintenanceVehicles > fleetStatus.totalVehicles * 0.15) {
    recommendations.push('High maintenance ratio - review preventive maintenance schedule');
  }
  
  if (fleetStatus.idleVehicles > fleetStatus.totalVehicles * 0.3) {
    recommendations.push('Many idle vehicles available - opportunity for additional cargo acceptance');
  }
  
  if (fleetStatus.onlineVehicles < fleetStatus.totalVehicles * 0.9) {
    recommendations.push('Some vehicles offline - check GPS connectivity issues');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Fleet operating efficiently - maintain current operations');
  }
  
  return recommendations;
}