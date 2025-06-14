// Driver Profile Interface
export interface DriverProfile {
  // Identificare driver
  driverId: string;
  driverName: string;
  createdAt: Date;
  lastUpdated: Date;
  totalRoutesCompleted: number;
  
  // Basic driver info
  basicInfo: {
    experienceYears: number;               // ani experiență condus
    licenseType: string;                   // B, C, CE, etc
    ageGroup: 'young' | 'middle' | 'senior'; // pentru insurance factors
    preferredLanguage: string;             // pentru UI personalization
  };
  
  // Driving behavior patterns (learned din historical data)
  drivingBehavior: {
    // Speed patterns
    speedProfile: {
      citySpeedTendency: number;           // -0.3 to +0.3 (relative la speed limit)
      highwaySpeedTendency: number;        // -0.2 to +0.4 
      averageSpeedDeviation: number;       // % deviere față de predicted
      speedConsistency: number;            // 0-1 (1 = very consistent speed)
    };
    
    // Route preferences learned din choices
    routePreferences: {
      prefersHighways: number;             // 0-1 (0=avoid, 1=prefer)
      toleratesTraffic: number;            // 0-1 (0=avoid heavy traffic, 1=doesn't mind)
      acceptsLongerButCheaper: number;     // 0-1 (distance vs cost preference)
      prefersScenic: number;               // 0-1 (efficiency vs scenic)
      avoidsTollRoads: number;             // 0-1 (cost sensitivity)
    };
    
    // Break și rest patterns
    restPatterns: {
      breaksFrequency: number;             // breaks per 100km
      averageBreakDuration: number;        // minutes per break
      prefersLongBreaks: boolean;          // few long vs many short
      breakLocationPreference: string;     // 'gas_station', 'restaurant', 'rest_area'
    };
    
    // Fuel efficiency behavior
    fuelBehavior: {
      actualVsPredictedEfficiency: number; // ratio (0.7-1.3, unde 1.0 = exact ca predicted)
      improvesThroughGuidance: boolean;    // responds positively la eco tips
      consistentFuelTracking: boolean;     // reports accurate fuel data
    };
    
    // Timing și punctuality patterns
    timeManagement: {
      punctualityScore: number;            // 0-1 (arrives on time)
      averageDelayMinutes: number;         // average minutes late/early
      respondsToUrgency: boolean;          // adjusts behavior for urgent deliveries
      planningHorizon: number;             // days în advance plans routes
    };
  };
  
  // Performance metrics per driver
  performanceMetrics: {
    // Accuracy of following recommendations
    routeAdherence: {
      followsRecommendedRoute: number;     // % of time follows suggested route
      deviationReasons: string[];          // common reasons pentru deviations
      improvementOverTime: number;        // trend of adherence
    };
    
    // Efficiency achievements
    efficiencyRatings: {
      fuelEfficiencyRating: number;        // 1-5 stars vs other drivers
      timeEfficiencyRating: number;        // 1-5 stars completion time
      costEfficiencyRating: number;        // 1-5 stars total cost management
      overallEfficiencyTrend: number;      // improving/stable/declining
    };
    
    // Satisfaction și feedback
    satisfaction: {
      averageRating: number;               // 1-5 average satisfaction cu routes
      commonComplaints: string[];          // frequent feedback themes
      preferredFeatures: string[];         // most valued capabilities
      suggestionHistory: string[];         // past improvement suggestions
    };
  };
  
  // Personalization settings (learned + explicit)
  personalizationConfig: {
    // Algorithm adaptations
    optimizationWeights: {
      timeWeight: number;                  // 0-1 importance of time saving
      costWeight: number;                  // 0-1 importance of cost saving  
      comfortWeight: number;               // 0-1 importance of comfort/ease
      safetyWeight: number;                // 0-1 importance of safety
      experienceWeight: number;            // 0-1 importance of driving experience
    };
    
    // Risk tolerance
    riskProfile: {
      acceptsAggressiveOptimization: boolean; // willing to try complex routes
      toleratesExperimentalRoutes: boolean;   // open to new route suggestions
      prefersProvenRoutes: boolean;           // sticks to known working routes
    };
    
    // Communication preferences  
    communicationStyle: {
      detailLevel: 'minimal' | 'standard' | 'detailed'; // how much info wants
      warningThreshold: number;                          // when to show warnings
      coachingReceptivity: number;                       // 0-1 wants improvement tips
    };
  };
  
  // Vehicle associations pentru cross-referencing
  vehicleHistory: Array<{
    vehicleId: string;
    vehicleType: string;
    usageFrequency: number;              // % of routes cu acest vehicul
    performanceWithVehicle: number;     // efficiency score cu acest vehicul
  }>;
  
  // Learning metadata
  learningStats: {
    profileCompleteness: number;         // 0-1 how much data we have
    confidenceLevel: number;             // 0-1 confidence în profile accuracy
    lastLearningUpdate: Date;            // când s-a updated ultima oară
    learningVelocity: number;            // how fast profile improves
    dataQuality: number;                 // 0-1 quality of data collected
  };
}

export interface PersonalizationFactors {
  riskLevel: 'low' | 'medium' | 'high';
  efficiencyFocus: 'time' | 'cost' | 'comfort' | 'balanced';
  speedAdjustment: number;
  routeAdjustments: {
    highwayPreference: number;
    trafficTolerance: number;
    costSensitivity: number;
  };
  fuelEfficiencyMultiplier: number;
  wantsDetailedExplanation: boolean;
  receptiveToCoaching: boolean;
}

export interface DriverRecommendation {
  type: 'fuel_efficiency' | 'route_adherence' | 'time_management' | 'route_preference';
  message: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
}

export class DriverPersonalizationEngine {
  private driverProfiles: Map<string, DriverProfile> = new Map();
  private activeDrivers: Set<string> = new Set();
  private personalizationRules: Map<string, any> = new Map();
  
  // Default personalization weights pentru new drivers
  private defaultPersonalization = {
    timeWeight: 0.4,
    costWeight: 0.3,
    comfortWeight: 0.2,
    safetyWeight: 0.1,
    experienceWeight: 0.0
  };

  constructor() {
    console.log('👤 DriverPersonalizationEngine initialized');
  }

  async initializePersonalizationEngine(): Promise<void> {
    console.log('👤 Initializing Driver Personalization Engine...');
    
    try {
      // Load existing driver profiles
      await this.loadDriverProfiles();
      
      // Initialize learning algorithms
      await this.initializeDriverLearning();
      
      // Setup personalization rules
      await this.setupPersonalizationRules();
      
      console.log('✅ Driver Personalization Engine initialized');
      console.log(`👥 Loaded ${this.driverProfiles.size} driver profiles`);
      
    } catch (error) {
      console.error('❌ Failed to initialize personalization engine:', error);
    }
  }

  async createOrUpdateDriverProfile(driverId: string, routeData: any, actualResult: any): Promise<DriverProfile | null> {
    console.log(`👤 Updating driver profile for: ${driverId}`);
    
    try {
      let profile = this.driverProfiles.get(driverId) || this.createNewDriverProfile(driverId);
      
      // Update cu new route data
      profile = await this.updateDriverBehavior(profile, routeData, actualResult);
      profile = await this.updatePerformanceMetrics(profile, routeData, actualResult);
      profile = await this.updatePersonalizationConfig(profile, routeData, actualResult);
      
      // Recalculate learning stats
      profile.learningStats = this.calculateLearningStats(profile);
      profile.lastUpdated = new Date();
      profile.totalRoutesCompleted++;
      
      // Save updated profile
      this.driverProfiles.set(driverId, profile);
      await this.saveDriverProfiles();
      
      console.log(`✅ Driver profile updated. Completeness: ${(profile.learningStats.profileCompleteness * 100).toFixed(1)}%`);
      
      return profile;
      
    } catch (error) {
      console.error('❌ Failed to update driver profile:', error);
      return null;
    }
  }

  createNewDriverProfile(driverId: string): DriverProfile {
    return {
      driverId: driverId,
      driverName: driverId, // Can be updated later
      createdAt: new Date(),
      lastUpdated: new Date(),
      totalRoutesCompleted: 0,
      
      basicInfo: {
        experienceYears: 5, // Default assumption
        licenseType: 'B',
        ageGroup: 'middle',
        preferredLanguage: 'ro'
      },
      
      drivingBehavior: {
        speedProfile: {
          citySpeedTendency: 0,
          highwaySpeedTendency: 0,
          averageSpeedDeviation: 0,
          speedConsistency: 0.7
        },
        routePreferences: {
          prefersHighways: 0.5,
          toleratesTraffic: 0.5,
          acceptsLongerButCheaper: 0.5,
          prefersScenic: 0.3,
          avoidsTollRoads: 0.7
        },
        restPatterns: {
          breaksFrequency: 1.5, // 1.5 breaks per 100km
          averageBreakDuration: 15,
          prefersLongBreaks: false,
          breakLocationPreference: 'gas_station'
        },
        fuelBehavior: {
          actualVsPredictedEfficiency: 1.0,
          improvesThroughGuidance: true,
          consistentFuelTracking: true
        },
        timeManagement: {
          punctualityScore: 0.8,
          averageDelayMinutes: 5,
          respondsToUrgency: true,
          planningHorizon: 1
        }
      },
      
      performanceMetrics: {
        routeAdherence: {
          followsRecommendedRoute: 0.8,
          deviationReasons: [],
          improvementOverTime: 0
        },
        efficiencyRatings: {
          fuelEfficiencyRating: 3,
          timeEfficiencyRating: 3,
          costEfficiencyRating: 3,
          overallEfficiencyTrend: 0
        },
        satisfaction: {
          averageRating: 4.0,
          commonComplaints: [],
          preferredFeatures: [],
          suggestionHistory: []
        }
      },
      
      personalizationConfig: {
        optimizationWeights: { ...this.defaultPersonalization },
        riskProfile: {
          acceptsAggressiveOptimization: false,
          toleratesExperimentalRoutes: true,
          prefersProvenRoutes: true
        },
        communicationStyle: {
          detailLevel: 'standard',
          warningThreshold: 0.7,
          coachingReceptivity: 0.6
        }
      },
      
      vehicleHistory: [],
      
      learningStats: {
        profileCompleteness: 0.1,
        confidenceLevel: 0.3,
        lastLearningUpdate: new Date(),
        learningVelocity: 0.1,
        dataQuality: 0.5
      }
    };
  }

  async updateDriverBehavior(profile: DriverProfile, routeData: any, actualResult: any): Promise<DriverProfile> {
    // Update speed profile based pe actual vs predicted timing
    if (actualResult.actualDuration && routeData.predictedDuration) {
      const speedDeviation = (actualResult.actualDuration - routeData.predictedDuration) / routeData.predictedDuration;
      
      // Update speed tendencies (learning rate 0.1 pentru gradual adjustment)
      const learningRate = 0.1;
      profile.drivingBehavior.speedProfile.averageSpeedDeviation = 
        profile.drivingBehavior.speedProfile.averageSpeedDeviation * (1 - learningRate) + 
        speedDeviation * learningRate;
    }
    
    // Update route preferences based pe route choices
    if (routeData.routeType) {
      const learningRate = 0.05; // Slower learning pentru preferences
      
      if (routeData.routeType === 'highway' && actualResult.driverSatisfaction >= 4) {
        profile.drivingBehavior.routePreferences.prefersHighways += learningRate;
      }
      
      if (routeData.trafficLevel > 0.7 && actualResult.driverSatisfaction >= 4) {
        profile.drivingBehavior.routePreferences.toleratesTraffic += learningRate;
      }
    }
    
    // Update fuel behavior based pe actual consumption
    if (actualResult.actualFuelConsumed && routeData.predictedFuelConsumption) {
      const fuelEfficiency = routeData.predictedFuelConsumption / actualResult.actualFuelConsumed;
      const learningRate = 0.08;
      
      profile.drivingBehavior.fuelBehavior.actualVsPredictedEfficiency = 
        profile.drivingBehavior.fuelBehavior.actualVsPredictedEfficiency * (1 - learningRate) + 
        fuelEfficiency * learningRate;
    }
    
    // Update time management based pe punctuality
    if (actualResult.arrivalTime && routeData.expectedArrivalTime) {
      const delayMinutes = (new Date(actualResult.arrivalTime).getTime() - new Date(routeData.expectedArrivalTime).getTime()) / (1000 * 60);
      const learningRate = 0.1;
      
      profile.drivingBehavior.timeManagement.averageDelayMinutes = 
        profile.drivingBehavior.timeManagement.averageDelayMinutes * (1 - learningRate) + 
        delayMinutes * learningRate;
        
      const onTime = Math.abs(delayMinutes) <= 10; // Within 10 minutes = on time
      profile.drivingBehavior.timeManagement.punctualityScore = 
        profile.drivingBehavior.timeManagement.punctualityScore * (1 - learningRate) + 
        (onTime ? 1 : 0) * learningRate;
    }
    
    return profile;
  }

  async updatePerformanceMetrics(profile: DriverProfile, routeData: any, actualResult: any): Promise<DriverProfile> {
    const learningRate = 0.1;
    
    // Update route adherence
    if (actualResult.routeFollowed !== undefined) {
      profile.performanceMetrics.routeAdherence.followsRecommendedRoute = 
        profile.performanceMetrics.routeAdherence.followsRecommendedRoute * (1 - learningRate) + 
        (actualResult.routeFollowed ? 1 : 0) * learningRate;
      
      if (!actualResult.routeFollowed && actualResult.deviationReasons) {
        profile.performanceMetrics.routeAdherence.deviationReasons.push(...actualResult.deviationReasons);
        // Keep only last 10 reasons
        if (profile.performanceMetrics.routeAdherence.deviationReasons.length > 10) {
          profile.performanceMetrics.routeAdherence.deviationReasons = 
            profile.performanceMetrics.routeAdherence.deviationReasons.slice(-10);
        }
      }
    }
    
    // Update satisfaction
    if (actualResult.driverSatisfaction) {
      profile.performanceMetrics.satisfaction.averageRating = 
        profile.performanceMetrics.satisfaction.averageRating * (1 - learningRate) + 
        actualResult.driverSatisfaction * learningRate;
    }
    
    // Update efficiency ratings based on actual performance
    if (profile.drivingBehavior.fuelBehavior.actualVsPredictedEfficiency > 1.1) {
      profile.performanceMetrics.efficiencyRatings.fuelEfficiencyRating = Math.min(5, 
        profile.performanceMetrics.efficiencyRatings.fuelEfficiencyRating + 0.1);
    }
    
    return profile;
  }

  async updatePersonalizationConfig(profile: DriverProfile, routeData: any, actualResult: any): Promise<DriverProfile> {
    // Adapt optimization weights based pe satisfaction and results
    if (actualResult.driverSatisfaction >= 4) {
      // If satisfied, slightly increase weight of dominant factor
      const dominant = this.getDominantWeight(profile.personalizationConfig.optimizationWeights);
      if (dominant) {
        profile.personalizationConfig.optimizationWeights[dominant] = Math.min(0.8,
          profile.personalizationConfig.optimizationWeights[dominant] * 1.02);
      }
    }
    
    // Adjust risk profile based pe route following behavior
    if (actualResult.routeFollowed && actualResult.driverSatisfaction >= 4) {
      profile.personalizationConfig.riskProfile.toleratesExperimentalRoutes = true;
    } else if (!actualResult.routeFollowed) {
      profile.personalizationConfig.riskProfile.prefersProvenRoutes = true;
    }
    
    return profile;
  }

  getDominantWeight(weights: any): string | null {
    let maxWeight = 0;
    let dominantKey = null;
    
    Object.entries(weights).forEach(([key, value]) => {
      if (value as number > maxWeight) {
        maxWeight = value as number;
        dominantKey = key;
      }
    });
    
    return dominantKey;
  }

  calculateLearningStats(profile: DriverProfile): any {
    const routes = profile.totalRoutesCompleted;
    
    // Profile completeness based on routes completed and data quality
    let completeness = Math.min(1, routes / 20); // 20 routes pentru full completeness base
    
    // Adjust based on data variety
    if (profile.performanceMetrics.routeAdherence.deviationReasons.length > 0) completeness += 0.1;
    if (profile.vehicleHistory.length > 0) completeness += 0.1;
    if (routes >= 10) completeness += 0.1;
    
    completeness = Math.min(1, completeness);
    
    // Confidence based on completeness and consistency
    const confidence = completeness * 0.8 + (routes >= 5 ? 0.2 : routes * 0.04);
    
    // Learning velocity - how fast profile improves
    const velocity = routes >= 3 ? Math.min(1, (routes - 2) / 10) : 0.1;
    
    return {
      profileCompleteness: completeness,
      confidenceLevel: confidence,
      lastLearningUpdate: new Date(),
      learningVelocity: velocity,
      dataQuality: Math.min(1, 0.5 + routes * 0.05)
    };
  }

  async personalizeOptimization(route: any, driverId: string): Promise<any> {
    console.log(`🎯 Personalizing optimization for driver: ${driverId}`);
    
    const profile = this.driverProfiles.get(driverId);
    if (!profile) {
      console.log('ℹ️ No driver profile found, using default optimization');
      return null; // Use default optimization
    }
    
    try {
      // Extract personalization factors din profile
      const personalization = this.extractPersonalizationFactors(profile);
      
      // Adjust route features based pe driver preferences
      const personalizedRoute = this.adjustRouteForDriver(route, personalization);
      
      // Calculate personalized weights pentru ML model
      const personalizedWeights = this.calculatePersonalizedWeights(profile);
      
      // Generate driver-specific recommendations
      const driverRecommendations = this.generateDriverRecommendations(profile, route);
      
      console.log(`✅ Personalization applied for ${driverId}: ${personalization.riskLevel} risk, ${personalization.efficiencyFocus} efficiency focus`);
      
      return {
        personalizedRoute: personalizedRoute,
        personalizedWeights: personalizedWeights,
        recommendations: driverRecommendations,
        personalization: personalization,
        profileConfidence: profile.learningStats.confidenceLevel
      };
      
    } catch (error) {
      console.error('❌ Failed to personalize optimization:', error);
      return null;
    }
  }

  extractPersonalizationFactors(profile: DriverProfile): PersonalizationFactors {
    const behavior = profile.drivingBehavior;
    const config = profile.personalizationConfig;
    
    return {
      // Risk tolerance level
      riskLevel: config.riskProfile.acceptsAggressiveOptimization ? 'high' : 
                 config.riskProfile.toleratesExperimentalRoutes ? 'medium' : 'low',
      
      // Primary optimization focus
      efficiencyFocus: config.optimizationWeights.timeWeight > 0.4 ? 'time' :
                       config.optimizationWeights.costWeight > 0.4 ? 'cost' :
                       config.optimizationWeights.comfortWeight > 0.3 ? 'comfort' : 'balanced',
      
      // Speed adjustment factor
      speedAdjustment: behavior.speedProfile.averageSpeedDeviation,
      
      // Route preference adjustments
      routeAdjustments: {
        highwayPreference: behavior.routePreferences.prefersHighways,
        trafficTolerance: behavior.routePreferences.toleratesTraffic,
        costSensitivity: behavior.routePreferences.avoidsTollRoads
      },
      
      // Fuel efficiency expectation
      fuelEfficiencyMultiplier: behavior.fuelBehavior.actualVsPredictedEfficiency,
      
      // Communication preferences
      wantsDetailedExplanation: config.communicationStyle.detailLevel === 'detailed',
      receptiveToCoaching: config.communicationStyle.coachingReceptivity > 0.6
    };
  }

  adjustRouteForDriver(route: any, personalization: PersonalizationFactors): any {
    const adjustedRoute = { ...route };
    
    // Adjust expected timing based pe driver speed patterns
    if (personalization.speedAdjustment !== 0) {
      adjustedRoute.estimatedDuration = route.distance / (45 * (1 + personalization.speedAdjustment));
    }
    
    // Adjust route preferences
    adjustedRoute.driverPreferences = {
      prefersHighways: personalization.routeAdjustments.highwayPreference > 0.6,
      avoidsTraffic: personalization.routeAdjustments.trafficTolerance < 0.4,
      costSensitive: personalization.routeAdjustments.costSensitivity > 0.6,
      prioritizeTime: personalization.efficiencyFocus === 'time',
      prioritizeCost: personalization.efficiencyFocus === 'cost'
    };
    
    // Adjust fuel consumption expectation
    adjustedRoute.expectedFuelMultiplier = personalization.fuelEfficiencyMultiplier;
    
    return adjustedRoute;
  }

  calculatePersonalizedWeights(profile: DriverProfile): any {
    const weights = profile.personalizationConfig.optimizationWeights;
    const behavior = profile.drivingBehavior;
    
    // Adjust ML features weights based pe driver profile
    return {
      timeImportance: weights.timeWeight,
      costImportance: weights.costWeight,
      comfortImportance: weights.comfortWeight,
      safetyImportance: weights.safetyWeight,
      
      // Behavioral adjustments
      trafficSensitivity: 1 - behavior.routePreferences.toleratesTraffic,
      speedOptimization: behavior.speedProfile.speedConsistency,
      fuelPriority: behavior.fuelBehavior.actualVsPredictedEfficiency > 1.1 ? 1.2 : 1.0
    };
  }

  generateDriverRecommendations(profile: DriverProfile, route: any): DriverRecommendation[] {
    const recommendations: DriverRecommendation[] = [];
    const behavior = profile.drivingBehavior;
    const performance = profile.performanceMetrics;
    
    // Fuel efficiency recommendations
    if (behavior.fuelBehavior.actualVsPredictedEfficiency < 0.9) {
      recommendations.push({
        type: 'fuel_efficiency',
        message: 'Consideră o viteză mai constantă pentru îmbunătățirea consumului cu 8-12%',
        impact: 'medium',
        actionable: true
      });
    }
    
    // Route adherence recommendations  
    if (performance.routeAdherence.followsRecommendedRoute < 0.7) {
      recommendations.push({
        type: 'route_adherence',
        message: 'Urmărind ruta recomandată ai putea economisi încă 5-8% din timp și combustibil',
        impact: 'high',
        actionable: true
      });
    }
    
    // Time management recommendations
    if (behavior.timeManagement.punctualityScore < 0.7) {
      recommendations.push({
        type: 'time_management', 
        message: 'Pornește cu 10-15 minute mai devreme pentru a evita stresul și a optimiza consumul',
        impact: 'medium',
        actionable: true
      });
    }
    
    // Personalized route suggestions
    if (behavior.routePreferences.prefersHighways > 0.7 && (route as any).highwayPercentage < 0.5) {
      recommendations.push({
        type: 'route_preference',
        message: 'Pentru preferințele tale de condus, ruta alternativă cu mai multă autostradă ar putea fi mai confortabilă',
        impact: 'low',
        actionable: false
      });
    }
    
    return recommendations.slice(0, 3); // Max 3 recommendations
  }

  async generateDriverCoachingInsights(driverId: string): Promise<any> {
    const profile = this.driverProfiles.get(driverId);
    if (!profile || profile.totalRoutesCompleted < 5) {
      return { message: 'Necesită mai multe rute pentru coaching insights (minimum 5)' };
    }
    
    const insights = {
      driverId: driverId,
      profileCompleteness: profile.learningStats.profileCompleteness,
      totalRoutes: profile.totalRoutesCompleted,
      
      // Performance analysis
      strengths: this.identifyDriverStrengths(profile),
      improvementAreas: this.identifyImprovementAreas(profile),
      
      // Trend analysis  
      performanceTrends: this.analyzePerformanceTrends(profile),
      
      // Personalized coaching recommendations
      coachingRecommendations: this.generateCoachingRecommendations(profile),
      
      // Comparative performance
      relativePerformance: this.calculateRelativePerformance(profile)
    };
    
    return insights;
  }

  identifyDriverStrengths(profile: DriverProfile): string[] {
    const strengths: string[] = [];
    
    if (profile.drivingBehavior.fuelBehavior.actualVsPredictedEfficiency > 1.1) {
      strengths.push('Excelent la economia de combustibil - cu 10%+ mai eficient decât media');
    }
    
    if (profile.drivingBehavior.timeManagement.punctualityScore > 0.9) {
      strengths.push('Foarte punctual - ajunge la timp în 90%+ din cazuri');
    }
    
    if (profile.performanceMetrics.routeAdherence.followsRecommendedRoute > 0.8) {
      strengths.push('Urmează bine recomandările - economii maxime prin adherence');
    }
    
    if (profile.performanceMetrics.satisfaction.averageRating > 4.5) {
      strengths.push('Foarte mulțumit de optimizări - apreciază recomandările sistemului');
    }
    
    return strengths;
  }

  identifyImprovementAreas(profile: DriverProfile): any[] {
    const areas: any[] = [];
    
    if (profile.drivingBehavior.fuelBehavior.actualVsPredictedEfficiency < 0.9) {
      areas.push({
        area: 'Eficiența combustibilului',
        currentScore: profile.drivingBehavior.fuelBehavior.actualVsPredictedEfficiency,
        improvementPotential: '8-15% economii suplimentare',
        recommendations: ['Viteză mai constantă', 'Accelerări mai lente', 'Anticipare trafic']
      });
    }
    
    if (profile.performanceMetrics.routeAdherence.followsRecommendedRoute < 0.7) {
      areas.push({
        area: 'Urmărirea rutelor recomandate',
        currentScore: profile.performanceMetrics.routeAdherence.followsRecommendedRoute,
        improvementPotential: '5-12% economii suplimentare',
        recommendations: ['Trust în sistemul de optimizare', 'Încercare rute noi', 'Feedback pentru îmbunătățiri']
      });
    }
    
    return areas;
  }

  analyzePerformanceTrends(profile: DriverProfile): any {
    return {
      fuelEfficiencyTrend: profile.drivingBehavior.fuelBehavior.actualVsPredictedEfficiency > 1.0 ? 'improving' : 'stable',
      punctualityTrend: profile.drivingBehavior.timeManagement.punctualityScore > 0.8 ? 'excellent' : 'good',
      satisfactionTrend: profile.performanceMetrics.satisfaction.averageRating > 4.0 ? 'positive' : 'neutral'
    };
  }

  generateCoachingRecommendations(profile: DriverProfile): any[] {
    const recommendations: any[] = [];
    
    // Based on performance metrics
    if (profile.drivingBehavior.fuelBehavior.actualVsPredictedEfficiency < 1.0) {
      recommendations.push({
        category: 'fuel_efficiency',
        title: 'Îmbunătățește economia de combustibil',
        actions: [
          'Menține viteza constantă pe autostrăzi',
          'Evită accelerările bruste',
          'Folosește tempomatul când e posibil'
        ],
        expectedImprovement: '10-15% economii combustibil'
      });
    }
    
    if (profile.performanceMetrics.routeAdherence.followsRecommendedRoute < 0.8) {
      recommendations.push({
        category: 'route_adherence',
        title: 'Urmează mai des rutele recomandate',
        actions: [
          'Testează rutele sugerate măcar o dată',
          'Oferă feedback dacă o rută nu funcționează',
          'Compară timpii reali cu estimările'
        ],
        expectedImprovement: '8-12% economii timp și cost'
      });
    }
    
    return recommendations;
  }

  calculateRelativePerformance(profile: DriverProfile): any {
    // Compare with fleet average (mock data)
    const fleetAverages = {
      fuelEfficiency: 1.0,
      punctuality: 0.8,
      routeAdherence: 0.75,
      satisfaction: 4.0
    };
    
    return {
      fuelEfficiencyVsFleet: profile.drivingBehavior.fuelBehavior.actualVsPredictedEfficiency / fleetAverages.fuelEfficiency,
      punctualityVsFleet: profile.drivingBehavior.timeManagement.punctualityScore / fleetAverages.punctuality,
      routeAdherenceVsFleet: profile.performanceMetrics.routeAdherence.followsRecommendedRoute / fleetAverages.routeAdherence,
      satisfactionVsFleet: profile.performanceMetrics.satisfaction.averageRating / fleetAverages.satisfaction
    };
  }

  // Integration cu ML optimization
  async enhanceMLPredictionForDriver(mlPrediction: any, driverId: string): Promise<any> {
    const profile = this.driverProfiles.get(driverId);
    if (!profile) return mlPrediction;
    
    const personalization = this.extractPersonalizationFactors(profile);
    
    // Adjust ML prediction based pe driver specifics
    let adjustedOptimization = mlPrediction.optimizationFactor;
    
    // Driver cu fuel efficiency bună poate achieve mai mult
    if (personalization.fuelEfficiencyMultiplier > 1.1) {
      adjustedOptimization *= 1.1; // +10% potential
    }
    
    // Driver cu route adherence slabă nu va achieve full potential
    if (profile.performanceMetrics.routeAdherence.followsRecommendedRoute < 0.7) {
      adjustedOptimization *= 0.9; // -10% realistic adjustment
    }
    
    // Adjust confidence based pe profile completeness
    const adjustedConfidence = mlPrediction.confidence * profile.learningStats.confidenceLevel;
    
    return {
      ...mlPrediction,
      optimizationFactor: Math.max(0.05, Math.min(0.40, adjustedOptimization)),
      confidence: adjustedConfidence,
      personalizedForDriver: driverId,
      personalizationApplied: true,
      driverFactors: {
        fuelEfficiencyMultiplier: personalization.fuelEfficiencyMultiplier,
        routeAdherence: profile.performanceMetrics.routeAdherence.followsRecommendedRoute,
        profileConfidence: profile.learningStats.confidenceLevel
      }
    };
  }

  async initializeDriverLearning(): Promise<void> {
    console.log('🧠 Initializing driver learning algorithms...');
    // Implementation for learning algorithms
  }

  async setupPersonalizationRules(): Promise<void> {
    console.log('📋 Setting up personalization rules...');
    // Implementation for personalization rules
  }

  async saveDriverProfiles(): Promise<void> {
    try {
      const profilesToSave: any = {};
      this.driverProfiles.forEach((profile, driverId) => {
        profilesToSave[driverId] = profile;
      });
      
      const dataToSave = {
        driverProfiles: profilesToSave,
        lastUpdate: new Date(),
        totalDrivers: this.driverProfiles.size
      };
      
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('routeoptimizer-driver-profiles', JSON.stringify(dataToSave));
        console.log('💾 Driver profiles saved successfully');
      }
    } catch (error) {
      console.error('❌ Failed to save driver profiles:', error);
    }
  }

  async loadDriverProfiles(): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        const savedData = localStorage.getItem('routeoptimizer-driver-profiles');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          
          Object.entries(parsed.driverProfiles || {}).forEach(([driverId, profile]) => {
            this.driverProfiles.set(driverId, profile as DriverProfile);
          });
          
          console.log(`📂 Loaded ${this.driverProfiles.size} driver profiles`);
        }
      }
    } catch (error) {
      console.error('❌ Failed to load driver profiles:', error);
    }
  }

  // Public getters
  getDriverProfile(driverId: string): DriverProfile | undefined {
    return this.driverProfiles.get(driverId);
  }

  getAllDriverProfiles(): DriverProfile[] {
    return Array.from(this.driverProfiles.values());
  }

  getDriverCount(): number {
    return this.driverProfiles.size;
  }
} 