import { routeOptimizationService } from './route-optimization-service';

// Types pentru client API
export interface RouteRequest {
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
}

export interface ActualRouteResult {
  actualSavingsPercent: number;
  actualDistance: number;
  actualDuration: number;
  actualFuelConsumed?: number;
  actualCost?: number;
  driverSatisfaction?: number; // 1-5 rating
  routeFollowed?: boolean;
  completedSuccessfully?: boolean;
  deviationReasons?: string[];
  weatherActual?: string;
  trafficActual?: number;
  issuesEncountered?: string[];
  userId?: string;
}

// MAIN CLIENT APIs
// Storage pentru pending predictions (pentru browser)
(globalThis as any).pendingLearning = (globalThis as any).pendingLearning || new Map();

// Define API base URL
const API_BASE_URL = '/api/route-optimizer-ml';

// Enhanced Prediction Function cu driver și vehicle support
async function getEnhancedPrediction(route: any, driverId: string | null = null, vehicleId: string | null = null) {
  try {
    console.log('🔮 Getting enhanced ML prediction cu personalization și vehicle optimization...');
    
    const requestBody = {
      distance: route.distance,
      trafficData: route.trafficData || { congestion: 0.3, estimatedDelay: 0 },
      vehicle: route.vehicle || { type: 'car', efficiency: 0.8 },
      driver: route.driver || { experience: 0.7 },
      weatherData: route.weatherData || { condition: 'clear', drivingScore: 0.9 },
      fuelPrices: route.fuelPrices || { average: 1.5 },
      timeConstraints: route.timeConstraints,
      waypoints: route.waypoints || [],
      driverId: driverId,
      vehicleId: vehicleId
    };

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      const prediction = result.data;
      
      console.log(`✅ Enhanced prediction received: ${prediction.savings.percentageSaved.toFixed(1)}% savings`);
      console.log(`📊 Confidence: ${(prediction.confidence * 100).toFixed(1)}%`);
      
      if (prediction.historicalLearningApplied) {
        console.log(`📚 Historical learning applied (${prediction.basedOnSimilarRoutes} similar routes)`);
      }
      
      if (prediction.driverPersonalizationApplied) {
        console.log(`👤 Driver personalization applied for ${prediction.personalizedForDriver}`);
      }
      
      if (prediction.vehicleOptimizationApplied) {
        console.log(`🚛 Vehicle optimization applied for ${prediction.optimizedForVehicle}`);
      }
      
      if (prediction.combinedOptimization) {
        console.log(`🎯 Combined optimization active (ML + Historical + Driver + Vehicle)`);
      }
      
      return prediction;
    } else {
      throw new Error(result.error || 'Prediction failed');
    }
  } catch (error) {
    console.error('❌ Enhanced prediction failed:', error);
    throw error;
  }
}

// Enhanced Result Reporting cu driver și vehicle learning
async function reportActualResult(routeId: string, actualResult: any, driverId: string | null = null, vehicleId: string | null = null) {
  try {
    console.log(`📊 Reporting actual result pentru route: ${routeId}...`);
    
    const requestBody = {
      routeId: routeId,
      actualResult: actualResult,
      driverId: driverId,
      vehicleId: vehicleId
    };

    const response = await fetch(API_BASE_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Learning feedback recorded successfully');
      
      if (result.data.driverUpdated) {
        console.log(`👤 Driver profile updated`);
      }
      
      if (result.data.vehicleUpdated) {
        console.log(`🚛 Vehicle profile updated`);
      }
      
      return result.data;
    } else {
      throw new Error(result.error || 'Learning feedback failed');
    }
  } catch (error) {
    console.error('❌ Failed to report actual result:', error);
    throw error;
  }
}

// Get API Statistics și System Info
async function getAPIStats() {
  try {
    const response = await fetch(`${API_BASE_URL}?action=stats`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to get stats');
    }
  } catch (error) {
    console.error('❌ Failed to get API stats:', error);
    throw error;
  }
}

// Get Learning Insights
async function getLearningInsights() {
  try {
    const response = await fetch(`${API_BASE_URL}?action=insights`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to get insights');
    }
  } catch (error) {
    console.error('❌ Failed to get learning insights:', error);
    throw error;
  }
}

// Get Historical Patterns
async function getHistoricalPatterns() {
  try {
    const response = await fetch(`${API_BASE_URL}?action=patterns`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to get patterns');
    }
  } catch (error) {
    console.error('❌ Failed to get historical patterns:', error);
    throw error;
  }
}

// Get Driver Coaching Insights
async function getDriverCoachingInsights(driverId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}?action=driver-coaching&driverId=${encodeURIComponent(driverId)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to get coaching insights');
    }
  } catch (error) {
    console.error('❌ Failed to get driver coaching insights:', error);
    throw error;
  }
}

// Compare Driver Performance
async function compareDriverPerformance(driverId1: string, driverId2: string) {
  try {
    const response = await fetch(`${API_BASE_URL}?action=driver-comparison&driverId=${encodeURIComponent(driverId1)}&driverId2=${encodeURIComponent(driverId2)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to compare drivers');
    }
  } catch (error) {
    console.error('❌ Failed to compare driver performance:', error);
    throw error;
  }
}

// Get Fleet Driver Analytics
async function getFleetDriverAnalytics() {
  try {
    const response = await fetch(`${API_BASE_URL}?action=fleet-analytics`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to get fleet analytics');
    }
  } catch (error) {
    console.error('❌ Failed to get fleet driver analytics:', error);
    throw error;
  }
}

// NEW VEHICLE FUNCTIONS

// Create or Update Vehicle Profile
async function createVehicleProfile(vehicleId: string, vehicleData: any) {
  try {
    console.log(`🚛 Creating/updating vehicle profile for: ${vehicleId}...`);
    
    const requestBody = {
      routeId: 'vehicle_profile_' + Date.now(), // Dummy route ID
      vehicleId: vehicleId,
      vehicleData: vehicleData
    };

    const response = await fetch(API_BASE_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Vehicle profile created/updated for ${vehicleId}`);
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to create vehicle profile');
    }
  } catch (error) {
    console.error('❌ Failed to create vehicle profile:', error);
    throw error;
  }
}

// Get Vehicle Profile
async function getVehicleProfile(vehicleId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}?action=vehicle-profile&vehicleId=${encodeURIComponent(vehicleId)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to get vehicle profile');
    }
  } catch (error) {
    console.error('❌ Failed to get vehicle profile:', error);
    throw error;
  }
}

// Get Fleet Vehicle Analytics
async function getFleetVehicleAnalytics() {
  try {
    const response = await fetch(`${API_BASE_URL}?action=vehicle-analytics`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to get vehicle analytics');
    }
  } catch (error) {
    console.error('❌ Failed to get fleet vehicle analytics:', error);
    throw error;
  }
}

// Get All Vehicle Profiles
async function getAllVehicleProfiles() {
  try {
    const response = await fetch(`${API_BASE_URL}?action=all-vehicles`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to get vehicle profiles');
    }
  } catch (error) {
    console.error('❌ Failed to get all vehicle profiles:', error);
    throw error;
  }
}

// Demo Functions pentru testing vehicle optimization
async function demoVehicleOptimization() {
  try {
    console.log('🚛 Starting Vehicle-Specific Optimization Demo...');
    
    // 1. Create sample vehicle profile
    const vehicleProfile = await createVehicleProfile('truck_001', {
      plateNumber: 'B123ABC',
      vehicleName: 'Mercedes Actros 2023',
      technicalSpecs: {
        type: 'truck',
        category: 'commercial',
        brand: 'Mercedes',
        model: 'Actros',
        year: 2023,
        engine: { 
          fuelType: 'diesel', 
          engineSize: 12.8, 
          horsePower: 450,
          torque: 2200,
          emissionStandard: 'Euro 6' 
        },
        weight: { 
          emptyWeight: 8500, 
          maxGrossWeight: 40000, 
          maxLoadCapacity: 31500,
          trailerCapacity: 0
        },
        manufacturerConsumption: { 
          cityConsumption: 35,
          highwayConsumption: 28,
          combinedConsumption: 32,
          co2Emissions: 850
        }
      },
      currentState: {
        fuelLevel: 0.8,
        currentLoad: 15000,
        maintenanceStatus: 'good',
        componentCondition: {
          tireCondition: 'good',
          brakeCondition: 'good',
          engineCondition: 'excellent',
          transmissionCondition: 'good'
        }
      }
    });
    
    console.log('✅ Vehicle profile created:', vehicleProfile);
    
    // 2. Get optimized prediction cu vehicle
    const optimizedPrediction = await getEnhancedPrediction({
      distance: 450,
      trafficData: { congestion: 0.4, estimatedDelay: 30 },
      weatherData: { condition: 'clear', drivingScore: 0.85 }
    }, 'driver_john_123', 'truck_001');
    
    console.log('✅ Vehicle-optimized prediction:', optimizedPrediction);
    
    // 3. Report results cu vehicle data
    await reportActualResult(optimizedPrediction.routeId, {
      actualSavingsPercent: 18,
      actualDistance: 425,
      actualDuration: 7.5,
      actualFuelConsumed: 135, // litri
      vehicleState: {
        fuelLevel: 0.45,
        maintenanceStatus: 'good',
        componentWear: 'normal'
      }
    }, 'driver_john_123', 'truck_001');
    
    // 4. Get fleet vehicle analytics
    const fleetAnalytics = await getFleetVehicleAnalytics();
    console.log('📊 Fleet vehicle analytics:', fleetAnalytics);
    
    console.log('🎉 Vehicle optimization demo completed successfully!');
    
  } catch (error) {
    console.error('❌ Vehicle optimization demo failed:', error);
  }
}

// Export toate functions pentru global access
(window as any).getEnhancedPrediction = getEnhancedPrediction;
(window as any).reportActualResult = reportActualResult;
(window as any).getAPIStats = getAPIStats;
(window as any).getLearningInsights = getLearningInsights;
(window as any).getHistoricalPatterns = getHistoricalPatterns;
(window as any).getDriverCoachingInsights = getDriverCoachingInsights;
(window as any).compareDriverPerformance = compareDriverPerformance;
(window as any).getFleetDriverAnalytics = getFleetDriverAnalytics;

// Vehicle functions
(window as any).createVehicleProfile = createVehicleProfile;
(window as any).getVehicleProfile = getVehicleProfile;
(window as any).getFleetVehicleAnalytics = getFleetVehicleAnalytics;
(window as any).getAllVehicleProfiles = getAllVehicleProfiles;
(window as any).demoVehicleOptimization = demoVehicleOptimization;

console.log('🌍 Global Route Optimization API ready cu Vehicle-Specific Optimization!');
console.log('Available functions: getEnhancedPrediction, reportActualResult, getAPIStats, getLearningInsights, getHistoricalPatterns, getDriverCoachingInsights, compareDriverPerformance, getFleetDriverAnalytics, createVehicleProfile, getVehicleProfile, getFleetVehicleAnalytics, getAllVehicleProfiles, demoVehicleOptimization');

export {
  getEnhancedPrediction,
  reportActualResult,
  getAPIStats,
  getLearningInsights,
  getHistoricalPatterns,
  getDriverCoachingInsights,
  compareDriverPerformance,
  getFleetDriverAnalytics,
  createVehicleProfile,
  getVehicleProfile,
  getFleetVehicleAnalytics,
  getAllVehicleProfiles,
  demoVehicleOptimization
};

// CONVENIENCE FUNCTIONS
// DRIVER PERSONALIZATION FUNCTIONS

/**
 * 🎯 Get Personalized Prediction
 * @param route Route request with driver ID
 * @param driverId Driver ID for personalization
 * @returns Personalized route optimization
 */
export async function getPersonalizedPrediction(route: RouteRequest, driverId: string) {
  return await getEnhancedPrediction({
    ...route,
    driverId: driverId
  });
}

// CONVENIENCE FUNCTIONS

/**
 * 🚀 Quick Route Optimization (simplified API)
 * @param distance Distance in km
 * @param options Optional parameters
 * @returns Optimization result
 */
export async function quickOptimize(distance: number, options: Partial<RouteRequest> = {}) {
  return await getEnhancedPrediction({
    distance,
    ...options
  });
}

/**
 * 📝 Quick Result Reporting (simplified API)
 * @param routeId Route ID
 * @param actualSavingsPercent Actual savings percentage achieved
 * @param additionalData Additional result data
 * @param driverId Driver ID for learning
 * @returns Success status
 */
export async function quickReportResult(
  routeId: string, 
  actualSavingsPercent: number, 
  additionalData: Partial<ActualRouteResult> = {},
  driverId?: string
): Promise<boolean> {
  return await reportActualResult(routeId, {
    actualSavingsPercent,
    actualDistance: additionalData.actualDistance || 0,
    actualDuration: additionalData.actualDuration || 0,
    ...additionalData
  }, driverId);
}

// UTILITY FUNCTIONS
/**
 * 🔧 Initialize Learning System
 * @returns Initialization status
 */
export async function initializeLearningSystem(): Promise<boolean> {
  try {
    await routeOptimizationService.initialize();
    console.log('✅ Learning system initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize learning system:', error);
    return false;
  }
}

/**
 * 🧹 Cleanup Old Predictions (pentru browser)
 */
export function cleanupOldPredictions(): void {
  if (typeof window !== 'undefined') {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    for (const [routeId, data] of (globalThis as any).pendingLearning.entries()) {
      if (data.timestamp < twentyFourHoursAgo) {
        (globalThis as any).pendingLearning.delete(routeId);
        console.log(`🧹 Cleaned up old pending prediction: ${routeId}`);
      }
    }
  }
}

/**
 * 📋 Get Pending Predictions (pentru debugging)
 * @returns Array of pending route IDs
 */
export function getPendingPredictions(): string[] {
  if (typeof window !== 'undefined') {
    return Array.from((globalThis as any).pendingLearning.keys());
  }
  return routeOptimizationService.getPendingPredictions();
}

// ADVANCED APIs
/**
 * 🔮 Predict Based on Similar Historical Routes
 * @param route Route parameters
 * @returns Prediction based on similar routes
 */
export async function predictFromSimilarRoutes(route: RouteRequest) {
  try {
    await routeOptimizationService.initialize();
    
    // This calls the historical learner directly
    const prediction = await routeOptimizationService['routeLearner'].predictBasedOnSimilarRoutes(route);
    
    return prediction;
    
  } catch (error) {
    console.error('❌ Failed to predict from similar routes:', error);
    return null;
  }
}

/**
 * 📈 Get Learning Metrics
 * @returns Learning performance metrics
 */
export async function getLearningMetrics() {
  try {
    await routeOptimizationService.initialize();
    
    const metrics = routeOptimizationService['routeLearner'].getLearningMetrics();
    
    return metrics;
    
  } catch (error) {
    console.error('❌ Failed to get learning metrics:', error);
    return null;
  }
}

// AUTO-INITIALIZATION (pentru browser)
if (typeof window !== 'undefined') {
  // Auto-initialize când se încarcă
  initializeLearningSystem().then(() => {
    console.log('🚀 Global Route Optimization API ready');
  });
  
  // Setup periodic cleanup
  setInterval(cleanupOldPredictions, 60 * 60 * 1000); // Every hour
}

// EXPORTS pentru easy access
export {
  routeOptimizationService,
  // Re-export types
  type RouteRequest as OptimizationRequest,
  type ActualRouteResult as RouteResult
};

// GLOBAL ACCESS (pentru browser console testing)
if (typeof window !== 'undefined') {
  (window as any).routeOptimizer = {
    // Core functions
    getEnhancedPrediction,
    reportActualResult,
    getLearningInsights,
    getHistoricalPatterns,
    getAPIStats,
    
    // Driver personalization functions
    getDriverCoachingInsights,
    compareDriverPerformance,
    getFleetDriverAnalytics,
    getPersonalizedPrediction,
    
    // Vehicle optimization functions
    createVehicleProfile,
    getVehicleProfile,
    getFleetVehicleAnalytics,
    getAllVehicleProfiles,
    demoVehicleOptimization,
    
    // Convenience functions
    quickOptimize,
    quickReportResult,
    getPendingPredictions,
    cleanupOldPredictions
  };
  
  console.log('🌐 Global Route Optimizer with Driver Personalization available at window.routeOptimizer');
} 