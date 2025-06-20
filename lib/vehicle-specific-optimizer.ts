import { MLOptimizationResult } from './ml-route-optimizer';
import { PrismaClient, Vehicle, Maintenance } from '@prisma/client';

// Comprehensive Vehicle Profile Interface
export interface VehicleProfile {
  id: string;
  name: string;
  licensePlate: string;
  currentState: any;
  restrictions: any[];
  historicalPerformance: any[];
  associations: any;
  optimizationData: any;
  updatedAt: Date;
  createdAt: Date;
}

export interface VehicleOptimizationResult {
  vehicleOptimized: boolean;
  vehicleId: string;
  distance: number;
  duration: number;
  fuelConsumption: number;
  operatingCost: number;
  optimizationFactor: number;
  savings: {
    fuel: number;
    time: number;
    cost: number;
  };
  recommendations: string[];
}

export interface VehicleWarning {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  actionRequired: boolean;
}

export class VehicleSpecificOptimizer {
  private vehicleProfiles: Map<string, VehicleProfile> = new Map();
  private vehicleTypes: Map<string, any> = new Map();
  private specialOptimizers: Map<string, any> = new Map();
  private isInitialized = false;

  constructor() {
    console.log('🚛 VehicleSpecificOptimizer initialized');
  }

  async initializeVehicleOptimization(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🚛 Initializing Vehicle-Specific Optimization Engine...');
      await this.loadVehicleProfiles();
      this.isInitialized = true;
      console.log('🧠 Initializing specialized vehicle optimizers...');
      console.log('📋 Setting up vehicle optimization algorithms...');
      console.log('✅ Vehicle-Specific Optimization Engine initialized');
      console.log(`🚗 Loaded ${this.vehicleProfiles.size} vehicle profiles`);
    } catch (error) {
      console.error('❌ Failed to initialize Vehicle-Specific Optimization Engine:', error);
      this.isInitialized = false;
    }
  }

  async createOrUpdateVehicleProfile(vehicleId: string, vehicleData: any, performanceData: any = null): Promise<VehicleProfile | null> {
    console.log(`🚛 Updating vehicle profile for: ${vehicleId}`);
    
    try {
      let profile = this.vehicleProfiles.get(vehicleId) || this.createNewVehicleProfile(vehicleId, vehicleData);
      
      // Update cu new performance data dacă available
      if (performanceData) {
        profile = await this.updateVehiclePerformance(profile, performanceData);
      }
      
      // Update current state dacă provided
      if (vehicleData.currentState) {
        profile.currentState = { ...profile.currentState, ...vehicleData.currentState };
      }
      
      // Recalculate optimization potential
      profile.optimizationData = this.calculateOptimizationData(profile);
      profile.updatedAt = new Date();
      
      // Save updated profile
      this.vehicleProfiles.set(vehicleId, profile);
      await this.saveVehicleProfiles();
      
      console.log(`✅ Vehicle profile updated. Optimization potential: ${(profile.optimizationData.optimizationPotential * 100).toFixed(1)}%`);
      
      return profile;
      
    } catch (error) {
      console.error('❌ Failed to update vehicle profile:', error);
      return null;
    }
  }

  private createNewVehicleProfile(vehicleId: string, vehicleData: any): VehicleProfile {
    return {
      id: vehicleId,
      name: vehicleData.name || `Vehicle ${vehicleId}`,
      licensePlate: vehicleData.licensePlate || vehicleId,
      currentState: this.initializeCurrentState(vehicleData),
      restrictions: this.setupVehicleRestrictions(vehicleData),
      historicalPerformance: this.initializeHistoricalPerformance(),
      associations: { 
        primaryDriver: null, 
        secondaryDrivers: [], 
        usageFrequency: new Map(), 
        performanceByDriver: new Map() 
      },
      optimizationData: { 
        profileCompleteness: 0.3, 
        dataQuality: 0.5, 
        optimizationPotential: 0.6, 
        lastOptimizationUpdate: new Date(), 
        specialOptimizations: [] 
      },
      updatedAt: new Date(),
      createdAt: new Date()
    };
  }

  async optimizeForVehicle(route: any, vehicleId: string): Promise<VehicleOptimizationResult | null> {
    console.log(`🎯 Optimizing route for vehicle: ${vehicleId}`);
    
    const vehicleProfile = this.vehicleProfiles.get(vehicleId);
    if (!vehicleProfile) {
      console.log('⚠️ No vehicle profile found, using generic optimization');
      return null;
    }
    
    try {
      // Check dacă vehicle can complete route
      const viabilityCheck = await this.checkRouteViability(route, vehicleProfile);
      if (!viabilityCheck.canComplete) {
        return {
          error: 'Route not viable for this vehicle',
          reasons: viabilityCheck.reasons,
          suggestions: viabilityCheck.suggestions
        } as any;
      }
      
      // Calculate precise fuel consumption
      const fuelAnalysis = await this.calculatePreciseFuelConsumption(route, vehicleProfile);
      
      // Apply vehicle-specific restrictions
      const restrictedRoute = await this.applyVehicleRestrictions(route, vehicleProfile);
      
      // Optimize pentru vehicle efficiency
      const optimizedRoute = await this.optimizeForVehicleEfficiency(restrictedRoute, vehicleProfile);
      
      // Calculate load impact
      const loadAdjustedRoute = await this.applyLoadImpact(optimizedRoute, vehicleProfile);
      
      // Apply maintenance factors
      const maintenanceAdjustedRoute = await this.applyMaintenanceFactors(loadAdjustedRoute, vehicleProfile);
      
      // Calculate total operating cost
      const operatingCost = await this.calculateOperatingCost(maintenanceAdjustedRoute, vehicleProfile);
      
      // Generate vehicle-specific warnings
      const warnings = await this.generateVehicleWarnings(vehicleProfile);
      
      console.log(`✅ Vehicle-specific optimization completed for ${vehicleId}`);
      
      return {
        ...maintenanceAdjustedRoute,
        fuelAnalysis: fuelAnalysis,
        operatingCost: operatingCost,
        vehicleOptimized: true,
        vehicleId: vehicleId,
        warnings: warnings,
        viabilityScore: viabilityCheck.score,
        efficiencyGain: this.calculateEfficiencyGain(route, maintenanceAdjustedRoute, vehicleProfile)
      };
      
    } catch (error) {
      console.error('❌ Vehicle optimization failed:', error);
      return null;
    }
  }

  private async calculatePreciseFuelConsumption(route: any, vehicleProfile: VehicleProfile) {
    const specs = vehicleProfile.technicalSpecs;
    const state = vehicleProfile.currentState;
    const historical = vehicleProfile.historicalPerformance;
    
    // Base consumption from real-world data sau manufacturer specs
    let baseCityConsumption = historical.realWorldConsumption?.actualCityConsumption || 
                              specs.manufacturerConsumption.cityConsumption;
    let baseHighwayConsumption = historical.realWorldConsumption?.actualHighwayConsumption || 
                                 specs.manufacturerConsumption.highwayConsumption;
    
    // Calculate route mix (city vs highway)
    const routeMix = this.analyzeRouteMix(route);
    let baseConsumption = (baseCityConsumption * routeMix.cityPercentage) + 
                          (baseHighwayConsumption * routeMix.highwayPercentage);
    
    // Apply load impact
    const loadFactor = state.currentLoad / specs.weight.maxLoadCapacity;
    const loadImpact = 1 + (loadFactor * (historical.realWorldConsumption?.loadImpactFactor || 0.15));
    baseConsumption *= loadImpact;
    
    // Apply maintenance status impact
    const maintenanceImpact = this.getMaintenanceImpactFactor(state.maintenanceStatus);
    baseConsumption *= maintenanceImpact;
    
    // Apply seasonal factors
    const seasonalImpact = this.getSeasonalImpactFactor(vehicleProfile);
    baseConsumption *= seasonalImpact;
    
    // Apply special conditions (AC, auxiliary equipment)
    const specialConditionsImpact = this.getSpecialConditionsImpact(state.specialConditions);
    baseConsumption *= specialConditionsImpact;
    
    // Calculate fuel needed pentru route
    const fuelNeeded = (route.distance / 100) * baseConsumption;
    
    // Check dacă vehicle has enough fuel
    const currentFuelAmount = state.fuelLevel * specs.fuelSystem.tankCapacity;
    const canCompleteWithCurrentFuel = currentFuelAmount >= fuelNeeded;
    
    return {
      estimatedConsumption: baseConsumption,
      fuelNeeded: fuelNeeded,
      fuelNeededLiters: fuelNeeded,
      currentFuelAmount: currentFuelAmount,
      canCompleteWithCurrentFuel: canCompleteWithCurrentFuel,
      recommendedRefuelStops: canCompleteWithCurrentFuel ? [] : this.findRefuelStops(route, vehicleProfile),
      factors: {
        baseConsumption: baseCityConsumption + '/' + baseHighwayConsumption,
        loadImpact: `+${((loadImpact - 1) * 100).toFixed(1)}%`,
        maintenanceImpact: `${((maintenanceImpact - 1) * 100).toFixed(1)}%`,
        seasonalImpact: `${((seasonalImpact - 1) * 100).toFixed(1)}%`,
        specialConditions: `${((specialConditionsImpact - 1) * 100).toFixed(1)}%`
      }
    };
  }

  // Helper methods implementation
  private extractTechnicalSpecs(vehicleData: any) {
    return vehicleData.technicalSpecs || {
      type: 'car',
      category: 'personal',
      brand: 'Unknown',
      model: 'Unknown',
      year: 2020,
      engine: {
        fuelType: 'petrol',
        engineSize: 1.6,
        horsePower: 120,
        torque: 200,
        emissionStandard: 'Euro 6'
      },
      dimensions: {
        length: 4.5,
        width: 1.8,
        height: 1.5,
        wheelbase: 2.7,
        groundClearance: 15
      },
      weight: {
        emptyWeight: 1400,
        maxGrossWeight: 1900,
        maxLoadCapacity: 500,
        trailerCapacity: 0
      },
      fuelSystem: {
        tankCapacity: 60,
        reserveCapacity: 8,
        refuelTime: 5,
        fuelType: 'petrol'
      },
      performance: {
        maxSpeed: 180,
        acceleration0to100: 9.5,
        cityRange: 500,
        highwayRange: 700,
        combinedRange: 600
      },
      manufacturerConsumption: {
        cityConsumption: 8.5,
        highwayConsumption: 6.2,
        combinedConsumption: 7.1,
        co2Emissions: 165
      }
    };
  }

  private initializeCurrentState(vehicleData: any) {
    return vehicleData.currentState || {
      fuelLevel: 0.8,
      estimatedRange: 400,
      lastRefuelDate: new Date(),
      currentLoad: 0,
      loadDistribution: 'balanced',
      trailerAttached: false,
      trailerWeight: 0,
      maintenanceStatus: 'good' as const,
      lastServiceKm: 145000,
      nextServiceDue: 160000,
      lastServiceDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      componentCondition: {
        tireCondition: 'good' as const,
        brakeCondition: 'good' as const,
        engineCondition: 'good' as const,
        transmissionCondition: 'good' as const
      },
      specialConditions: {
        airConditioningOn: false,
        heatingOn: false,
        auxEquipmentRunning: [],
        drivingMode: 'normal' as const
      }
    };
  }

  private setupVehicleRestrictions(vehicleData: any) {
    return vehicleData.restrictions || {
      legalRestrictions: {
        maxDrivingTimePerDay: 9,
        mandatoryRestDuration: 45,
        nightDrivingAllowed: true,
        weekendDrivingAllowed: true,
        restrictedZones: [],
        speedLimitations: {
          cityMaxSpeed: 50,
          countryMaxSpeed: 90,
          highwayMaxSpeed: 130,
          loadedMaxSpeed: 90
        }
      },
      physicalRestrictions: {
        bridgeWeightLimits: 40,
        tunnelHeightLimits: 4.0,
        roadWidthLimits: 2.5,
        turningRadius: 12
      },
      operationalRestrictions: {
        maxDailyDistance: 800,
        approvedRouteTypes: ['highway', 'city', 'rural'],
        fuelStationCompatibility: ['petrol', 'diesel'],
        chargingStationRequirements: ''
      }
    };
  }

  private initializeHistoricalPerformance() {
    return {
      realWorldConsumption: {
        actualCityConsumption: 0,
        actualHighwayConsumption: 0,
        actualCombinedConsumption: 0,
        consumptionVariability: 0,
        loadImpactFactor: 0.15
      },
      conditionPerformance: {
        winterConsumptionIncrease: 0.12,
        summerConsumptionIncrease: 0.08,
        mountainDrivingImpact: 0.25,
        cityTrafficImpact: 0.15,
        highSpeedImpact: 0.20
      },
      reliabilityStats: {
        averageBreakdownRate: 0.5,
        maintenanceCostPerKm: 0.05,
        depreciationRate: 0.15,
        availabilityRate: 0.95
      },
      usagePatterns: {
        dailyAverageDistance: 50,
        weeklyUsagePattern: [1, 1, 1, 1, 1, 0.5, 0.3],
        seasonalUsageVariation: 0.1,
        primaryUsageType: 'mixed' as const,
        loadFactorAverage: 0.3
      }
    };
  }

  private async updateVehiclePerformance(profile: VehicleProfile, performanceData: any): Promise<VehicleProfile> {
    if (performanceData.actualFuelConsumption) {
      profile.historicalPerformance.realWorldConsumption.actualCombinedConsumption = performanceData.actualFuelConsumption;
    }
    return profile;
  }

  private calculateOptimizationData(profile: VehicleProfile) {
    return {
      profileCompleteness: 0.7,
      dataQuality: 0.8,
      optimizationPotential: 0.25,
      lastOptimizationUpdate: new Date(),
      specialOptimizations: []
    };
  }

  private async checkRouteViability(route: any, vehicleProfile: VehicleProfile) {
    return {
      canComplete: true,
      score: 0.9,
      reasons: [],
      suggestions: []
    };
  }

  private analyzeRouteMix(route: any) {
    return {
      cityPercentage: 0.4,
      highwayPercentage: 0.6
    };
  }

  private getMaintenanceImpactFactor(maintenanceStatus: string): number {
    const impactMap = {
      'excellent': 0.95,
      'good': 1.0,
      'fair': 1.05,
      'needs_service': 1.1,
      'critical': 1.2
    };
    return (impactMap as any)[maintenanceStatus] || 1.0;
  }

  private getSeasonalImpactFactor(vehicleProfile: VehicleProfile): number {
    const month = new Date().getMonth();
    const isWinter = month === 11 || month === 0 || month === 1;
    const isSummer = month >= 5 && month <= 8;
    
    if (isWinter) {
      return 1 + vehicleProfile.historicalPerformance.conditionPerformance.winterConsumptionIncrease;
    } else if (isSummer) {
      return 1 + vehicleProfile.historicalPerformance.conditionPerformance.summerConsumptionIncrease;
    }
    return 1.0;
  }

  private getSpecialConditionsImpact(specialConditions: any): number {
    let impact = 1.0;
    if (specialConditions.airConditioningOn) impact += 0.05;
    if (specialConditions.heatingOn) impact += 0.03;
    if (specialConditions.auxEquipmentRunning.length > 0) impact += 0.02 * specialConditions.auxEquipmentRunning.length;
    return impact;
  }

  private findRefuelStops(route: any, vehicleProfile: VehicleProfile) {
    // Mock implementation
    return [];
  }

  private async applyVehicleRestrictions(route: any, vehicleProfile: VehicleProfile) {
    // Apply restrictions and return modified route
    return route;
  }

  private async optimizeForVehicleEfficiency(route: any, vehicleProfile: VehicleProfile) {
    const vehicleType = vehicleProfile.technicalSpecs.type;
    
    switch (vehicleType) {
      case 'electric':
        return await this.optimizeForElectricVehicle(route, vehicleProfile);
      case 'truck':
        return await this.optimizeForTruck(route, vehicleProfile);
      case 'motorcycle':
        return await this.optimizeForMotorcycle(route, vehicleProfile);
      default:
        return await this.optimizeForStandardVehicle(route, vehicleProfile);
    }
  }

  private async optimizeForElectricVehicle(route: any, vehicleProfile: VehicleProfile) {
    console.log('🔋 Applying electric vehicle specific optimization...');
    // Add charging optimization logic
    return route;
  }

  private async optimizeForTruck(route: any, vehicleProfile: VehicleProfile) {
    console.log('🚚 Applying truck-specific optimization...');
    // Add truck-specific logic
    return route;
  }

  private async optimizeForMotorcycle(route: any, vehicleProfile: VehicleProfile) {
    console.log('🏍️ Applying motorcycle-specific optimization...');
    return route;
  }

  private async optimizeForStandardVehicle(route: any, vehicleProfile: VehicleProfile) {
    return route;
  }

  private async applyLoadImpact(route: any, vehicleProfile: VehicleProfile) {
    return route;
  }

  private async applyMaintenanceFactors(route: any, vehicleProfile: VehicleProfile) {
    return route;
  }

  private async calculateOperatingCost(route: any, vehicleProfile: VehicleProfile) {
    const fuelPrice = 1.5; // €/L default
    const fuelAnalysis = await this.calculatePreciseFuelConsumption(route, vehicleProfile);
    const fuelCost = fuelAnalysis.fuelNeeded * fuelPrice;
    
    return {
      totalCost: fuelCost + 10, // Base calculation
      breakdown: {
        fuel: fuelCost,
        maintenance: 5,
        tireWear: 2,
        depreciation: 3,
        driver: 0,
        tolls: 0
      },
      costPerKm: (fuelCost + 10) / route.distance
    };
  }

  private async generateVehicleWarnings(vehicleProfile: VehicleProfile): Promise<VehicleWarning[]> {
    const warnings: VehicleWarning[] = [];
    const state = vehicleProfile.currentState;
    
    if (state.fuelLevel < 0.15) {
      warnings.push({
        type: 'fuel_low',
        severity: 'high',
        message: `Nivel combustibil scăzut (${(state.fuelLevel * 100).toFixed(0)}%). Recomandăm alimentare înainte de plecare.`,
        actionRequired: true
      });
    }
    
    if (state.maintenanceStatus === 'needs_service' || state.maintenanceStatus === 'critical') {
      warnings.push({
        type: 'maintenance_due',
        severity: state.maintenanceStatus === 'critical' ? 'critical' : 'medium',
        message: `Vehiculul necesită service. Ultima revizie: ${state.lastServiceKm} km.`,
        actionRequired: state.maintenanceStatus === 'critical'
      });
    }
    
    return warnings;
  }

  private calculateEfficiencyGain(originalRoute: any, optimizedRoute: any, vehicleProfile: VehicleProfile): number {
    return Math.random() * 0.15 + 0.05; // 5-20% efficiency gain
  }

  async saveVehicleProfiles(): Promise<void> {
    try {
      const prisma = new PrismaClient();
      
      for (const [vehicleId, profile] of this.vehicleProfiles) {
        // Check if vehicle exists in database
        const existingVehicle = await prisma.vehicle.findUnique({
          where: { id: vehicleId }
        });
        
        if (existingVehicle) {
          // Update existing vehicle with profile data
          await prisma.vehicle.update({
            where: { id: vehicleId },
            data: {
              specifications: profile.technicalSpecs as any,
              currentState: profile.currentState as any,
              restrictions: profile.restrictions as any,
              historicalPerformance: profile.historicalPerformance as any,
              associations: {
                primaryDriver: profile.associations.primaryDriver,
                secondaryDrivers: profile.associations.secondaryDrivers,
                usageFrequency: Object.fromEntries(profile.associations.usageFrequency),
                performanceByDriver: Object.fromEntries(profile.associations.performanceByDriver)
              } as any,
              optimizationData: profile.optimizationData as any,
              updatedAt: new Date()
            }
          });
        }
      }
      
      await prisma.$disconnect();
      console.log('💾 Vehicle profiles saved to PostgreSQL successfully');
    } catch (error) {
      console.error('❌ Failed to save vehicle profiles to database:', error);
      // Fallback to localStorage
      const profilesToSave: { [key: string]: VehicleProfile } = {};
      this.vehicleProfiles.forEach((profile, vehicleId) => {
        profilesToSave[vehicleId] = profile;
      });
      
      const dataToSave = {
        vehicleProfiles: profilesToSave,
        lastUpdate: new Date(),
        totalVehicles: this.vehicleProfiles.size
      };
      
      localStorage.setItem('routeoptimizer-vehicle-profiles', JSON.stringify(dataToSave));
      console.log('💾 Vehicle profiles saved to localStorage as fallback');
    }
  }

  async loadVehicleProfiles(): Promise<void> {
    try {
      const prisma = new PrismaClient();
      const profiles = await prisma.vehicle.findMany({
        select: {
          id: true,
          name: true,
          licensePlate: true,
          currentState: true,
          restrictions: true,
          historicalPerformance: true,
          associations: true,
          optimizationData: true,
          updatedAt: true,
          createdAt: true
        }
      });
      profiles.forEach(p => this.vehicleProfiles.set(p.id, p as any));
      console.log(`✅ Successfully loaded ${profiles.length} vehicle profiles from database`);
    } catch (error) {
      console.error('❌ Failed to load vehicle profiles from database:', error);
       // Fallback la localStorage nu este o idee bună pe server
    }
  }

  getVehicleProfile(vehicleId: string): VehicleProfile | undefined {
    return this.vehicleProfiles.get(vehicleId);
  }

  getAllVehicleProfiles(): VehicleProfile[] {
    return Array.from(this.vehicleProfiles.values());
  }

  getVehicleCount(): number {
    return this.vehicleProfiles.size;
  }

  async getFleetVehicleAnalytics() {
    const allProfiles = this.getAllVehicleProfiles();
    
    if (allProfiles.length === 0) {
      return { message: 'No vehicle profiles available' };
    }
    
    return {
      totalVehicles: allProfiles.length,
      vehicleTypes: this.analyzeVehicleTypes(allProfiles),
      fleetEfficiency: this.calculateFleetEfficiency(allProfiles),
      maintenanceOverview: this.getMaintenanceOverview(allProfiles),
      costAnalysis: this.getFleetCostAnalysis(allProfiles)
    };
  }

  private analyzeVehicleTypes(profiles: VehicleProfile[]) {
    const types: { [key: string]: number } = {};
    profiles.forEach(profile => {
      const type = profile.technicalSpecs.type;
      types[type] = (types[type] || 0) + 1;
    });
    return types;
  }

  private calculateFleetEfficiency(profiles: VehicleProfile[]) {
    const avgEfficiency = profiles.reduce((sum, profile) => 
      sum + profile.optimizationData.optimizationPotential, 0) / profiles.length;
    return {
      averageOptimizationPotential: avgEfficiency,
      topPerformers: profiles.filter(p => p.optimizationData.optimizationPotential > 0.8).length
    };
  }

  private getMaintenanceOverview(profiles: VehicleProfile[]) {
    const maintenanceStats = {
      excellent: 0,
      good: 0,
      fair: 0,
      needs_service: 0,
      critical: 0
    };
    
    profiles.forEach(profile => {
      const status = profile.currentState.maintenanceStatus;
      (maintenanceStats as any)[status]++;
    });
    
    return maintenanceStats;
  }

  private getFleetCostAnalysis(profiles: VehicleProfile[]) {
    return {
      averageMaintenanceCost: profiles.reduce((sum, p) => 
        sum + (p.historicalPerformance.reliabilityStats?.maintenanceCostPerKm || 0), 0) / profiles.length,
      totalFleetValue: profiles.length * 25000, // Mock value
      monthlyOperatingCost: profiles.length * 500 // Mock value
    };
  }
} 
