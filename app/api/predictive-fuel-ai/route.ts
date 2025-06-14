import { NextRequest, NextResponse } from 'next/server';
import PredictiveFuelAI, { 
  VehicleHistoricalData, 
  WeatherData, 
  PredictiveAnalytics,
  StrategicRecommendation 
} from '@/lib/predictive-fuel-ai';

// Global instance of PredictiveFuelAI
let predictiveAI: PredictiveFuelAI | null = null;

/**
 * Initialize PredictiveFuelAI instance
 */
function initializePredictiveAI(): PredictiveFuelAI {
  if (!predictiveAI) {
    predictiveAI = new PredictiveFuelAI(process.env.OPENWEATHER_API_KEY);
  }
  return predictiveAI;
}

/**
 * POST /api/predictive-fuel-ai - Main prediction endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, vehicleId, currentData, weatherForecast, historicalData } = body;

    const ai = initializePredictiveAI();

    switch (action) {
      case 'predict':
        return await handlePrediction(ai, vehicleId, currentData, weatherForecast);
      
      case 'train':
        return await handleTraining(ai, historicalData);
      
      case 'update_accuracy':
        return await handleAccuracyUpdate(ai, body.actualConsumption, body.predictedConsumption);
      
      case 'get_metrics':
        return await handleGetMetrics(ai);
      
      case 'clear_cache':
        return await handleClearCache(ai);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action', validActions: ['predict', 'train', 'update_accuracy', 'get_metrics', 'clear_cache'] },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ PredictiveFuelAI API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/predictive-fuel-ai - Get cached predictions and analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    const action = searchParams.get('action');

    const ai = initializePredictiveAI();

    switch (action) {
      case 'cached_prediction':
        if (!vehicleId) {
          return NextResponse.json({ error: 'vehicleId required for cached_prediction' }, { status: 400 });
        }
        return await handleGetCachedPrediction(ai, vehicleId);
      
      case 'metrics':
        return await handleGetMetrics(ai);
      
      case 'demo_data':
        return await handleGetDemoData();
      
      default:
        return NextResponse.json({
          error: 'Invalid action',
          validActions: ['cached_prediction', 'metrics', 'demo_data']
        }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ PredictiveFuelAI GET Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * Handle 7-day fuel consumption prediction
 */
async function handlePrediction(
  ai: PredictiveFuelAI, 
  vehicleId: string, 
  currentData: any, 
  weatherForecast?: WeatherData[]
): Promise<NextResponse> {
  if (!vehicleId || !currentData) {
    return NextResponse.json(
      { error: 'vehicleId and currentData are required' },
      { status: 400 }
    );
  }

  try {
    const prediction = await ai.predict7DayFuelConsumption(vehicleId, currentData, weatherForecast);
    
    return NextResponse.json({
      success: true,
      data: prediction,
      timestamp: new Date().toISOString(),
      metadata: {
        vehicleId,
        predictionDays: 7,
        modelAccuracy: ai.getMetrics().avgAccuracy,
        version: '1.0.0'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Prediction failed', 
        message: error instanceof Error ? error.message : 'Unknown error',
        suggestion: 'Try training the model first or provide more complete currentData'
      },
      { status: 400 }
    );
  }
}

/**
 * Handle model training
 */
async function handleTraining(ai: PredictiveFuelAI, historicalData: VehicleHistoricalData[]): Promise<NextResponse> {
  if (!historicalData || !Array.isArray(historicalData) || historicalData.length === 0) {
    return NextResponse.json(
      { error: 'historicalData array is required and must not be empty' },
      { status: 400 }
    );
  }

  if (historicalData.length < 50) {
    return NextResponse.json(
      { 
        error: 'Insufficient training data', 
        message: `Minimum 50 data points required, received ${historicalData.length}`,
        suggestion: 'Provide more historical vehicle data for better training results'
      },
      { status: 400 }
    );
  }

  try {
    console.log(`🔄 Starting training with ${historicalData.length} data points...`);
    const accuracy = await ai.trainModel(historicalData);
    
    return NextResponse.json({
      success: true,
      message: 'Model trained successfully',
      accuracy: accuracy,
      dataPoints: historicalData.length,
      timestamp: new Date().toISOString(),
      metrics: ai.getMetrics()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Training failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * Handle accuracy update
 */
async function handleAccuracyUpdate(
  ai: PredictiveFuelAI, 
  actualConsumption: number[], 
  predictedConsumption: number[]
): Promise<NextResponse> {
  if (!actualConsumption || !predictedConsumption) {
    return NextResponse.json(
      { error: 'actualConsumption and predictedConsumption arrays are required' },
      { status: 400 }
    );
  }

  if (actualConsumption.length !== predictedConsumption.length) {
    return NextResponse.json(
      { error: 'actualConsumption and predictedConsumption arrays must have the same length' },
      { status: 400 }
    );
  }

  try {
    await ai.updateAccuracy(actualConsumption, predictedConsumption);
    
    return NextResponse.json({
      success: true,
      message: 'Accuracy updated successfully',
      metrics: ai.getMetrics(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Accuracy update failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * Handle metrics retrieval
 */
async function handleGetMetrics(ai: PredictiveFuelAI): Promise<NextResponse> {
  try {
    const metrics = ai.getMetrics();
    
    return NextResponse.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to get metrics', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * Handle cache clearing
 */
async function handleClearCache(ai: PredictiveFuelAI): Promise<NextResponse> {
  try {
    ai.clearCache();
    
    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to clear cache', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * Handle cached prediction retrieval
 */
async function handleGetCachedPrediction(ai: PredictiveFuelAI, vehicleId: string): Promise<NextResponse> {
  try {
    const cachedPrediction = ai.getCachedPrediction(vehicleId);
    
    if (!cachedPrediction) {
      return NextResponse.json({
        success: false,
        message: 'No cached prediction found for this vehicle',
        vehicleId,
        suggestion: 'Generate a new prediction first'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: cachedPrediction,
      vehicleId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to get cached prediction', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * Handle demo data generation
 */
async function handleGetDemoData(): Promise<NextResponse> {
  try {
    const demoHistoricalData = generateDemoHistoricalData();
    const demoCurrentData = generateDemoCurrentData();
    const demoWeatherForecast = generateDemoWeatherForecast();
    
    return NextResponse.json({
      success: true,
      data: {
        historicalData: demoHistoricalData,
        currentData: demoCurrentData,
        weatherForecast: demoWeatherForecast
      },
      message: 'Demo data generated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to generate demo data', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * Generate demo historical data for testing
 */
function generateDemoHistoricalData(): VehicleHistoricalData[] {
  const data: VehicleHistoricalData[] = [];
  const vehicleIds = ['TRUCK-001', 'VAN-002', 'TRUCK-003'];
  
  for (let i = 0; i < 100; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    data.push({
      vehicleId: vehicleIds[i % vehicleIds.length],
      date: date,
      fuelConsumed: 45 + Math.random() * 30,
      distanceTraveled: 150 + Math.random() * 100,
      driverBehaviorScore: 70 + Math.random() * 25,
      weatherConditions: {
        temperature: 15 + Math.random() * 20,
        humidity: 50 + Math.random() * 40,
        windSpeed: 5 + Math.random() * 15,
        pressure: 1000 + Math.random() * 30,
        precipitation: Math.random() < 0.3 ? Math.random() * 5 : 0,
        visibility: 8 + Math.random() * 2,
        weatherCondition: ['Clear', 'Clouds', 'Rain', 'Snow'][Math.floor(Math.random() * 4)]
      },
      trafficDensity: 3 + Math.random() * 5,
      loadWeight: 3000 + Math.random() * 4000,
      maintenanceScore: 80 + Math.random() * 20,
      avgSpeed: 50 + Math.random() * 30,
      idleTime: 10 + Math.random() * 50,
      routeEfficiency: 75 + Math.random() * 20,
      elevationGain: 50 + Math.random() * 200,
      temperatureAmbient: 15 + Math.random() * 20,
      stopCount: 5 + Math.floor(Math.random() * 20)
    });
  }
  
  return data;
}

/**
 * Generate demo current data
 */
function generateDemoCurrentData(): Partial<VehicleHistoricalData> {
  return {
    vehicleId: 'TRUCK-001',
    fuelConsumed: 52,
    distanceTraveled: 180,
    driverBehaviorScore: 85,
    weatherConditions: {
      temperature: 22,
      humidity: 65,
      windSpeed: 8,
      pressure: 1015,
      precipitation: 0,
      visibility: 10,
      weatherCondition: 'Clear'
    },
    trafficDensity: 6,
    loadWeight: 4500,
    maintenanceScore: 88,
    avgSpeed: 65,
    idleTime: 25,
    routeEfficiency: 82,
    elevationGain: 120,
    temperatureAmbient: 22,
    stopCount: 12
  };
}

/**
 * Generate demo weather forecast
 */
function generateDemoWeatherForecast(): WeatherData[] {
  const conditions = ['Clear', 'Clouds', 'Rain', 'Snow'];
  
  return Array.from({ length: 7 }, (_, i) => ({
    temperature: 18 + Math.sin(i * 0.5) * 8,
    humidity: 60 + Math.random() * 25,
    windSpeed: 6 + Math.random() * 8,
    pressure: 1012 + Math.random() * 15 - 7,
    precipitation: Math.random() < 0.25 ? Math.random() * 3 : 0,
    visibility: 8.5 + Math.random() * 1.5,
    weatherCondition: conditions[Math.floor(Math.random() * conditions.length)]
  }));
} 