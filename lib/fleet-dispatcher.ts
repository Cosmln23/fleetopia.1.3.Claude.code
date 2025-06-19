import { prisma } from './prisma';
import { CargoOffer, Vehicle, VehicleStatus } from '@prisma/client';
import { DispatcherSuggestion, DispatcherAnalysis } from './dispatcher-types';

export class FleetDispatcher {
  private static instance: FleetDispatcher;
  
  public static getInstance(): FleetDispatcher {
    if (!FleetDispatcher.instance) {
      FleetDispatcher.instance = new FleetDispatcher();
    }
    return FleetDispatcher.instance;
  }

  async getDispatcherAnalysis(userId: string): Promise<DispatcherAnalysis> {
    try {
      // Get user's available vehicles
      const userFleets = await prisma.fleet.findMany({
        where: { userId },
        include: {
          vehicles: {
            where: {
              status: { in: ['idle', 'assigned'] }
            }
          }
        }
      });

      const availableVehicles = userFleets.reduce((acc, fleet) => acc + fleet.vehicles.length, 0);

      // Get new cargo offers (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const newOffers = await prisma.cargoOffer.findMany({
        where: {
          status: 'NEW',
          createdAt: { gte: yesterday }
        }
      });

      // Calculate today's estimated profit from suggestions
      const suggestions = await this.generateSuggestions(userId, newOffers.slice(0, 10));
      const todayProfit = suggestions.reduce((acc, s) => acc + s.estimatedProfit, 0);

      // Generate alerts
      const alerts = await this.generateAlerts(userId, availableVehicles, newOffers.length);

      return {
        availableVehicles,
        newOffers: newOffers.length,
        todayProfit,
        suggestions,
        alerts
      };
    } catch (error) {
      console.error('Dispatcher analysis error:', error);
      return {
        availableVehicles: 0,
        newOffers: 0,
        todayProfit: 0,
        suggestions: [],
        alerts: ['Error loading dispatcher data']
      };
    }
  }

  private async generateSuggestions(
    userId: string, 
    cargoOffers: CargoOffer[]
  ): Promise<DispatcherSuggestion[]> {
    const suggestions: DispatcherSuggestion[] = [];

    // Get user's vehicles
    const userFleets = await prisma.fleet.findMany({
      where: { userId },
      include: {
        vehicles: {
          where: {
            status: { in: ['idle', 'assigned'] }
          }
        }
      }
    });

    const allVehicles = userFleets.flatMap(fleet => fleet.vehicles);

    for (const offer of cargoOffers) {
      const bestVehicle = this.findBestVehicleForOffer(offer, allVehicles);
      
      if (bestVehicle) {
        const analysis = this.analyzeOfferProfitability(offer, bestVehicle);
        
        suggestions.push({
          id: `suggestion_${offer.id}_${bestVehicle.id}`,
          cargoOfferId: offer.id,
          vehicleId: bestVehicle.id,
          vehicleName: bestVehicle.name || 'Vehicle',
          vehicleLicensePlate: (bestVehicle as any).licensePlate || (bestVehicle as any).plateNumber || '',
          title: `${offer.title} ➜ ${bestVehicle.name}`,
          estimatedProfit: analysis.profit,
          estimatedDistance: analysis.distance,
          estimatedDuration: analysis.duration,
          confidence: analysis.confidence,
          reasoning: analysis.reasoning,
          priority: analysis.priority,
        });
      }
    }

    // Sort by profit potential
    return suggestions
      .sort((a, b) => b.estimatedProfit - a.estimatedProfit)
      .slice(0, 5); // Top 5 suggestions
  }

  private findBestVehicleForOffer(offer: CargoOffer, vehicles: Vehicle[]): Vehicle | null {
    if (vehicles.length === 0) return null;

    // Simple logic: find idle vehicle, prefer by type match
    const idleVehicles = vehicles.filter(v => v.status === 'idle');
    if (idleVehicles.length > 0) {
      return idleVehicles[0]; // For now, return first available
    }

    // If no idle, return assigned vehicle (could be scheduled)
    const assignedVehicles = vehicles.filter(v => v.status === 'assigned');
    return assignedVehicles[0] || null;
  }

  private analyzeOfferProfitability(offer: CargoOffer, vehicle: Vehicle) {
    // Simplified profitability calculation
    const baseDistance = offer.distance || this.estimateDistance(offer.fromCity, offer.toCity);
    const fuelCost = this.calculateFuelCost(baseDistance, vehicle.fuelConsumption || 30);
    const profit = offer.price - fuelCost - 50; // 50 EUR other costs
    
    const confidence = this.calculateConfidence(offer, vehicle);
    const priority = profit > 500 ? 'high' : profit > 200 ? 'medium' : 'low';
    
    return {
      profit: Math.round(profit),
      distance: baseDistance,
      duration: Math.round(baseDistance / 60), // Rough estimate: 60 km/h average
      confidence,
      priority: priority as 'high' | 'medium' | 'low',
      reasoning: this.generateReasoning(offer, vehicle, profit, baseDistance)
    };
  }

  private estimateDistance(fromCity: string, toCity: string): number {
    // Simplified distance estimation
    const distances: { [key: string]: number } = {
      'bucuresti-constanta': 225,
      'bucuresti-cluj': 450,
      'bucuresti-timisoara': 550,
      'bucuresti-iasi': 400,
      'bucuresti-brasov': 180,
      'cluj-timisoara': 320,
      'cluj-bucuresti': 450,
      'constanta-bucuresti': 225,
    };

    const key = `${fromCity.toLowerCase()}-${toCity.toLowerCase()}`;
    const reverseKey = `${toCity.toLowerCase()}-${fromCity.toLowerCase()}`;
    
    return distances[key] || distances[reverseKey] || 300; // Default 300km
  }

  private calculateFuelCost(distance: number, consumption: number): number {
    const fuelPricePerLiter = 1.4; // EUR per liter
    const fuelNeeded = (distance * consumption) / 100;
    return Math.round(fuelNeeded * fuelPricePerLiter);
  }

  private calculateConfidence(offer: CargoOffer, vehicle: Vehicle): number {
    let confidence = 70; // Base confidence
    
    // Increase confidence based on factors
    if (offer.urgency === 'low') confidence += 10; // Less rush = more reliable
    if (offer.companyRating && offer.companyRating > 4) confidence += 15;
    if (vehicle.status === 'idle') confidence += 10;
    
    return Math.min(confidence, 95); // Max 95% confidence
  }

  private generateReasoning(offer: CargoOffer, vehicle: Vehicle, profit: number, distance: number): string {
    if (profit > 500) {
      return `Excellent profit of €${profit} for ${distance}km. Vehicle ${vehicle.name} is ${vehicle.status === 'idle' ? 'immediately available' : 'available for scheduling'}.`;
    } else if (profit > 200) {
      return `Decent profit of €${profit}. Route of ${distance}km with vehicle ${vehicle.name}.`;
    } else {
      return `Small profit (€${profit}) but may be useful for filling the schedule.`;
    }
  }

  private async generateAlerts(userId: string, availableVehicles: number, newOffers: number): Promise<string[]> {
    const alerts: string[] = [];

    if (availableVehicles === 0) {
      alerts.push('⚠️ Toate vehiculele sunt ocupate. Consideră să adaugi mai multe vehicule.');
    }

    if (newOffers > availableVehicles * 3) {
      alerts.push('🔥 Multe oferte noi disponibile! Verifică sugestiile pentru oportunități.');
    }

    if (availableVehicles > 0 && newOffers === 0) {
      alerts.push('📊 Vehicule disponibile dar puține oferte noi. Explorează piața.');
    }

    // Check for urgent offers
    const urgentOffers = await prisma.cargoOffer.count({
      where: {
        status: 'NEW',
        urgency: 'high',
        createdAt: { gte: new Date(Date.now() - 6 * 60 * 60 * 1000) } // Last 6 hours
      }
    });

    if (urgentOffers > 0) {
      alerts.push(`🚨 ${urgentOffers} oferte urgente în ultimele 6 ore!`);
    }

    return alerts;
  }

  async acceptSuggestion(suggestionId: string, userId: string): Promise<boolean> {
    try {
      // Extract IDs from suggestion
      const [, cargoOfferId, vehicleId] = suggestionId.split('_');
      
      // Update cargo offer to show interest
      await prisma.cargoOffer.update({
        where: { id: cargoOfferId },
        data: { acceptedByUserId: userId }
      });

      // Update vehicle status
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'assigned' }
      });

      return true;
    } catch (error) {
      console.error('Error accepting suggestion:', error);
      return false;
    }
  }

  getPersonalizedMessage(userName: string, analysis: DispatcherAnalysis): string {
    const { availableVehicles, newOffers, suggestions, todayProfit } = analysis;

    if (availableVehicles === 0) {
      return `Salut ${userName}! Toate vehiculele tale sunt ocupate momentan. 📊`;
    }

    if (suggestions.length === 0) {
      return `Salut ${userName}! Ai ${availableVehicles} vehicule disponibile, dar nu sunt oferte potrivite acum. Revin cu sugestii noi! 🚛`;
    }

    const topSuggestion = suggestions[0];
    const vehicleName = topSuggestion.vehicleId; // Will be replaced with actual vehicle name

    return `Hello ${userName}! 🎯 Found ${suggestions.length} opportunities for you. 
    
Best opportunity: €${topSuggestion.estimatedProfit} profit for ${topSuggestion.estimatedDistance}km. 

Estimated profit today: €${todayProfit} with ${availableVehicles} vehicles available.`;
  }
}

export const fleetDispatcher = FleetDispatcher.getInstance();
