/**
 * Matching Engine - NUCLEUL SISTEMULUI
 * Core algorithm for matching cargo with vehicles
 * Follows the user's specific plan for optimal cargo-vehicle matching
 */

import { marketplaceConnector, MarketplaceCargo } from '@/lib/connectors/marketplace-connector';
import { fleetManager, VehicleMatch } from '@/lib/algorithms/fleet-manager';
import { cargoAnalyzer, CargoAnalysis } from '@/lib/algorithms/cargo-analyzer';
import { systemConfigService } from '@/lib/system-config-service';
import { FleetVehicle } from '@/lib/connectors/gps-fleet-connector';

export interface CargoVehicleMatch {
  cargo: MarketplaceCargo;
  vehicle: FleetVehicle;
  score: number;
  details: MatchDetails;
  cargoAnalysis: CargoAnalysis;
  vehicleMatch: VehicleMatch;
  estimatedProfit: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface MatchDetails {
  urgencyScore: number;
  proximityScore: number;
  profitScore: number;
  efficiencyScore: number;
  capacityCompatibility: number;
  timeCompatibility: number;
  riskFactors: string[];
  advantages: string[];
  warnings: string[];
}

export interface MatchingOptions {
  maxDistance?: number; // km
  minProfit?: number; // EUR
  urgencyOnly?: boolean;
  vehicleType?: 'VAN' | 'TRUCK' | 'SEMI';
  excludeRisky?: boolean;
}

class MatchingEngine {
  private readonly minAcceptableScore = 60; // Minimum match score

  /**
   * Find best matches as specified in user's plan
   * Core method of the matching engine
   */
  public async findBestMatches(limit: number = 5, options?: MatchingOptions): Promise<CargoVehicleMatch[]> {
    try {
      console.log(`🎯 Finding best cargo-vehicle matches (limit: ${limit})`);

      // Get available cargo from marketplace
      const availableCargo = await marketplaceConnector.getAvailableCargo({
        status: 'active',
        urgency: options?.urgencyOnly ? 'high' : undefined
      });

      // Get available vehicles from fleet
      const availableVehicles = await fleetManager.getAvailableVehicles();

      if (availableCargo.length === 0) {
        console.log('⚠️ No available cargo found');
        return [];
      }

      if (availableVehicles.length === 0) {
        console.log('⚠️ No available vehicles found');
        return [];
      }

      console.log(`📦 Processing ${availableCargo.length} cargo offers with ${availableVehicles.length} vehicles`);

      const matches: CargoVehicleMatch[] = [];

      // Process each cargo offer
      for (const cargo of availableCargo) {
        try {
          // Analyze cargo first
          const cargoAnalysis = await cargoAnalyzer.analyzeCargo({
            id: cargo.id,
            fromCity: cargo.fromCity,
            toCity: cargo.toCity,
            fromCountry: cargo.fromCountry,
            toCountry: cargo.toCountry,
            pickupLat: cargo.pickupLat,
            pickupLng: cargo.pickupLng,
            deliveryLat: cargo.deliveryLat,
            deliveryLng: cargo.deliveryLng,
            weight: cargo.weight,
            volume: cargo.volume,
            cargoType: cargo.cargoType,
            price: cargo.price,
            loadingDate: cargo.loadingDate,
            deliveryDate: cargo.deliveryDate,
            deadline: cargo.deadline,
            urgency: cargo.urgency,
            requirements: cargo.requirements,
            priceType: cargo.priceType
          });

          // Skip cargo with very low scores unless urgent
          if (cargoAnalysis.totalScore < 30 && cargo.urgency !== 'high') {
            continue;
          }

          // Find nearest vehicles for this cargo
          const nearestVehicles = await fleetManager.findNearestVehicles(
            {
              lat: cargo.pickupLat || 0,
              lng: cargo.pickupLng || 0,
              city: cargo.fromCity,
              country: cargo.fromCountry
            },
            cargo.weight,
            options?.maxDistance || 100
          );

          // Process each compatible vehicle
          for (const vehicleMatch of nearestVehicles) {
            try {
              // Calculate match score
              const score = await this.calculateMatchScore(cargo, vehicleMatch.vehicle, cargoAnalysis, vehicleMatch);
              
              // Only include matches above minimum threshold
              if (score > this.minAcceptableScore) {
                const details = await this.getMatchDetails(cargo, vehicleMatch.vehicle, cargoAnalysis, vehicleMatch);
                
                // Apply filters
                if (options?.minProfit && details.profitScore < options.minProfit) continue;
                if (options?.vehicleType && vehicleMatch.vehicle.vehicleType !== options.vehicleType) continue;
                if (options?.excludeRisky && this.calculateRiskLevel(details) === 'high') continue;

                const match: CargoVehicleMatch = {
                  cargo,
                  vehicle: vehicleMatch.vehicle,
                  score,
                  details,
                  cargoAnalysis,
                  vehicleMatch,
                  estimatedProfit: cargoAnalysis.profitEstimate,
                  riskLevel: this.calculateRiskLevel(details),
                  recommendation: this.generateRecommendation(score, details, cargoAnalysis)
                };

                matches.push(match);
              }
            } catch (vehicleError) {
              console.warn(`⚠️ Error processing vehicle ${vehicleMatch.vehicle.id}:`, vehicleError);
              continue;
            }
          }
        } catch (cargoError) {
          console.warn(`⚠️ Error processing cargo ${cargo.id}:`, cargoError);
          continue;
        }
      }

      // Sort by score and return top matches
      const sortedMatches = matches.sort((a, b) => b.score - a.score);
      const topMatches = sortedMatches.slice(0, limit);

      console.log(`✅ Found ${topMatches.length} optimal matches from ${matches.length} total matches`);
      
      return topMatches;

    } catch (error) {
      console.error('❌ Error in matching engine:', error);
      throw error;
    }
  }

  /**
   * Calculate match score using weighted formula as specified in user's plan
   */
  private async calculateMatchScore(
    cargo: MarketplaceCargo,
    vehicle: FleetVehicle,
    cargoAnalysis: CargoAnalysis,
    vehicleMatch: VehicleMatch
  ): Promise<number> {
    try {
      // Core scoring components as per user's plan
      const urgencyScore = cargoAnalysis.urgencyScore;
      const proximityScore = this.calculateProximityScore(cargo, vehicle, vehicleMatch);
      const profitScore = await this.calculateProfitScore(cargo, vehicle, cargoAnalysis);
      const efficiencyScore = this.calculateEfficiencyScore(cargo, vehicle, vehicleMatch);

      // User's weighted formula from plan
      const urgencyWeight = 0.3;
      const proximityWeight = 0.25;
      const profitWeight = 0.35;
      const efficiencyWeight = 0.1;

      const finalScore = 
        (urgencyScore * urgencyWeight) +
        (proximityScore * proximityWeight) +
        (profitScore * profitWeight) +
        (efficiencyScore * efficiencyWeight);

      return Math.round(finalScore * 10) / 10;

    } catch (error) {
      console.error('❌ Error calculating match score:', error);
      return 0;
    }
  }

  /**
   * Get detailed match information
   */
  private async getMatchDetails(
    cargo: MarketplaceCargo,
    vehicle: FleetVehicle,
    cargoAnalysis: CargoAnalysis,
    vehicleMatch: VehicleMatch
  ): Promise<MatchDetails> {
    const urgencyScore = cargoAnalysis.urgencyScore;
    const proximityScore = this.calculateProximityScore(cargo, vehicle, vehicleMatch);
    const profitScore = await this.calculateProfitScore(cargo, vehicle, cargoAnalysis);
    const efficiencyScore = this.calculateEfficiencyScore(cargo, vehicle, vehicleMatch);
    const capacityCompatibility = await this.calculateCapacityCompatibility(cargo, vehicle);
    const timeCompatibility = this.calculateTimeCompatibility(cargo, vehicleMatch);

    const riskFactors: string[] = [];
    const advantages: string[] = [];
    const warnings: string[] = [];

    // Analyze risk factors
    if (cargoAnalysis.riskScore > 70) riskFactors.push('High-risk cargo');
    if (vehicleMatch.distanceToPickup > 80) riskFactors.push('Long distance to pickup');
    if (cargo.urgency === 'high') riskFactors.push('Urgent deadline');
    if (cargoAnalysis.difficultyScore > 60) riskFactors.push('Complex cargo requirements');

    // Identify advantages
    if (vehicleMatch.distanceToPickup < 20) advantages.push('Vehicle very close to pickup');
    if (profitScore > 80) advantages.push('High profit potential');
    if (vehicle.status === 'idle') advantages.push('Vehicle immediately available');
    if (capacityCompatibility > 90) advantages.push('Perfect capacity match');

    // Generate warnings
    if (timeCompatibility < 50) warnings.push('Tight delivery schedule');
    if (profitScore < 40) warnings.push('Low profit margin');
    if (cargoAnalysis.difficultyScore > 70) warnings.push('Special handling required');

    return {
      urgencyScore,
      proximityScore,
      profitScore,
      efficiencyScore,
      capacityCompatibility,
      timeCompatibility,
      riskFactors,
      advantages,
      warnings
    };
  }

  /**
   * Find urgent matches for high-priority cargo
   */
  public async findUrgentMatches(): Promise<CargoVehicleMatch[]> {
    console.log('🚨 Finding urgent matches for high-priority cargo');
    
    return this.findBestMatches(10, {
      urgencyOnly: true,
      maxDistance: 150, // Wider search for urgent cargo
      excludeRisky: false // Allow risky matches for urgent cargo
    });
  }

  /**
   * Find matches for specific vehicle
   */
  public async findMatchesForVehicle(vehicleId: string, limit: number = 5): Promise<CargoVehicleMatch[]> {
    try {
      console.log(`🚛 Finding matches for vehicle: ${vehicleId}`);

      const vehicle = await fleetManager.getAvailableVehicles();
      const targetVehicle = vehicle.find(v => v.id === vehicleId);

      if (!targetVehicle) {
        console.log('❌ Vehicle not found or not available');
        return [];
      }

      // Get all available cargo
      const availableCargo = await marketplaceConnector.getAvailableCargo({ status: 'active' });
      const matches: CargoVehicleMatch[] = [];

      for (const cargo of availableCargo) {
        // Create mock vehicle match for scoring
        const vehicleMatch: VehicleMatch = {
          vehicle: targetVehicle,
          distanceToPickup: this.calculateDistance(
            targetVehicle.currentLat || targetVehicle.lat,
            targetVehicle.currentLng || targetVehicle.lng,
            cargo.pickupLat || 0,
            cargo.pickupLng || 0
          ),
          travelTimeToPickup: 0, // Will be calculated
          capacityMatch: cargo.weight <= (targetVehicle.capacityKg || 3500),
          availabilityScore: 100,
          efficiencyScore: 80,
          totalScore: 85
        };

        if (vehicleMatch.capacityMatch && vehicleMatch.distanceToPickup <= 150) {
          const cargoAnalysis = await cargoAnalyzer.analyzeCargo({
            id: cargo.id,
            fromCity: cargo.fromCity,
            toCity: cargo.toCity,
            fromCountry: cargo.fromCountry,
            toCountry: cargo.toCountry,
            weight: cargo.weight,
            cargoType: cargo.cargoType,
            price: cargo.price,
            loadingDate: cargo.loadingDate,
            deliveryDate: cargo.deliveryDate,
            urgency: cargo.urgency,
            priceType: cargo.priceType
          });

          const score = await this.calculateMatchScore(cargo, targetVehicle, cargoAnalysis, vehicleMatch);
          
          if (score > this.minAcceptableScore) {
            const details = await this.getMatchDetails(cargo, targetVehicle, cargoAnalysis, vehicleMatch);
            
            matches.push({
              cargo,
              vehicle: targetVehicle,
              score,
              details,
              cargoAnalysis,
              vehicleMatch,
              estimatedProfit: cargoAnalysis.profitEstimate,
              riskLevel: this.calculateRiskLevel(details),
              recommendation: this.generateRecommendation(score, details, cargoAnalysis)
            });
          }
        }
      }

      return matches.sort((a, b) => b.score - a.score).slice(0, limit);

    } catch (error) {
      console.error('❌ Error finding matches for vehicle:', error);
      throw error;
    }
  }

  // Private helper methods

  private calculateProximityScore(cargo: MarketplaceCargo, vehicle: FleetVehicle, vehicleMatch: VehicleMatch): number {
    const distance = vehicleMatch.distanceToPickup;
    
    // Score based on distance (closer = better)
    if (distance < 10) return 100;
    if (distance < 25) return 90;
    if (distance < 50) return 80;
    if (distance < 80) return 60;
    if (distance < 120) return 40;
    return 20;
  }

  private async calculateProfitScore(cargo: MarketplaceCargo, vehicle: FleetVehicle, cargoAnalysis: CargoAnalysis): Promise<number> {
    const profit = cargoAnalysis.profitEstimate;
    
    // Normalize profit to 0-100 scale
    if (profit < 100) return 20;
    if (profit < 300) return 40;
    if (profit < 500) return 60;
    if (profit < 800) return 80;
    return 100;
  }

  private calculateEfficiencyScore(cargo: MarketplaceCargo, vehicle: FleetVehicle, vehicleMatch: VehicleMatch): number {
    let score = 100;

    // Fuel efficiency factor
    const fuelConsumption = vehicle.fuelConsumption || 8.0;
    if (fuelConsumption > 10) score -= 20;
    else if (fuelConsumption < 6) score += 10;

    // Vehicle utilization factor
    if (vehicle.status === 'idle') score += 15;
    else if (vehicle.status === 'assigned') score -= 10;

    // Distance efficiency
    if (vehicleMatch.distanceToPickup > 100) score -= 25;
    else if (vehicleMatch.distanceToPickup < 20) score += 15;

    return Math.max(0, Math.min(100, score));
  }

  private async calculateCapacityCompatibility(cargo: MarketplaceCargo, vehicle: FleetVehicle): Promise<number> {
    const maxCapacity = vehicle.capacityKg || 3500;
    const utilizationRate = (cargo.weight / maxCapacity) * 100;

    if (utilizationRate > 100) return 0; // Overweight
    if (utilizationRate > 90) return 100; // Optimal utilization
    if (utilizationRate > 70) return 90; // Good utilization
    if (utilizationRate > 50) return 80; // Decent utilization
    if (utilizationRate > 30) return 60; // Low utilization
    return 40; // Very low utilization
  }

  private calculateTimeCompatibility(cargo: MarketplaceCargo, vehicleMatch: VehicleMatch): number {
    const travelHours = vehicleMatch.travelTimeToPickup / 60;
    const deadlineHours = (new Date(cargo.deliveryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60);
    
    const timeBuffer = deadlineHours - travelHours;
    
    if (timeBuffer < 12) return 30; // Very tight
    if (timeBuffer < 24) return 60; // Tight
    if (timeBuffer < 48) return 80; // Comfortable
    return 100; // Plenty of time
  }

  private calculateRiskLevel(details: MatchDetails): 'low' | 'medium' | 'high' {
    const riskCount = details.riskFactors.length;
    const warningCount = details.warnings.length;
    
    if (riskCount >= 3 || warningCount >= 3) return 'high';
    if (riskCount >= 2 || warningCount >= 2) return 'medium';
    return 'low';
  }

  private generateRecommendation(score: number, details: MatchDetails, cargoAnalysis: CargoAnalysis): string {
    if (score > 85) return 'Excellent match - highly recommended';
    if (score > 75) return 'Good match - recommended';
    if (score > 65) return 'Acceptable match - consider carefully';
    return 'Poor match - not recommended';
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
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
}

// Export singleton instance
export const matchingEngine = new MatchingEngine();

// Export for external use
export default matchingEngine;