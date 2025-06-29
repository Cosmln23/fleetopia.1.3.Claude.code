/**
 * Scoring System
 * Advanced scoring algorithms for cargo-vehicle matching
 * Follows the user's specific plan for scoring calculations
 */

import { systemConfigService } from '@/lib/system-config-service';
import { MarketplaceCargo } from '@/lib/connectors/marketplace-connector';
import { FleetVehicle } from '@/lib/connectors/gps-fleet-connector';

export interface ScoringResult {
  proximityScore: number;
  profitScore: number;
  urgencyScore: number;
  efficiencyScore: number;
  riskScore: number;
  totalScore: number;
  details: ScoringDetails;
}

export interface ScoringDetails {
  distance: number;
  estimatedCosts: CostBreakdown;
  revenue: number;
  profit: number;
  profitMargin: number;
  riskFactors: string[];
  recommendations: string[];
}

export interface CostBreakdown {
  fuelCost: number;
  driverCost: number;
  maintenanceCost: number;
  totalCosts: number;
  costPerKm: number;
}

export interface VehiclePosition {
  lat: number;
  lng: number;
  currentLocation?: string;
}

export interface CargoLocation {
  pickupLat: number;
  pickupLng: number;
  deliveryLat: number;
  deliveryLng: number;
  pickupLocation?: string;
  deliveryLocation?: string;
}

class ScoringSystem {
  private fuelPrice: number = 1.50; // EUR per liter (will be updated from config)
  private driverHourlyRate: number = 25.00; // EUR per hour (will be updated from config)

  constructor() {
    this.initializeRates();
  }

  /**
   * Calculate proximity score as specified in user's plan
   * 0-10km = 100 puncte, 10-50km = 80 puncte, etc.
   */
  public calculateProximityScore(cargo: MarketplaceCargo, vehicle: FleetVehicle): number {
    const distance = this.calculateDistance(
      {
        lat: vehicle.currentLat || vehicle.lat,
        lng: vehicle.currentLng || vehicle.lng
      },
      {
        pickupLat: cargo.pickupLat || 0,
        pickupLng: cargo.pickupLng || 0,
        deliveryLat: cargo.deliveryLat || 0,
        deliveryLng: cargo.deliveryLng || 0
      }
    );

    // User's exact scoring system from plan
    if (distance <= 10) return 100;
    if (distance <= 50) return 80;
    if (distance <= 100) return 60;
    if (distance <= 200) return 40;
    return 20;
  }

  /**
   * Calculate profit score as specified in user's plan
   */
  public async calculateProfitScore(cargo: MarketplaceCargo, vehicle: FleetVehicle): Promise<number> {
    const costs = await this.calculateTotalCosts(cargo, vehicle);
    const revenue = this.calculateRevenue(cargo);
    const profit = revenue - costs.totalCosts;
    const profitMargin = (profit / revenue) * 100;

    // User's exact scoring system from plan
    if (profitMargin >= 50) return 100;
    if (profitMargin >= 30) return 80;
    if (profitMargin >= 20) return 60;
    if (profitMargin >= 10) return 40;
    return 0; // Sub 10% marja nu e profitabil
  }

  /**
   * Calculate total costs as specified in user's plan
   */
  private async calculateTotalCosts(cargo: MarketplaceCargo, vehicle: FleetVehicle): Promise<CostBreakdown> {
    const distance = this.getTotalDistance(cargo);
    const duration = await this.getEstimatedDuration(cargo, vehicle);

    // User's exact cost calculation from plan
    const fuelCost = (distance / 100) * (vehicle.fuelConsumption || 8.0) * this.fuelPrice;
    const driverCost = (duration / 60) * this.driverHourlyRate;
    const maintenanceCost = distance * 0.15; // 15 bani/km uzură as per plan

    const totalCosts = fuelCost + driverCost + maintenanceCost;

    return {
      fuelCost: Math.round(fuelCost * 100) / 100,
      driverCost: Math.round(driverCost * 100) / 100,
      maintenanceCost: Math.round(maintenanceCost * 100) / 100,
      totalCosts: Math.round(totalCosts * 100) / 100,
      costPerKm: Math.round((totalCosts / distance) * 100) / 100
    };
  }

  /**
   * Complete scoring calculation for cargo-vehicle pair
   */
  public async calculateCompleteScore(cargo: MarketplaceCargo, vehicle: FleetVehicle): Promise<ScoringResult> {
    try {
      console.log(`🔢 Calculating complete score: ${cargo.fromCity} → ${cargo.toCity} with ${vehicle.name}`);

      // Calculate all score components
      const proximityScore = this.calculateProximityScore(cargo, vehicle);
      const profitScore = await this.calculateProfitScore(cargo, vehicle);
      const urgencyScore = this.calculateUrgencyScore(cargo);
      const efficiencyScore = this.calculateEfficiencyScore(cargo, vehicle);
      const riskScore = this.calculateRiskScore(cargo, vehicle);

      // Calculate weighted total score
      const totalScore = this.calculateWeightedScore({
        proximityScore,
        profitScore,
        urgencyScore,
        efficiencyScore,
        riskScore
      });

      // Get detailed breakdown
      const costs = await this.calculateTotalCosts(cargo, vehicle);
      const revenue = this.calculateRevenue(cargo);
      const profit = revenue - costs.totalCosts;
      const profitMargin = (profit / revenue) * 100;
      const distance = this.getTotalDistance(cargo);

      const details: ScoringDetails = {
        distance,
        estimatedCosts: costs,
        revenue,
        profit: Math.round(profit * 100) / 100,
        profitMargin: Math.round(profitMargin * 100) / 100,
        riskFactors: this.identifyRiskFactors(cargo, vehicle, profitMargin),
        recommendations: this.generateRecommendations(proximityScore, profitScore, urgencyScore)
      };

      const result: ScoringResult = {
        proximityScore,
        profitScore,
        urgencyScore,
        efficiencyScore,
        riskScore,
        totalScore,
        details
      };

      console.log(`✅ Score calculated: ${totalScore.toFixed(1)} (Profit: €${profit.toFixed(2)}, Margin: ${profitMargin.toFixed(1)}%)`);
      return result;

    } catch (error) {
      console.error('❌ Error calculating score:', error);
      throw error;
    }
  }

  /**
   * Batch scoring for multiple cargo-vehicle combinations
   */
  public async scoreMultipleCombinations(
    cargoList: MarketplaceCargo[],
    vehicleList: FleetVehicle[]
  ): Promise<(ScoringResult & { cargoId: string; vehicleId: string })[]> {
    console.log(`🔢 Scoring ${cargoList.length} cargo × ${vehicleList.length} vehicles = ${cargoList.length * vehicleList.length} combinations`);

    const results: (ScoringResult & { cargoId: string; vehicleId: string })[] = [];

    for (const cargo of cargoList) {
      for (const vehicle of vehicleList) {
        try {
          const score = await this.calculateCompleteScore(cargo, vehicle);
          results.push({
            cargoId: cargo.id,
            vehicleId: vehicle.id,
            ...score
          });
        } catch (error) {
          console.warn(`⚠️ Error scoring ${cargo.id} + ${vehicle.id}:`, error);
        }
      }
    }

    // Sort by total score (best first)
    results.sort((a, b) => b.totalScore - a.totalScore);

    console.log(`✅ Completed scoring ${results.length} combinations`);
    return results;
  }

  /**
   * Find best scoring matches above threshold
   */
  public async findTopScoringMatches(
    cargoList: MarketplaceCargo[],
    vehicleList: FleetVehicle[],
    minScore: number = 70,
    limit: number = 10
  ): Promise<(ScoringResult & { cargoId: string; vehicleId: string })[]> {
    const allScores = await this.scoreMultipleCombinations(cargoList, vehicleList);
    
    return allScores
      .filter(score => score.totalScore >= minScore)
      .slice(0, limit);
  }

  // Private helper methods

  private async initializeRates(): Promise<void> {
    try {
      const pricingConfig = await systemConfigService.getPricingConfig();
      this.fuelPrice = pricingConfig.fuelPricePerLiter;
      this.driverHourlyRate = pricingConfig.driverCostPerHour;
    } catch (error) {
      console.warn('⚠️ Using default pricing config:', error);
    }
  }

  private calculateDistance(vehiclePos: VehiclePosition, cargoLoc: CargoLocation): number {
    // Distance from vehicle to pickup location
    return this.haversineDistance(
      vehiclePos.lat,
      vehiclePos.lng,
      cargoLoc.pickupLat,
      cargoLoc.pickupLng
    );
  }

  private getTotalDistance(cargo: MarketplaceCargo): number {
    // Total route distance (pickup to delivery)
    if (cargo.pickupLat && cargo.pickupLng && cargo.deliveryLat && cargo.deliveryLng) {
      return this.haversineDistance(
        cargo.pickupLat,
        cargo.pickupLng,
        cargo.deliveryLat,
        cargo.deliveryLng
      );
    }

    // Fallback estimation based on cities
    return this.estimateDistanceByCities(cargo.fromCity, cargo.toCity, cargo.fromCountry, cargo.toCountry);
  }

  private async getEstimatedDuration(cargo: MarketplaceCargo, vehicle: FleetVehicle): Promise<number> {
    const distance = this.getTotalDistance(cargo);
    const speedConfig = await systemConfigService.getSpeedConfig();
    
    // Determine route type and speed
    const isInternational = cargo.fromCountry !== cargo.toCountry;
    const isCityRoute = distance < 50;
    
    let averageSpeed: number;
    if (isCityRoute) {
      averageSpeed = speedConfig.averageSpeedCity;
    } else if (isInternational) {
      averageSpeed = speedConfig.averageSpeedHighway;
    } else {
      averageSpeed = (speedConfig.averageSpeedCity * 0.3) + (speedConfig.averageSpeedHighway * 0.7);
    }

    // Add loading/unloading time (2 hours standard)
    const drivingHours = distance / averageSpeed;
    const loadingTime = 2; // hours
    
    return (drivingHours + loadingTime) * 60; // return in minutes
  }

  private calculateRevenue(cargo: MarketplaceCargo): number {
    if (cargo.priceType === 'per_km') {
      const distance = this.getTotalDistance(cargo);
      return cargo.price * distance;
    }
    return cargo.price;
  }

  private calculateUrgencyScore(cargo: MarketplaceCargo): number {
    const deadline = cargo.deadline || cargo.deliveryDate;
    const hoursUntilDeadline = this.getHoursUntilDeadline(deadline);
    
    // Same as in cargo analyzer
    if (hoursUntilDeadline < 24) return 100;
    if (hoursUntilDeadline < 48) return 75;
    if (hoursUntilDeadline < 72) return 50;
    return 25;
  }

  private calculateEfficiencyScore(cargo: MarketplaceCargo, vehicle: FleetVehicle): number {
    let score = 100;

    // Fuel efficiency
    const fuelConsumption = vehicle.fuelConsumption || 8.0;
    if (fuelConsumption > 10) score -= 20;
    else if (fuelConsumption < 6) score += 10;

    // Vehicle type appropriateness
    const cargoWeight = cargo.weight;
    const vehicleCapacity = vehicle.capacityKg || 3500;
    const utilizationRate = (cargoWeight / vehicleCapacity) * 100;

    if (utilizationRate > 90) score += 15; // Excellent utilization
    else if (utilizationRate > 70) score += 10; // Good utilization
    else if (utilizationRate < 30) score -= 15; // Poor utilization

    // Vehicle availability bonus
    if (vehicle.status === 'idle') score += 10;
    else if (vehicle.status === 'maintenance') score -= 30;

    return Math.max(0, Math.min(100, score));
  }

  private calculateRiskScore(cargo: MarketplaceCargo, vehicle: FleetVehicle): number {
    let riskScore = 0;

    // Distance risk
    const distance = this.getTotalDistance(cargo);
    if (distance > 1000) riskScore += 25;
    else if (distance > 500) riskScore += 15;
    else if (distance > 200) riskScore += 5;

    // Cargo type risk
    const highRiskTypes = ['Hazardous', 'Fragile', 'Electronics'];
    if (highRiskTypes.includes(cargo.cargoType)) riskScore += 20;

    // Weight risk
    const vehicleCapacity = vehicle.capacityKg || 3500;
    const weightRatio = cargo.weight / vehicleCapacity;
    if (weightRatio > 0.9) riskScore += 15;

    // Urgency risk
    if (cargo.urgency === 'high') riskScore += 10;

    // Vehicle condition risk
    if (vehicle.status === 'maintenance') riskScore += 30;
    else if (vehicle.status === 'assigned') riskScore += 10;

    return Math.min(100, riskScore);
  }

  private calculateWeightedScore(scores: {
    proximityScore: number;
    profitScore: number;
    urgencyScore: number;
    efficiencyScore: number;
    riskScore: number;
  }): number {
    // Invert risk score (lower risk = better)
    const invertedRisk = 100 - scores.riskScore;

    // Weighted calculation
    const proximityWeight = 0.25;
    const profitWeight = 0.35;
    const urgencyWeight = 0.20;
    const efficiencyWeight = 0.15;
    const riskWeight = 0.05;

    const totalScore = 
      (scores.proximityScore * proximityWeight) +
      (scores.profitScore * profitWeight) +
      (scores.urgencyScore * urgencyWeight) +
      (scores.efficiencyScore * efficiencyWeight) +
      (invertedRisk * riskWeight);

    return Math.round(totalScore * 10) / 10;
  }

  private identifyRiskFactors(cargo: MarketplaceCargo, vehicle: FleetVehicle, profitMargin: number): string[] {
    const risks: string[] = [];

    if (profitMargin < 15) risks.push('Low profit margin');
    if (cargo.urgency === 'high') risks.push('Urgent deadline');
    if (cargo.weight > (vehicle.capacityKg || 3500) * 0.9) risks.push('Near capacity limit');
    if (cargo.cargoType === 'Hazardous') risks.push('Hazardous materials');
    if (this.getTotalDistance(cargo) > 800) risks.push('Long distance transport');
    if (vehicle.status !== 'idle') risks.push('Vehicle not immediately available');

    return risks;
  }

  private generateRecommendations(proximityScore: number, profitScore: number, urgencyScore: number): string[] {
    const recommendations: string[] = [];

    if (proximityScore > 80) recommendations.push('Excellent proximity - minimal deadhead distance');
    if (profitScore > 80) recommendations.push('High profitability - excellent financial opportunity');
    if (urgencyScore > 75 && profitScore > 60) recommendations.push('Urgent and profitable - prioritize this match');
    if (proximityScore < 40) recommendations.push('Consider fuel costs for long pickup distance');
    if (profitScore < 40) recommendations.push('Low profitability - negotiate better rate or decline');

    return recommendations;
  }

  private getHoursUntilDeadline(deadline: Date): number {
    const now = new Date();
    const deadlineTime = new Date(deadline);
    const diffMs = deadlineTime.getTime() - now.getTime();
    return Math.max(0, diffMs / (1000 * 60 * 60));
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

  private estimateDistanceByCities(fromCity: string, toCity: string, fromCountry: string, toCountry: string): number {
    // Simplified distance estimation
    if (fromCountry === toCountry) return 150;
    return 600;
  }
}

// Export singleton instance
export const scoringSystem = new ScoringSystem();

// Export for external use
export default scoringSystem;