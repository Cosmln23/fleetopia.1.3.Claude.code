/**
 * Cargo Analyzer
 * Advanced algorithms for cargo analysis and scoring
 * Follows the user's specific plan for cargo processing
 */

import { systemConfigService } from '@/lib/system-config-service';
import { MarketplaceCargo } from '@/lib/connectors/marketplace-connector';

export interface CargoAnalysis {
  urgencyScore: number;
  distanceKm: number;
  estimatedDuration: number; // in hours
  difficultyScore: number;
  profitEstimate: number;
  riskScore: number;
  totalScore: number;
}

export interface CargoData {
  id: string;
  fromCity: string;
  toCity: string;
  fromCountry: string;
  toCountry: string;
  pickupLat?: number;
  pickupLng?: number;
  deliveryLat?: number;
  deliveryLng?: number;
  weight: number;
  volume?: number;
  cargoType: string;
  price: number;
  loadingDate: Date;
  deliveryDate: Date;
  deadline?: Date;
  urgency: 'low' | 'medium' | 'high';
  requirements?: string[];
  priceType: 'fixed' | 'negotiable' | 'per_km';
}

class CargoAnalyzer {
  
  /**
   * Main cargo analysis method as specified in user's plan
   */
  public async analyzeCargo(cargoData: CargoData): Promise<CargoAnalysis> {
    try {
      console.log(`🔍 Analyzing cargo: ${cargoData.fromCity} → ${cargoData.toCity}`);

      // Calculate all metrics
      const urgencyScore = await this.calculateUrgencyScore(cargoData);
      const distanceKm = await this.calculateDistance(cargoData);
      const estimatedDuration = await this.estimateDuration(cargoData, distanceKm);
      const difficultyScore = await this.assessDifficulty(cargoData);
      const profitEstimate = await this.estimateProfit(cargoData, distanceKm);
      const riskScore = await this.calculateRiskScore(cargoData);

      // Calculate total weighted score
      const totalScore = this.calculateTotalScore({
        urgencyScore,
        difficultyScore,
        profitEstimate,
        riskScore,
        distanceKm
      });

      const analysis: CargoAnalysis = {
        urgencyScore,
        distanceKm,
        estimatedDuration,
        difficultyScore,
        profitEstimate,
        riskScore,
        totalScore
      };

      console.log(`✅ Cargo analysis complete - Total Score: ${totalScore.toFixed(1)}`);
      return analysis;

    } catch (error) {
      console.error('❌ Error analyzing cargo:', error);
      throw error;
    }
  }

  /**
   * Calculate urgency score as specified in user's plan
   * Urgent < 24h, High < 48h, Medium < 72h, Low > 72h
   */
  private async calculateUrgencyScore(cargo: CargoData): Promise<number> {
    const deadline = cargo.deadline || cargo.deliveryDate;
    const hoursUntilDeadline = this.getHoursUntilDeadline(deadline);
    
    // User's exact scoring system
    if (hoursUntilDeadline < 24) return 100;
    if (hoursUntilDeadline < 48) return 75;
    if (hoursUntilDeadline < 72) return 50;
    return 25;
  }

  /**
   * Calculate distance between pickup and delivery
   */
  private async calculateDistance(cargo: CargoData): Promise<number> {
    // If we have coordinates, use precise calculation
    if (cargo.pickupLat && cargo.pickupLng && cargo.deliveryLat && cargo.deliveryLng) {
      return this.haversineDistance(
        cargo.pickupLat,
        cargo.pickupLng,
        cargo.deliveryLat,
        cargo.deliveryLng
      );
    }

    // Otherwise, estimate based on cities/countries
    return this.estimateDistanceByLocation(cargo.fromCity, cargo.toCity, cargo.fromCountry, cargo.toCountry);
  }

  /**
   * Estimate duration based on distance and route type
   */
  private async estimateDuration(cargo: CargoData, distance: number): Promise<number> {
    const speedConfig = await systemConfigService.getSpeedConfig();
    
    // Determine if it's primarily city or highway driving
    const isInternational = cargo.fromCountry !== cargo.toCountry;
    const isCityDelivery = distance < 50; // Short distance = city delivery
    
    let averageSpeed: number;
    
    if (isCityDelivery) {
      averageSpeed = speedConfig.averageSpeedCity; // Default: 30 km/h
    } else if (isInternational) {
      averageSpeed = speedConfig.averageSpeedHighway; // Default: 80 km/h
    } else {
      // Mixed route - weighted average
      averageSpeed = (speedConfig.averageSpeedCity * 0.3) + (speedConfig.averageSpeedHighway * 0.7);
    }

    // Add loading/unloading time (2 hours standard)
    const drivingHours = distance / averageSpeed;
    const loadingTime = 2; // hours
    
    return drivingHours + loadingTime;
  }

  /**
   * Assess cargo difficulty based on type, weight, and requirements
   */
  private async assessDifficulty(cargo: CargoData): Promise<number> {
    let difficultyScore = 0;

    // Weight factor (0-30 points)
    if (cargo.weight > 20000) difficultyScore += 30; // Very heavy
    else if (cargo.weight > 10000) difficultyScore += 20; // Heavy
    else if (cargo.weight > 5000) difficultyScore += 10; // Medium
    else difficultyScore += 0; // Light

    // Cargo type factor (0-25 points)
    const cargoTypeScores: Record<string, number> = {
      'Hazardous': 25,
      'Refrigerated': 20,
      'Fragile': 15,
      'Electronics': 10,
      'Food': 8,
      'General': 0
    };
    difficultyScore += cargoTypeScores[cargo.cargoType] || 5;

    // Special requirements factor (0-20 points)
    if (cargo.requirements && cargo.requirements.length > 0) {
      const specialRequirements = cargo.requirements.filter(req => 
        req.toLowerCase().includes('hydraulic') ||
        req.toLowerCase().includes('crane') ||
        req.toLowerCase().includes('temperature') ||
        req.toLowerCase().includes('special')
      );
      difficultyScore += specialRequirements.length * 7;
    }

    // Volume factor (0-15 points)
    if (cargo.volume) {
      if (cargo.volume > 80) difficultyScore += 15; // Oversized
      else if (cargo.volume > 50) difficultyScore += 10; // Large
      else if (cargo.volume > 20) difficultyScore += 5; // Medium
    }

    // International delivery (0-10 points)
    if (cargo.fromCountry !== cargo.toCountry) {
      difficultyScore += 10;
    }

    return Math.min(100, difficultyScore); // Cap at 100
  }

  /**
   * Estimate profit based on price, distance, and costs
   */
  private async estimateProfit(cargo: CargoData, distance: number): Promise<number> {
    const pricingConfig = await systemConfigService.getPricingConfig();
    
    // Calculate costs
    const estimatedDuration = await this.estimateDuration(cargo, distance);
    const fuelCost = (distance / 100) * 35 * pricingConfig.fuelPricePerLiter; // 35L/100km consumption
    const driverCost = estimatedDuration * pricingConfig.driverCostPerHour;
    const totalCosts = fuelCost + driverCost;

    // Calculate revenue
    let revenue = cargo.price;
    if (cargo.priceType === 'per_km') {
      revenue = cargo.price * distance;
    }

    // Calculate profit
    const grossProfit = revenue - totalCosts;
    const profitMargin = (grossProfit / revenue) * 100;

    return Math.max(0, grossProfit);
  }

  /**
   * Calculate risk score based on various factors
   */
  private async calculateRiskScore(cargo: CargoData): Promise<number> {
    let riskScore = 0;

    // Distance risk (longer = higher risk)
    const distance = await this.calculateDistance(cargo);
    if (distance > 1000) riskScore += 20;
    else if (distance > 500) riskScore += 10;
    else if (distance > 200) riskScore += 5;

    // Urgency risk (very urgent = higher risk)
    if (cargo.urgency === 'high') riskScore += 15;
    else if (cargo.urgency === 'medium') riskScore += 5;

    // Cargo type risk
    const highRiskTypes = ['Hazardous', 'Fragile', 'Electronics'];
    if (highRiskTypes.includes(cargo.cargoType)) {
      riskScore += 20;
    }

    // Price type risk (negotiable = higher risk)
    if (cargo.priceType === 'negotiable') {
      riskScore += 10;
    }

    // International risk
    if (cargo.fromCountry !== cargo.toCountry) {
      riskScore += 15;
    }

    // Time pressure risk
    const hoursUntilDeadline = this.getHoursUntilDeadline(cargo.deadline || cargo.deliveryDate);
    if (hoursUntilDeadline < 12) riskScore += 25;
    else if (hoursUntilDeadline < 24) riskScore += 15;

    return Math.min(100, riskScore);
  }

  /**
   * Calculate total weighted score
   */
  private calculateTotalScore(metrics: {
    urgencyScore: number;
    difficultyScore: number;
    profitEstimate: number;
    riskScore: number;
    distanceKm: number;
  }): number {
    // Normalize profit to 0-100 scale
    const normalizedProfit = Math.min(100, (metrics.profitEstimate / 1000) * 100);
    
    // Invert difficulty and risk (lower = better)
    const invertedDifficulty = 100 - metrics.difficultyScore;
    const invertedRisk = 100 - metrics.riskScore;

    // Weighted calculation
    const urgencyWeight = 0.25;
    const profitWeight = 0.35;
    const difficultyWeight = 0.20;
    const riskWeight = 0.20;

    const totalScore = 
      (metrics.urgencyScore * urgencyWeight) +
      (normalizedProfit * profitWeight) +
      (invertedDifficulty * difficultyWeight) +
      (invertedRisk * riskWeight);

    return Math.round(totalScore * 10) / 10; // Round to 1 decimal
  }

  /**
   * Batch analyze multiple cargo offers
   */
  public async analyzeMultipleCargo(cargoList: CargoData[]): Promise<(CargoAnalysis & { cargoId: string })[]> {
    console.log(`🔍 Analyzing ${cargoList.length} cargo offers...`);
    
    const analyses = await Promise.all(
      cargoList.map(async (cargo) => {
        const analysis = await this.analyzeCargo(cargo);
        return {
          cargoId: cargo.id,
          ...analysis
        };
      })
    );

    // Sort by total score (best first)
    analyses.sort((a, b) => b.totalScore - a.totalScore);
    
    console.log(`✅ Completed analysis of ${analyses.length} cargo offers`);
    return analyses;
  }

  // Helper methods

  private getHoursUntilDeadline(deadline: Date): number {
    const now = new Date();
    const deadlineTime = new Date(deadline);
    const diffMs = deadlineTime.getTime() - now.getTime();
    return Math.max(0, diffMs / (1000 * 60 * 60)); // Convert to hours
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
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

  private estimateDistanceByLocation(fromCity: string, toCity: string, fromCountry: string, toCountry: string): number {
    // Simplified distance estimation based on common European routes
    const cityDistances: Record<string, Record<string, number>> = {
      'Bucharest': { 'Berlin': 1100, 'Vienna': 650, 'Budapest': 450, 'Warsaw': 850 },
      'Berlin': { 'Paris': 880, 'Amsterdam': 580, 'Prague': 350, 'Vienna': 530 },
      'Paris': { 'Madrid': 1050, 'Rome': 1100, 'London': 460, 'Brussels': 300 },
      'Warsaw': { 'Berlin': 520, 'Prague': 680, 'Vienna': 600, 'Kiev': 760 }
    };

    const fromKey = fromCity;
    const toKey = toCity;

    if (cityDistances[fromKey] && cityDistances[fromKey][toKey]) {
      return cityDistances[fromKey][toKey];
    }

    // Default estimation based on country difference
    if (fromCountry === toCountry) return 150; // Same country
    else return 600; // Different countries
  }
}

// Export singleton instance
export const cargoAnalyzer = new CargoAnalyzer();

// Export for external use
export default cargoAnalyzer;