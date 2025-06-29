/**
 * Response Generator
 * Intelligent response formatting for AI dispatcher
 * Follows the user's specific plan for response formatting (in English)
 */

import { CargoVehicleMatch } from '@/lib/algorithms/matching-engine';
import { MarketplaceCargo } from '@/lib/connectors/marketplace-connector';
import { FleetVehicle } from '@/lib/connectors/gps-fleet-connector';
import { ScoringResult } from '@/lib/algorithms/scoring-system';

export interface GeneratedResponse {
  message: string;
  summary: ResponseSummary;
  suggestions: FormattedSuggestion[];
  recommendation?: RecommendationExplanation;
}

export interface ResponseSummary {
  totalMatches: number;
  bestScore: number;
  averageProfit: number;
  urgentMatches: number;
}

export interface FormattedSuggestion {
  index: number;
  cargoId: string;
  vehicleId: string;
  route: string;
  details: SuggestionDetails;
  priorityLevel: string;
  recommendation: string;
}

export interface SuggestionDetails {
  cargoWeight: number;
  cargoType: string;
  vehicleName: string;
  vehicleType: string;
  distanceToPickup: number;
  estimatedProfit: number;
  totalDuration: number;
  urgencyLevel: string;
  profitMargin: number;
}

export interface RecommendationExplanation {
  suggestionIndex: number;
  reasons: string[];
  explanation: string;
  confidence: number;
}

class ResponseGenerator {

  /**
   * Generate suggestions as specified in user's plan (in English)
   */
  public generateSuggestions(matches: CargoVehicleMatch[]): GeneratedResponse {
    if (!matches || matches.length === 0) {
      return {
        message: "I didn't find any suitable routes at the moment. Should I check again in a few minutes?",
        summary: {
          totalMatches: 0,
          bestScore: 0,
          averageProfit: 0,
          urgentMatches: 0
        },
        suggestions: []
      };
    }

    console.log(`📝 Generating response for ${matches.length} matches`);

    const summary = this.calculateSummary(matches);
    const suggestions = this.formatSuggestions(matches);
    const recommendation = this.generateRecommendation(matches[0], 1);

    // Build main response message as per user's plan structure
    let response = `I found ${matches.length} recommended routes:\n\n`;

    // Add each suggestion with detailed formatting
    suggestions.forEach((suggestion, index) => {
      const num = index + 1;
      response += `${num}. **${suggestion.route}**\n`;
      response += `   📦 Cargo: ${suggestion.details.cargoWeight}kg ${suggestion.details.cargoType}\n`;
      response += `   🚛 Vehicle: ${suggestion.details.vehicleName} (${suggestion.details.vehicleType})\n`;
      response += `   📍 Distance to pickup: ${suggestion.details.distanceToPickup}km\n`;
      response += `   💰 Estimated profit: €${suggestion.details.estimatedProfit}\n`;
      response += `   ⏱️ Total duration: ${suggestion.details.totalDuration} hours\n`;
      response += `   🔥 Priority: ${suggestion.details.urgencyLevel}\n\n`;
    });

    // Add recommendation explanation
    if (recommendation) {
      response += `**My recommendation:** Route #${recommendation.suggestionIndex} - `;
      response += recommendation.explanation;
    }

    return {
      message: response,
      summary,
      suggestions,
      recommendation
    };
  }

  /**
   * Generate response for vehicle-specific query
   */
  public generateVehicleStatusResponse(vehicle: FleetVehicle, nearbyMatches?: CargoVehicleMatch[]): string {
    const location = `${vehicle.currentLat?.toFixed(4) || vehicle.lat.toFixed(4)}, ${vehicle.currentLng?.toFixed(4) || vehicle.lng.toFixed(4)}`;
    const lastUpdate = this.formatTimeAgo(vehicle.lastUpdate);

    let response = `Vehicle ${vehicle.name} is currently located at coordinates (${location}).\n`;
    response += `Status: ${this.formatVehicleStatus(vehicle.status)}\n`;
    response += `Available capacity: ${this.calculateAvailableCapacity(vehicle)}kg\n`;
    response += `Last update: ${lastUpdate}\n`;

    if (nearbyMatches && nearbyMatches.length > 0) {
      response += `\nNearest cargo opportunities for this vehicle:\n\n`;
      
      nearbyMatches.slice(0, 3).forEach((match, index) => {
        const distance = match.vehicleMatch.distanceToPickup;
        const profit = match.estimatedProfit;
        response += `Cargo ${index + 1}: ${match.cargo.fromCity} → ${match.cargo.toCity} (${match.cargo.weight}kg, €${profit} profit)\n`;
      });
    }

    return response;
  }

  /**
   * Generate urgent cargo alert response
   */
  public generateUrgentAlert(urgentMatches: CargoVehicleMatch[]): string {
    if (urgentMatches.length === 0) {
      return "No urgent cargo requiring immediate attention at this time.";
    }

    let response = `🚨 URGENT CARGO ALERT: Found ${urgentMatches.length} urgent cargo requiring immediate dispatch:\n\n`;

    urgentMatches.forEach((match, index) => {
      const cargo = match.cargo;
      const vehicle = match.vehicle;
      const deadline = this.formatDeadline(cargo.deliveryDate);
      
      response += `${index + 1}. **URGENT: ${cargo.fromCity} → ${cargo.toCity}**\n`;
      response += `   ⏰ Deadline: ${deadline}\n`;
      response += `   📦 ${cargo.weight}kg ${cargo.cargoType}\n`;
      response += `   🚛 Assigned: ${vehicle.name} (${vehicle.licensePlate})\n`;
      response += `   💰 Profit: €${match.estimatedProfit}\n`;
      response += `   📍 Vehicle distance: ${match.vehicleMatch.distanceToPickup.toFixed(1)}km\n\n`;
    });

    response += "**Action required:** Dispatch vehicles immediately to meet deadlines.";
    return response;
  }

  /**
   * Generate daily summary response
   */
  public generateDailySummary(allMatches: CargoVehicleMatch[], completedRoutes: number = 0): string {
    const totalRevenue = allMatches.reduce((sum, match) => sum + match.cargo.price, 0);
    const totalProfit = allMatches.reduce((sum, match) => sum + match.estimatedProfit, 0);
    const avgScore = allMatches.reduce((sum, match) => sum + match.score, 0) / allMatches.length;

    let response = `📊 **Daily Fleet Summary**\n\n`;
    response += `🚛 Available routes: ${allMatches.length}\n`;
    response += `✅ Completed routes: ${completedRoutes}\n`;
    response += `💰 Total potential revenue: €${totalRevenue.toLocaleString()}\n`;
    response += `📈 Total estimated profit: €${totalProfit.toLocaleString()}\n`;
    response += `⭐ Average match score: ${avgScore.toFixed(1)}/100\n\n`;

    // Add top opportunities
    const topMatches = allMatches.slice(0, 3);
    response += `**Top opportunities today:**\n`;
    topMatches.forEach((match, index) => {
      response += `${index + 1}. ${match.cargo.fromCity} → ${match.cargo.toCity} (€${match.estimatedProfit} profit)\n`;
    });

    return response;
  }

  /**
   * Generate profit analysis response
   */
  public generateProfitAnalysis(matches: CargoVehicleMatch[]): string {
    if (matches.length === 0) {
      return "No routes available for profit analysis.";
    }

    const profits = matches.map(m => m.estimatedProfit);
    const maxProfit = Math.max(...profits);
    const minProfit = Math.min(...profits);
    const avgProfit = profits.reduce((a, b) => a + b, 0) / profits.length;
    
    const highProfitRoutes = matches.filter(m => m.estimatedProfit > avgProfit * 1.2);
    const lowProfitRoutes = matches.filter(m => m.estimatedProfit < avgProfit * 0.8);

    let response = `💰 **Profit Analysis**\n\n`;
    response += `📊 Profit range: €${minProfit.toFixed(0)} - €${maxProfit.toFixed(0)}\n`;
    response += `📈 Average profit: €${avgProfit.toFixed(0)}\n`;
    response += `🎯 High-profit routes (>${(avgProfit * 1.2).toFixed(0)}): ${highProfitRoutes.length}\n`;
    response += `⚠️ Low-profit routes (<€${(avgProfit * 0.8).toFixed(0)}): ${lowProfitRoutes.length}\n\n`;

    if (highProfitRoutes.length > 0) {
      response += `**Most profitable routes:**\n`;
      highProfitRoutes.slice(0, 3).forEach((match, index) => {
        const margin = match.details.profitMargin;
        response += `${index + 1}. ${match.cargo.fromCity} → ${match.cargo.toCity}: €${match.estimatedProfit} (${margin.toFixed(1)}% margin)\n`;
      });
    }

    return response;
  }

  // Private helper methods

  private calculateSummary(matches: CargoVehicleMatch[]): ResponseSummary {
    const profits = matches.map(m => m.estimatedProfit);
    const scores = matches.map(m => m.score);
    const urgentMatches = matches.filter(m => m.cargo.urgency === 'high').length;

    return {
      totalMatches: matches.length,
      bestScore: Math.max(...scores),
      averageProfit: profits.reduce((a, b) => a + b, 0) / profits.length,
      urgentMatches
    };
  }

  private formatSuggestions(matches: CargoVehicleMatch[]): FormattedSuggestion[] {
    return matches.map((match, index) => ({
      index: index + 1,
      cargoId: match.cargo.id,
      vehicleId: match.vehicle.id,
      route: `${match.cargo.fromCity} → ${match.cargo.toCity}`,
      details: {
        cargoWeight: match.cargo.weight,
        cargoType: match.cargo.cargoType,
        vehicleName: match.vehicle.name,
        vehicleType: match.vehicle.vehicleType || 'TRUCK',
        distanceToPickup: Math.round(match.vehicleMatch.distanceToPickup),
        estimatedProfit: Math.round(match.estimatedProfit),
        totalDuration: Math.round(match.cargoAnalysis.estimatedDuration),
        urgencyLevel: this.getUrgencyText(match.cargo.urgency),
        profitMargin: match.details.profitMargin
      },
      priorityLevel: this.getPriorityLevel(match.score),
      recommendation: this.getShortRecommendation(match)
    }));
  }

  private generateRecommendation(bestMatch: CargoVehicleMatch, index: number): RecommendationExplanation {
    const reasons = this.analyzeRecommendationReasons(bestMatch);
    const explanation = this.explainRecommendation(bestMatch, reasons);
    
    return {
      suggestionIndex: index,
      reasons,
      explanation,
      confidence: this.calculateConfidence(bestMatch)
    };
  }

  private analyzeRecommendationReasons(match: CargoVehicleMatch): string[] {
    const reasons: string[] = [];
    
    if (match.details.urgencyScore > 75) {
      reasons.push("very urgent");
    }
    if (match.details.profitMargin > 30) {
      reasons.push("excellent profit");
    }
    if (match.vehicleMatch.distanceToPickup < 20) {
      reasons.push("vehicle very close");
    }
    if (match.score > 85) {
      reasons.push("high match score");
    }
    if (match.riskLevel === 'low') {
      reasons.push("low risk");
    }

    return reasons;
  }

  private explainRecommendation(match: CargoVehicleMatch, reasons: string[]): string {
    if (reasons.length === 0) {
      return "the best balance between profit and efficiency.";
    }

    const reasonText = reasons.length === 1 
      ? reasons[0] 
      : reasons.slice(0, -1).join(", ") + " and " + reasons[reasons.length - 1];

    return `the best option because it is ${reasonText}.`;
  }

  private getUrgencyText(urgency: string): string {
    const urgencyMap: Record<string, string> = {
      'high': 'High',
      'medium': 'Medium', 
      'low': 'Low'
    };
    return urgencyMap[urgency] || 'Medium';
  }

  private getPriorityLevel(score: number): string {
    if (score > 85) return 'High Priority';
    if (score > 70) return 'Medium Priority';
    if (score > 55) return 'Low Priority';
    return 'Consider Carefully';
  }

  private getShortRecommendation(match: CargoVehicleMatch): string {
    if (match.score > 85) return 'Highly Recommended';
    if (match.score > 70) return 'Recommended';
    if (match.score > 55) return 'Consider';
    return 'Review Carefully';
  }

  private calculateConfidence(match: CargoVehicleMatch): number {
    // Confidence based on score and risk level
    let confidence = match.score;
    
    if (match.riskLevel === 'low') confidence += 5;
    else if (match.riskLevel === 'high') confidence -= 10;
    
    if (match.details.profitMargin > 25) confidence += 5;
    else if (match.details.profitMargin < 10) confidence -= 10;

    return Math.max(0, Math.min(100, confidence));
  }

  private formatVehicleStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'idle': 'Available',
      'in_transit': 'In Transit',
      'en_route': 'En Route',
      'loading': 'Loading',
      'unloading': 'Unloading',
      'maintenance': 'In Maintenance',
      'assigned': 'Assigned',
      'out_of_service': 'Out of Service'
    };
    return statusMap[status] || 'Unknown';
  }

  private calculateAvailableCapacity(vehicle: FleetVehicle): number {
    const maxCapacity = vehicle.capacityKg || 3500;
    // This would need real assignment data - using placeholder
    return maxCapacity;
  }

  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  }

  private formatDeadline(deadline: Date): string {
    const now = new Date();
    const deadlineTime = new Date(deadline);
    const diffHours = (deadlineTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return `in ${Math.round(diffHours)} hours`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `in ${diffDays} days`;
    }
  }
}

// Export singleton instance
export const responseGenerator = new ResponseGenerator();

// Export for external use
export default responseGenerator;