// Basic Fuel API Adapter - CHEAP Implementation
import type {
  UniversalFuelAPI,
  APIResponse,
  FuelStation,
  FuelPriceHistory,
  FuelRecommendation,
  FuelOptimization,
  FuelOptimizationParams,
  RouteQuery,
  FuelPrices,
  LocationQuery,
  APICredentials,
  FuelType,
} from '../universal-api-bridge';

export class BasicFuelAdapter implements UniversalFuelAPI {
  private apiKey: string;

  constructor(credentials: APICredentials) {
    if (!credentials.apiKey) {
      throw new Error('Basic Fuel API requires an API key');
    }
    this.apiKey = credentials.apiKey;
  }

  async getFuelPrices(location: LocationQuery, radius: number = 25): Promise<APIResponse<FuelStation[]>> {
    const startTime = Date.now();
    
    try {
      const coordinates = await this.getCoordinates(location);
      
      // Simulate European fuel stations data
      const stations = this.generateFuelStations(coordinates, radius);

      return {
        success: true,
        data: stations,
        responseTime: Date.now() - startTime,
        provider: 'basic_fuel',
        rateLimitRemaining: 950 // Simulate remaining quota
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Fuel prices fetch failed',
        responseTime: Date.now() - startTime,
        provider: 'basic_fuel'
      };
    }
  }

  async getFuelPriceHistory(stationId: string, days: number): Promise<APIResponse<FuelPriceHistory[]>> {
    const startTime = Date.now();
    
    try {
      const history: FuelPriceHistory[] = [];
      
      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        history.push({
          date: date,
          dieselPrice: this.generateRealisticPrice('diesel', i),
          gasolinePrice: this.generateRealisticPrice('gasoline', i),
          lpgPrice: this.generateRealisticPrice('lpg', i),
          cngPrice: this.generateRealisticPrice('cng', i)
        });
      }

      return {
        success: true,
        data: history,
        responseTime: Date.now() - startTime,
        provider: 'basic_fuel'
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Price history fetch failed',
        responseTime: Date.now() - startTime,
        provider: 'basic_fuel'
      };
    }
  }

  async findCheapestFuel(route: RouteQuery, fuelType: FuelType): Promise<APIResponse<FuelRecommendation>> {
    const startTime = Date.now();
    
    try {
      // Simulate route analysis for cheapest fuel
      const recommendations = await this.analyzeFuelAlongRoute(route, fuelType);

      return {
        success: true,
        data: recommendations,
        responseTime: Date.now() - startTime,
        provider: 'basic_fuel'
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Fuel optimization failed',
        responseTime: Date.now() - startTime,
        provider: 'basic_fuel'
      };
    }
  }

  async getFuelConsumptionOptimization(params: FuelOptimizationParams): Promise<APIResponse<FuelOptimization>> {
    const startTime = Date.now();
    
    try {
      const optimization = await this.calculateFuelOptimization(params);

      return {
        success: true,
        data: optimization,
        responseTime: Date.now() - startTime,
        provider: 'basic_fuel'
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Fuel optimization failed',
        responseTime: Date.now() - startTime,
        provider: 'basic_fuel'
      };
    }
  }

  private async getCoordinates(location: LocationQuery): Promise<{ lat: number; lng: number }> {
    if (location.latitude && location.longitude) {
      return { lat: location.latitude, lng: location.longitude };
    }

    // Use a simple geocoding simulation for European cities
    const europeanCities: Record<string, { lat: number; lng: number }> = {
      'berlin': { lat: 52.5200, lng: 13.4050 },
      'paris': { lat: 48.8566, lng: 2.3522 },
      'madrid': { lat: 40.4168, lng: -3.7038 },
      'rome': { lat: 41.9028, lng: 12.4964 },
      'amsterdam': { lat: 52.3676, lng: 4.9041 },
      'vienna': { lat: 48.2082, lng: 16.3738 },
      'bucharest': { lat: 44.4268, lng: 26.1025 },
      'warsaw': { lat: 52.2297, lng: 21.0122 },
      'prague': { lat: 50.0755, lng: 14.4378 },
      'budapest': { lat: 47.4979, lng: 19.0402 }
    };

    const cityKey = (location.city || location.address || '').toLowerCase();
    const found = Object.keys(europeanCities).find(city => cityKey.includes(city));
    
    if (found) {
      return europeanCities[found];
    }

    // Default to center of Europe if location not found
    return { lat: 50.0755, lng: 14.4378 }; // Prague
  }

  private generateFuelStations(center: { lat: number; lng: number }, radius: number): FuelStation[] {
    const stations: FuelStation[] = [];
    const stationCount = Math.min(20, Math.max(5, Math.floor(radius / 5))); // 5-20 stations
    
    const brands = ['Shell', 'BP', 'Total', 'Eni', 'Repsol', 'OMV', 'MOL', 'Lukoil', 'Esso', 'Q8'];
    
    for (let i = 0; i < stationCount; i++) {
      const distance = Math.random() * radius;
      const angle = Math.random() * 2 * Math.PI;
      
      // Convert distance and angle to lat/lng offset
      const latOffset = (distance / 111) * Math.cos(angle); // 111 km per degree lat
      const lngOffset = (distance / (111 * Math.cos(center.lat * Math.PI / 180))) * Math.sin(angle);
      
      const station: FuelStation = {
        id: `station_${i + 1}`,
        name: `${brands[i % brands.length]} Station ${i + 1}`,
        brand: brands[i % brands.length],
        location: {
          address: `Station Address ${i + 1}`,
          city: 'Unknown',
          country: this.getCountryFromCoordinates(center),
          latitude: center.lat + latOffset,
          longitude: center.lng + lngOffset
        },
        prices: this.generateCurrentPrices(),
        amenities: this.generateAmenities(),
        isOpen: Math.random() > 0.1, // 90% chance of being open
        distance: Math.round(distance * 10) / 10,
        lastUpdated: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000) // Up to 2 hours ago
      };
      
      stations.push(station);
    }
    
    // Sort by distance
    stations.sort((a, b) => a.distance - b.distance);
    
    return stations;
  }

  private generateCurrentPrices(): FuelPrices {
    // European average prices (€/liter) with realistic variation
    return {
      diesel: this.generateRealisticPrice('diesel', 0),
      gasoline: this.generateRealisticPrice('gasoline', 0),
      lpg: this.generateRealisticPrice('lpg', 0),
      cng: this.generateRealisticPrice('cng', 0),
      electric: Math.round((0.25 + Math.random() * 0.15) * 100) / 100 // €0.25-0.40/kWh
    };
  }

  private generateRealisticPrice(fuelType: FuelType, daysAgo: number): number {
    const basePrices = {
      diesel: 1.45,    // €/liter
      gasoline: 1.55,  // €/liter
      lpg: 0.65,       // €/liter
      cng: 1.20,       // €/kg
      electric: 0.30   // €/kWh
    };
    
    const basePrice = basePrices[fuelType] || 1.50;
    const variation = (Math.random() - 0.5) * 0.20; // ±10 cents variation
    const timeVariation = Math.sin(daysAgo * 0.1) * 0.05; // Small time-based variation
    
    return Math.round((basePrice + variation + timeVariation) * 100) / 100;
  }

  private generateAmenities(): string[] {
    const allAmenities = [
      'Restaurant', 'Toilet', 'Shower', 'Parking', 'WiFi', 
      'ATM', 'Shop', 'Truck Parking', 'Car Wash', 'Air Pump'
    ];
    
    const count = Math.floor(Math.random() * 6) + 2; // 2-7 amenities
    return allAmenities.sort(() => Math.random() - 0.5).slice(0, count);
  }

  private getCountryFromCoordinates(coords: { lat: number; lng: number }): string {
    // Simple approximation based on coordinates
    if (coords.lat > 54) return 'Nordic Countries';
    if (coords.lat > 50 && coords.lng < 5) return 'UK/Ireland';
    if (coords.lat > 50 && coords.lng < 15) return 'Germany/Netherlands';
    if (coords.lat > 46 && coords.lng < 10) return 'France/Switzerland';
    if (coords.lat > 42 && coords.lng < 5) return 'Spain';
    if (coords.lat > 40 && coords.lng < 15) return 'Italy';
    if (coords.lng > 20) return 'Eastern Europe';
    return 'Central Europe';
  }

  private async analyzeFuelAlongRoute(route: RouteQuery, fuelType: FuelType): Promise<FuelRecommendation> {
    // Simulate route analysis
    const stations = [
      {
        station: {
          id: 'route_station_1',
          name: 'Cheapest Station',
          brand: 'Local',
          location: {
            address: 'Route Location 1',
            city: 'Route City',
            country: 'Route Country',
            latitude: route.origin.lat + 0.1,
            longitude: route.origin.lng + 0.1
          },
          prices: this.generateCurrentPrices(),
          amenities: ['Parking', 'Toilet'],
          isOpen: true,
          distance: 15.5,
          lastUpdated: new Date()
        },
        savingsPerLiter: 0.08,
        totalSavings: 12.50,
        detourDistance: 2.1,
        detourTime: 3
      }
    ];

    return {
      fuelType,
      route: {
        origin: route.origin,
        destination: route.destination,
        distance: route.distance || 450
      },
      recommendedStations: stations,
      totalPotentialSavings: 12.50,
      averagePriceAlongRoute: this.generateRealisticPrice(fuelType, 0),
      cheapestPrice: this.generateRealisticPrice(fuelType, 0) - 0.08,
      analysis: {
        bestStrategy: 'fuel_at_cheapest',
        confidenceLevel: 0.85,
        lastUpdated: new Date()
      }
    };
  }

  private async calculateFuelOptimization(params: FuelOptimizationParams): Promise<FuelOptimization> {
    return {
      currentConsumption: params.currentConsumption || 35, // L/100km
      optimizedConsumption: (params.currentConsumption || 35) * 0.92, // 8% improvement
      fuelSavings: {
        litersSaved: 12.5,
        costSaved: 18.75,
        co2Reduced: 32.5
      },
      recommendations: [
        {
          category: 'driving_behavior',
          title: 'Optimize Speed',
          description: 'Maintain steady speed between 80-90 km/h for best efficiency',
          potentialSaving: 0.15 // 15% improvement
        },
        {
          category: 'route_planning',
          title: 'Avoid Peak Hours',
          description: 'Plan routes to avoid traffic congestion',
          potentialSaving: 0.08 // 8% improvement
        },
        {
          category: 'vehicle_maintenance',
          title: 'Regular Maintenance',
          description: 'Keep tires properly inflated and engine well-maintained',
          potentialSaving: 0.05 // 5% improvement
        }
      ],
      implementationPlan: [
        'Install fuel consumption monitoring system',
        'Train drivers on eco-driving techniques',
        'Optimize route planning algorithms',
        'Schedule regular vehicle maintenance'
      ]
    };
  }
}

// All interfaces are now imported from '../universal-api-bridge'
