import { MLRouteOptimizer, MLOptimizationResult } from './ml-route-optimizer';
import { HistoricalRouteLearner } from './historical-route-learner';
import { DriverPersonalizationEngine } from './driver-personalization-engine';
import { VehicleSpecificOptimizer, VehicleProfile, VehicleOptimizationResult } from './vehicle-specific-optimizer';

export interface RouteOptimizationRequest {
  distance: number;
  trafficData?: {
    congestion: number;
    estimatedDelay: number;
  };
  vehicle?: {
    type: string;
    efficiency: number;
  };
  driver?: {
    experience: number;
    id?: string;
  };
  weatherData?: {
    condition: string;
    drivingScore: number;
  };
  fuelPrices?: {
    average: number;
  };
  timeConstraints?: {
    departureTime?: Date;
    arrivalTime?: Date;
  };
  waypoints?: Array<{lat: number, lng: number, type: string}>;
  driverId?: string; // Driver ID for personalization
  vehicleId?: string; // Vehicle ID for vehicle-specific optimization
}

export interface EnhancedOptimizationResult extends MLOptimizationResult {
  historicallyEnhanced?: boolean;
  basedOnSimilarRoutes?: number;
  historicalAccuracy?: number;
  learningData?: {
    recommendedActions: string[];
    confidenceFactors: Array<{factor: string, confidence: number}>;
    seasonalAdjustments: any;
  };
  personalizedForDriver?: string;
  personalizationApplied?: boolean;
  driverPersonalization?: {
    applied: boolean;
    driverId: string;
    recommendations: any[];
    profileConfidence: number;
    riskLevel: string;
    focusArea: string;
  };
  vehicleOptimized?: boolean;
  vehicleId?: string;
  vehicleOptimization?: VehicleOptimizationResult;
  combinedOptimization?: boolean;
}

export class RouteOptimizationService {
  private mlOptimizer: MLRouteOptimizer;
  private routeLearner: HistoricalRouteLearner;
  private driverPersonalization: DriverPersonalizationEngine;
  private vehicleOptimizer: VehicleSpecificOptimizer;
  private isInitialized = false;
  
  // Storage pentru pending predictions
  private pendingLearning: Map<string, {
    prediction: EnhancedOptimizationResult;
    timestamp: Date;
  }> = new Map();

  constructor() {
    this.mlOptimizer = new MLRouteOptimizer();
    this.routeLearner = new HistoricalRouteLearner();
    this.driverPersonalization = new DriverPersonalizationEngine();
    this.vehicleOptimizer = new VehicleSpecificOptimizer();
    console.log('🚀 RouteOptimizationService initialized');
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🔧 Initializing Route Optimization Service...');
      
      // Initialize ML Engine
      await this.mlOptimizer.initializeML();
      
      // Initialize Historical Learning System
      await this.routeLearner.initializeLearningSystem();
      
      // Initialize Driver Personalization System
      await this.driverPersonalization.initializePersonalizationEngine();
      
      // Initialize Vehicle-Specific Optimization System
      await this.vehicleOptimizer.initializeVehicleOptimization();
      
      this.isInitialized = true;
      console.log('✅ Route Optimization Service ready');
      console.log('📊 Loaded', this.routeLearner.getRouteCount(), 'historical routes');
      console.log('👥 Loaded', this.driverPersonalization.getDriverCount(), 'driver profiles');
      console.log('🚗 Loaded', this.vehicleOptimizer.getVehicleCount(), 'vehicle profiles');
      
    } catch (error) {
      console.error('❌ Failed to initialize Route Optimization Service:', error);
      this.isInitialized = false;
    }
  }

  async optimizeRoute(request: RouteOptimizationRequest): Promise<EnhancedOptimizationResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log('🎯 Starting enhanced route optimization...');
      
      // Step 1: Get basic ML prediction
      const basicPrediction = await this.mlOptimizer.optimizeRouteML({
        distance: request.distance,
        waypoints: request.waypoints || []
      });

      // Step 2: Apply driver personalization if driver ID provided
      let personalizedPrediction = basicPrediction;
      if (request.driverId) {
        const personalization = await this.driverPersonalization.personalizeOptimization(request, request.driverId);
        if (personalization) {
          personalizedPrediction = await this.driverPersonalization.enhanceMLPredictionForDriver(basicPrediction, request.driverId);
          console.log(`👤 Driver personalization applied for ${request.driverId}`);
        }
      }

      // Step 3: Apply vehicle-specific optimization if vehicle ID provided
      let vehicleOptimizedPrediction = personalizedPrediction;
      let vehicleOptimization = null;
      if (request.vehicleId) {
        vehicleOptimization = await this.vehicleOptimizer.optimizeForVehicle(personalizedPrediction, request.vehicleId);
        if (vehicleOptimization && vehicleOptimization.vehicleOptimized) {
          // Combine personalized prediction cu vehicle specifics
          vehicleOptimizedPrediction = {
            ...personalizedPrediction,
            distance: vehicleOptimization.distance,
            duration: vehicleOptimization.duration,
            optimizationFactor: vehicleOptimization.optimizationFactor,
            savings: vehicleOptimization.savings
          };
          console.log(`🚛 Vehicle-specific optimization applied for ${request.vehicleId}`);
        }
      }

      // Step 4: Enhance cu historical learning dacă avem date suficiente
      let enhancedPrediction: EnhancedOptimizationResult = {
        ...vehicleOptimizedPrediction,
        historicallyEnhanced: false
      };

      if (this.routeLearner.getRouteCount() >= 5) {
        const historicalEnhancement = await this.routeLearner.predictBasedOnSimilarRoutes(request);
        
        if (historicalEnhancement) {
          // Combine ML prediction cu historical learning
          const combinedOptimization = (basicPrediction.optimizationFactor * 0.7) + 
                                     (historicalEnhancement.optimizationFactor * 0.3);
          const combinedConfidence = Math.min(basicPrediction.confidence, historicalEnhancement.confidence);
          
          enhancedPrediction = {
            ...vehicleOptimizedPrediction,
            optimizationFactor: combinedOptimization,
            confidence: combinedConfidence,
            historicallyEnhanced: true,
            basedOnSimilarRoutes: historicalEnhancement.basedOnSimilarRoutes,
            historicalAccuracy: historicalEnhancement.historicalAccuracy,
            savings: {
              ...vehicleOptimizedPrediction.savings,
              percentageSaved: combinedOptimization * 100
            },
            learningData: {
              recommendedActions: this.generateRecommendedActions(historicalEnhancement),
              confidenceFactors: this.generateConfidenceFactors(basicPrediction, historicalEnhancement),
              seasonalAdjustments: this.getSeasonalAdjustments()
            }
          };
          
          console.log(`🎯 Enhanced prediction with ${historicalEnhancement.basedOnSimilarRoutes} similar routes`);
        }
      }

      // Step 5: Add vehicle optimization data to result
      if (vehicleOptimization) {
        enhancedPrediction.vehicleOptimization = vehicleOptimization;
      }

      // Step 6: Generate unique route ID pentru tracking
      enhancedPrediction.routeId = 'route_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      // Step 7: Store prediction pentru future learning
      this.pendingLearning.set(enhancedPrediction.routeId, {
        prediction: enhancedPrediction,
        timestamp: new Date()
      });
      
      console.log(`✅ Route optimization completed: ${(enhancedPrediction.optimizationFactor * 100).toFixed(1)}% savings`);
      
      return enhancedPrediction;
      
    } catch (error) {
      console.error('❌ Route optimization failed:', error);
      throw error;
    }
  }

  async reportActualResult(routeId: string, actualResult: any, driverId?: string, vehicleId?: string): Promise<boolean> {
    try {
      console.log(`📊 Reporting actual result for route: ${routeId}`);
      
      const pendingPrediction = this.pendingLearning.get(routeId);
      
      if (!pendingPrediction) {
        console.warn('⚠️ No pending prediction found for route:', routeId);
        return false;
      }

      // Record learning result
      const historicalRoute = await this.routeLearner.recordOptimizationResult(
        routeId, 
        pendingPrediction.prediction, 
        actualResult
      );
      
      if (historicalRoute) {
        // Update driver profile if driver ID provided
        if (driverId) {
          await this.driverPersonalization.createOrUpdateDriverProfile(
            driverId,
            pendingPrediction.prediction,
            actualResult
          );
          console.log(`👤 Driver profile updated for ${driverId}`);
        }

        // Update vehicle profile if vehicle ID provided
        if (vehicleId) {
          await this.vehicleOptimizer.createOrUpdateVehicleProfile(
            vehicleId,
            { currentState: actualResult.vehicleState || {} },
            {
              actualFuelConsumption: actualResult.actualFuelConsumed,
              actualDistance: actualResult.actualDistance,
              actualDuration: actualResult.actualDuration,
              routeConditions: actualResult.routeConditions || {}
            }
          );
          console.log(`🚛 Vehicle profile updated for ${vehicleId}`);
        }
        
        // Clean up pending prediction
        this.pendingLearning.delete(routeId);
        
        console.log('✅ Learning result recorded successfully');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Failed to record learning result:', error);
      return false;
    }
  }

  async getLearningInsights(): Promise<any> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      const insights = this.routeLearner.generateLearningInsights();
      
      // Add service-specific insights
      return {
        ...insights,
        pendingPredictions: this.pendingLearning.size,
        serviceStatus: 'operational',
        mlModelAccuracy: this.mlOptimizer.getStats().accuracy,
        lastUpdate: new Date()
      };
      
    } catch (error) {
      console.error('❌ Failed to get learning insights:', error);
      return { error: 'Learning system not available' };
    }
  }

  async analyzeHistoricalPatterns(): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    return await this.routeLearner.analyzeHistoricalPatterns();
  }

  private generateRecommendedActions(historicalEnhancement: any): string[] {
    const actions = [
      'Follow historical patterns for similar routes',
      'Consider seasonal traffic adjustments',
      'Apply driver experience factors'
    ];
    
    if (historicalEnhancement.recommendations && historicalEnhancement.recommendations.length > 0) {
      actions.push(`Focus on ${historicalEnhancement.recommendations[0].factor} optimization`);
    }
    
    return actions;
  }

  private generateConfidenceFactors(basicPrediction: MLOptimizationResult, historicalEnhancement: any): Array<{factor: string, confidence: number}> {
    return [
      { factor: 'ml_model', confidence: basicPrediction.confidence },
      { factor: 'historical_similarity', confidence: historicalEnhancement.confidence || 0.5 },
      { factor: 'route_complexity', confidence: 0.8 },
      { factor: 'data_quality', confidence: 0.9 }
    ];
  }

  private getSeasonalAdjustments(): any {
    const currentSeason = this.getCurrentSeason();
    
    const seasonalFactors = {
      'winter': { fuelAdjustment: 1.1, trafficAdjustment: 1.15, safetyMargin: 0.2 },
      'spring': { fuelAdjustment: 1.0, trafficAdjustment: 1.05, safetyMargin: 0.1 },
      'summer': { fuelAdjustment: 0.95, trafficAdjustment: 1.1, safetyMargin: 0.05 },
      'autumn': { fuelAdjustment: 1.05, trafficAdjustment: 1.08, safetyMargin: 0.15 }
    };
    
    return seasonalFactors[currentSeason] || seasonalFactors['spring'];
  }

  private getCurrentSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }

  // Cleanup old pending predictions (older than 24 hours)
  private cleanupPendingPredictions(): void {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    Array.from(this.pendingLearning.entries()).forEach(([routeId, data]) => {
      if (data.timestamp < twentyFourHoursAgo) {
        this.pendingLearning.delete(routeId);
        console.log(`🧹 Cleaned up old pending prediction: ${routeId}`);
      }
    });
  }

  // Public getters pentru debugging/monitoring
  getStats(): any {
    return {
      initialized: this.isInitialized,
      pendingPredictions: this.pendingLearning.size,
      historicalRoutes: this.routeLearner.getRouteCount(),
      averageAccuracy: this.routeLearner.getAverageAccuracy(),
      mlStats: this.mlOptimizer.getStats()
    };
  }

  getPendingPredictions(): string[] {
    return Array.from(this.pendingLearning.keys());
  }

  // Start cleanup interval
  startPeriodicCleanup(): void {
    setInterval(() => {
      this.cleanupPendingPredictions();
    }, 60 * 60 * 1000); // Every hour
  }

  // Driver personalization methods
  async getDriverCoachingInsights(driverId: string): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return await this.driverPersonalization.generateDriverCoachingInsights(driverId);
  }

  async compareDriverPerformance(driverId1: string, driverId2: string): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const profile1 = this.driverPersonalization.getDriverProfile(driverId1);
    const profile2 = this.driverPersonalization.getDriverProfile(driverId2);
    
    if (!profile1 || !profile2) {
      return { error: 'Driver profiles not found' };
    }
    
    return {
      comparison: {
        fuelEfficiency: {
          driver1: profile1.drivingBehavior.fuelBehavior.actualVsPredictedEfficiency,
          driver2: profile2.drivingBehavior.fuelBehavior.actualVsPredictedEfficiency,
          winner: profile1.drivingBehavior.fuelBehavior.actualVsPredictedEfficiency > 
                  profile2.drivingBehavior.fuelBehavior.actualVsPredictedEfficiency ? driverId1 : driverId2
        },
        punctuality: {
          driver1: profile1.drivingBehavior.timeManagement.punctualityScore,
          driver2: profile2.drivingBehavior.timeManagement.punctualityScore,
          winner: profile1.drivingBehavior.timeManagement.punctualityScore > 
                  profile2.drivingBehavior.timeManagement.punctualityScore ? driverId1 : driverId2
        },
        routeAdherence: {
          driver1: profile1.performanceMetrics.routeAdherence.followsRecommendedRoute,
          driver2: profile2.performanceMetrics.routeAdherence.followsRecommendedRoute,
          winner: profile1.performanceMetrics.routeAdherence.followsRecommendedRoute > 
                  profile2.performanceMetrics.routeAdherence.followsRecommendedRoute ? driverId1 : driverId2
        },
        overallSatisfaction: {
          driver1: profile1.performanceMetrics.satisfaction.averageRating,
          driver2: profile2.performanceMetrics.satisfaction.averageRating,
          winner: profile1.performanceMetrics.satisfaction.averageRating > 
                  profile2.performanceMetrics.satisfaction.averageRating ? driverId1 : driverId2
        }
      },
      insights: {
        significantDifferences: [],
        recommendations: []
      }
    };
  }

  async getFleetDriverAnalytics(): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const allProfiles = this.driverPersonalization.getAllDriverProfiles();
    
    if (allProfiles.length === 0) {
      return { message: 'No driver profiles available' };
    }
    
    // Calculate fleet averages
    const fleetAverages = {
      fuelEfficiency: allProfiles.reduce((sum, p) => sum + p.drivingBehavior.fuelBehavior.actualVsPredictedEfficiency, 0) / allProfiles.length,
      punctuality: allProfiles.reduce((sum, p) => sum + p.drivingBehavior.timeManagement.punctualityScore, 0) / allProfiles.length,
      routeAdherence: allProfiles.reduce((sum, p) => sum + p.performanceMetrics.routeAdherence.followsRecommendedRoute, 0) / allProfiles.length,
      satisfaction: allProfiles.reduce((sum, p) => sum + p.performanceMetrics.satisfaction.averageRating, 0) / allProfiles.length
    };
    
    // Identify top performers
    const topPerformers = {
      mostFuelEfficient: allProfiles.sort((a, b) => b.drivingBehavior.fuelBehavior.actualVsPredictedEfficiency - a.drivingBehavior.fuelBehavior.actualVsPredictedEfficiency)[0],
      mostPunctual: allProfiles.sort((a, b) => b.drivingBehavior.timeManagement.punctualityScore - a.drivingBehavior.timeManagement.punctualityScore)[0],
      bestRouteAdherence: allProfiles.sort((a, b) => b.performanceMetrics.routeAdherence.followsRecommendedRoute - a.performanceMetrics.routeAdherence.followsRecommendedRoute)[0]
    };
    
    return {
      totalDrivers: allProfiles.length,
      fleetAverages: fleetAverages,
      topPerformers: {
        mostFuelEfficient: { driverId: topPerformers.mostFuelEfficient.driverId, score: topPerformers.mostFuelEfficient.drivingBehavior.fuelBehavior.actualVsPredictedEfficiency },
        mostPunctual: { driverId: topPerformers.mostPunctual.driverId, score: topPerformers.mostPunctual.drivingBehavior.timeManagement.punctualityScore },
        bestRouteAdherence: { driverId: topPerformers.bestRouteAdherence.driverId, score: topPerformers.bestRouteAdherence.performanceMetrics.routeAdherence.followsRecommendedRoute }
      },
      improvementPotential: this.calculateFleetImprovementPotential(allProfiles)
    };
  }

  private calculateFleetImprovementPotential(profiles: any[]): any {
    return {
      fuelEfficiencyImprovement: '8-15% potential across fleet',
      punctualityImprovement: '5-10% delivery time optimization',
      routeAdherenceImprovement: '10-20% cost savings through better adherence'
    };
  }

  async getVehicleProfile(vehicleId: string): Promise<VehicleProfile | undefined> {
    return this.vehicleOptimizer.getVehicleProfile(vehicleId);
  }

  async createVehicleProfile(vehicleId: string, vehicleData: any): Promise<VehicleProfile | null> {
    return await this.vehicleOptimizer.createOrUpdateVehicleProfile(vehicleId, vehicleData);
  }

  async getFleetVehicleAnalytics(): Promise<any> {
    return await this.vehicleOptimizer.getFleetVehicleAnalytics();
  }

  async getAllVehicleProfiles(): Promise<VehicleProfile[]> {
    return this.vehicleOptimizer.getAllVehicleProfiles();
  }
}

// Export singleton instance
export const routeOptimizationService = new RouteOptimizationService(); 