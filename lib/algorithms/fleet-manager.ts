/**
 * Fleet Manager
 * Advanced algorithms for vehicle management and optimization
 * Follows the user's specific plan for fleet processing
 */

import prisma from '@/lib/prisma';
import { systemConfigService } from '@/lib/system-config-service';
import { gpsFleetConnector, FleetVehicle } from '@/lib/connectors/gps-fleet-connector';

export interface VehicleMatch {
  vehicle: FleetVehicle;
  distanceToPickup: number;
  travelTimeToPickup: number;
  capacityMatch: boolean;
  availabilityScore: number;
  efficiencyScore: number;
  totalScore: number;
}

export interface PickupLocation {
  lat: number;
  lng: number;
  address?: string;
  city: string;
  country: string;
}

export interface TravelTimeEstimate {
  distanceKm: number;
  estimatedMinutes: number;
  routeType: 'city' | 'highway' | 'mixed';
  averageSpeed: number;
}

class FleetManager {

  /**
   * Get available vehicles as specified in user's plan
   */
  public async getAvailableVehicles(): Promise<FleetVehicle[]> {
    try {
      console.log('🚛 Fetching available vehicles...');

      // Get vehicles that are available for new assignments
      const availableStatuses = ['idle', 'en_route', 'assigned'];
      
      const vehicles = await prisma.vehicle.findMany({
        where: {
          status: { in: availableStatuses },
          gpsEnabled: true
        },
        include: {
          assignments: {
            where: { status: 'active' },
            include: {
              cargoOffer: {
                select: { weight: true, deliveryDate: true }
              }
            }
          }
        }
      });

      // Transform to FleetVehicle and filter truly available ones
      const fleetVehicles: FleetVehicle[] = [];
      
      for (const vehicle of vehicles) {
        // Calculate current load
        const currentLoad = vehicle.assignments.reduce(
          (total, assignment) => total + (assignment.cargoOffer?.weight || 0),
          0
        );

        const maxCapacity = vehicle.capacityKg || 3500;
        const availableCapacity = maxCapacity - currentLoad;

        // Only include vehicles with available capacity
        if (availableCapacity > 100) { // At least 100kg capacity
          const fleetVehicle: FleetVehicle = {
            id: vehicle.id,
            name: vehicle.name,
            licensePlate: vehicle.licensePlate,
            driverName: vehicle.driverName,
            status: vehicle.status as any,
            lat: vehicle.lat,
            lng: vehicle.lng,
            currentLat: vehicle.currentLat,
            currentLng: vehicle.currentLng,
            capacityKg: maxCapacity,
            vehicleType: vehicle.vehicleType as any,
            driverId: vehicle.driverId,
            fuelConsumption: vehicle.fuelConsumption,
            gpsProvider: vehicle.gpsProvider,
            gpsEnabled: vehicle.gpsEnabled,
            lastUpdate: vehicle.lastUpdate || new Date(),
            currentRoute: vehicle.currentRoute
          };

          fleetVehicles.push(fleetVehicle);
        }
      }

      console.log(`✅ Found ${fleetVehicles.length} available vehicles`);
      return fleetVehicles;

    } catch (error) {
      console.error('❌ Error fetching available vehicles:', error);
      throw error;
    }
  }

  /**
   * Find nearest vehicles compatible with cargo as specified in user's plan
   */
  public async findNearestVehicles(
    pickupLocation: PickupLocation,
    cargoWeight: number,
    maxDistance: number = 100 // km
  ): Promise<VehicleMatch[]> {
    try {
      console.log(`🎯 Finding nearest vehicles for pickup at ${pickupLocation.city} (${cargoWeight}kg)`);

      // Get all available vehicles
      const availableVehicles = await this.getAvailableVehicles();
      
      // Filter by capacity and calculate matches
      const vehicleMatches: VehicleMatch[] = [];

      for (const vehicle of availableVehicles) {
        // Check capacity compatibility
        const capacityMatch = await this.checkCapacityMatch(vehicle, cargoWeight);
        
        if (capacityMatch) {
          // Calculate distance and travel time
          const distanceToPickup = this.calculateDistance(
            vehicle.currentLat || vehicle.lat,
            vehicle.currentLng || vehicle.lng,
            pickupLocation.lat,
            pickupLocation.lng
          );

          // Only consider vehicles within max distance
          if (distanceToPickup <= maxDistance) {
            const travelTime = await this.calculateTravelTime(
              { lat: vehicle.currentLat || vehicle.lat, lng: vehicle.currentLng || vehicle.lng },
              pickupLocation
            );

            const availabilityScore = this.calculateAvailabilityScore(vehicle);
            const efficiencyScore = this.calculateEfficiencyScore(vehicle, distanceToPickup);
            
            const totalScore = this.calculateVehicleScore({
              distanceToPickup,
              travelTimeToPickup: travelTime.estimatedMinutes,
              availabilityScore,
              efficiencyScore,
              capacityMatch: true
            });

            vehicleMatches.push({
              vehicle,
              distanceToPickup,
              travelTimeToPickup: travelTime.estimatedMinutes,
              capacityMatch: true,
              availabilityScore,
              efficiencyScore,
              totalScore
            });
          }
        }
      }

      // Sort by distance (nearest first) and then by total score
      const sortedMatches = this.sortByDistance(vehicleMatches);
      
      console.log(`✅ Found ${sortedMatches.length} compatible vehicles`);
      return sortedMatches;

    } catch (error) {
      console.error('❌ Error finding nearest vehicles:', error);
      throw error;
    }
  }

  /**
   * Calculate travel time as specified in user's plan
   */
  public async calculateTravelTime(
    vehiclePos: { lat: number; lng: number },
    pickupPos: { lat: number; lng: number }
  ): Promise<TravelTimeEstimate> {
    try {
      const distance = this.calculateDistance(vehiclePos.lat, vehiclePos.lng, pickupPos.lat, pickupPos.lng);
      const speedConfig = await systemConfigService.getSpeedConfig();
      
      // Determine route type and speed
      let routeType: 'city' | 'highway' | 'mixed';
      let averageSpeed: number;

      if (distance < 30) {
        // Short distance = city route
        routeType = 'city';
        averageSpeed = speedConfig.averageSpeedCity;
      } else if (distance > 100) {
        // Long distance = mostly highway
        routeType = 'highway';
        averageSpeed = speedConfig.averageSpeedHighway;
      } else {
        // Medium distance = mixed route
        routeType = 'mixed';
        averageSpeed = (speedConfig.averageSpeedCity * 0.4) + (speedConfig.averageSpeedHighway * 0.6);
      }

      const estimatedMinutes = (distance / averageSpeed) * 60;

      return {
        distanceKm: distance,
        estimatedMinutes: Math.round(estimatedMinutes),
        routeType,
        averageSpeed
      };

    } catch (error) {
      console.error('❌ Error calculating travel time:', error);
      throw error;
    }
  }

  /**
   * Filter vehicles by capacity compatibility
   */
  public async filterByCapacity(vehicles: FleetVehicle[], requiredWeight: number): Promise<FleetVehicle[]> {
    const compatibleVehicles: FleetVehicle[] = [];

    for (const vehicle of vehicles) {
      const capacityMatch = await this.checkCapacityMatch(vehicle, requiredWeight);
      if (capacityMatch) {
        compatibleVehicles.push(vehicle);
      }
    }

    console.log(`🔍 Filtered ${compatibleVehicles.length}/${vehicles.length} vehicles by capacity (${requiredWeight}kg)`);
    return compatibleVehicles;
  }

  /**
   * Sort vehicles by distance from pickup location
   */
  public sortByDistance(vehicleMatches: VehicleMatch[]): VehicleMatch[] {
    return vehicleMatches.sort((a, b) => {
      // Primary sort: distance
      const distanceDiff = a.distanceToPickup - b.distanceToPickup;
      if (Math.abs(distanceDiff) > 5) { // 5km threshold
        return distanceDiff;
      }
      
      // Secondary sort: total score (if distances are similar)
      return b.totalScore - a.totalScore;
    });
  }

  /**
   * Get vehicle utilization statistics
   */
  public async getFleetUtilization(): Promise<{
    totalVehicles: number;
    utilizationRate: number;
    averageDistance: number;
    topPerformers: FleetVehicle[];
    underutilized: FleetVehicle[];
  }> {
    try {
      const fleetStatus = await gpsFleetConnector.getFleetStatus();
      const allVehicles = await this.getAvailableVehicles();

      // Calculate utilization rate
      const utilizationRate = (fleetStatus.activeVehicles / fleetStatus.totalVehicles) * 100;

      // Get performance data (mock for now - could be enhanced with real metrics)
      const topPerformers = allVehicles
        .filter(v => v.status === 'in_transit')
        .slice(0, 5);

      const underutilized = allVehicles
        .filter(v => v.status === 'idle')
        .slice(0, 5);

      return {
        totalVehicles: fleetStatus.totalVehicles,
        utilizationRate,
        averageDistance: fleetStatus.totalDistance / fleetStatus.totalVehicles,
        topPerformers,
        underutilized
      };

    } catch (error) {
      console.error('❌ Error getting fleet utilization:', error);
      throw error;
    }
  }

  /**
   * Find optimal vehicle for urgent cargo
   */
  public async findUrgentVehicle(
    pickupLocation: PickupLocation,
    cargoWeight: number,
    deadlineHours: number
  ): Promise<VehicleMatch | null> {
    try {
      console.log(`🚨 Finding urgent vehicle for deadline in ${deadlineHours}h`);

      // Get all vehicles within a larger radius for urgent deliveries
      const nearestVehicles = await this.findNearestVehicles(pickupLocation, cargoWeight, 200);

      if (nearestVehicles.length === 0) {
        return null;
      }

      // Filter vehicles that can meet the deadline
      const suitableVehicles = nearestVehicles.filter(match => {
        const travelHours = match.travelTimeToPickup / 60;
        return travelHours < (deadlineHours * 0.8); // 80% time buffer
      });

      if (suitableVehicles.length === 0) {
        console.log('⚠️ No vehicles can meet the urgent deadline');
        return null;
      }

      // Return the best vehicle (closest with highest score)
      const bestVehicle = suitableVehicles[0];
      console.log(`✅ Found urgent vehicle: ${bestVehicle.vehicle.name} (${bestVehicle.distanceToPickup.toFixed(1)}km away)`);
      
      return bestVehicle;

    } catch (error) {
      console.error('❌ Error finding urgent vehicle:', error);
      throw error;
    }
  }

  // Private helper methods

  private async checkCapacityMatch(vehicle: FleetVehicle, requiredWeight: number): Promise<boolean> {
    // Get current vehicle capacity info
    const capacityInfo = await gpsFleetConnector.getVehicleCapacity(vehicle.id);
    
    if (!capacityInfo) {
      // Fallback to vehicle's base capacity
      const maxCapacity = vehicle.capacityKg || 3500;
      return requiredWeight <= (maxCapacity * 0.9); // 90% capacity limit
    }

    return requiredWeight <= capacityInfo.availableCapacity;
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private calculateAvailabilityScore(vehicle: FleetVehicle): number {
    // Score based on vehicle status and utilization
    const statusScores = {
      'idle': 100,
      'en_route': 80,
      'assigned': 60,
      'loading': 40,
      'unloading': 40,
      'in_transit': 20,
      'maintenance': 0,
      'out_of_service': 0
    };

    return statusScores[vehicle.status] || 50;
  }

  private calculateEfficiencyScore(vehicle: FleetVehicle, distanceToPickup: number): number {
    let score = 100;

    // Distance penalty (closer = better)
    if (distanceToPickup > 50) score -= 20;
    else if (distanceToPickup > 20) score -= 10;
    else if (distanceToPickup > 10) score -= 5;

    // Fuel efficiency bonus
    const fuelConsumption = vehicle.fuelConsumption || 8.0;
    if (fuelConsumption < 6.0) score += 15; // Very efficient
    else if (fuelConsumption < 8.0) score += 10; // Efficient
    else if (fuelConsumption > 12.0) score -= 10; // Inefficient

    // Vehicle type appropriateness
    if (vehicle.vehicleType === 'VAN') score += 5; // More maneuverable
    else if (vehicle.vehicleType === 'SEMI') score -= 5; // Less flexible

    return Math.max(0, Math.min(100, score));
  }

  private calculateVehicleScore(factors: {
    distanceToPickup: number;
    travelTimeToPickup: number;
    availabilityScore: number;
    efficiencyScore: number;
    capacityMatch: boolean;
  }): number {
    if (!factors.capacityMatch) return 0;

    // Normalize distance score (closer = better)
    const maxDistance = 100;
    const distanceScore = Math.max(0, 100 - (factors.distanceToPickup / maxDistance) * 100);

    // Normalize travel time score (faster = better)
    const maxTravelTime = 120; // 2 hours
    const timeScore = Math.max(0, 100 - (factors.travelTimeToPickup / maxTravelTime) * 100);

    // Weighted calculation
    const distanceWeight = 0.4;
    const timeWeight = 0.2;
    const availabilityWeight = 0.25;
    const efficiencyWeight = 0.15;

    const totalScore = 
      (distanceScore * distanceWeight) +
      (timeScore * timeWeight) +
      (factors.availabilityScore * availabilityWeight) +
      (factors.efficiencyScore * efficiencyWeight);

    return Math.round(totalScore * 10) / 10;
  }
}

// Export singleton instance
export const fleetManager = new FleetManager();

// Export for external use
export default fleetManager;