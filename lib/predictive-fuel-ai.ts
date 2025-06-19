import * as tf from '@tensorflow/tfjs';
import axios from 'axios';

export interface VehicleHistoricalData {
  vehicleId: string;
  date: Date;
  fuelConsumed: number;
  distanceTraveled: number;
  driverBehaviorScore: number;
  weatherConditions: WeatherData;
  trafficDensity: number;
  loadWeight: number;
  maintenanceScore: number;
  avgSpeed: number;
  idleTime: number;
  routeEfficiency: number;
  elevationGain: number;
  temperatureAmbient: number;
  stopCount: number;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  precipitation: number;
  visibility: number;
  weatherCondition: string;
}

export interface FuelPrediction {
  day: number;
  date: Date;
  predictedConsumption: number;
  confidence: number;
  weatherImpact: number;
  trafficImpact: number;
  baseConsumption: number;
  recommendations: string[];
}

export interface StrategicRecommendation {
  type: 'fuel_purchase' | 'maintenance' | 'route_optimization' | 'driver_training' | 'vehicle_upgrade';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  expectedSavings: number;
  implementationCost: number;
  roi: number;
  timeframe: string;
  confidence: number;
  impact: {
    fuelReduction: number;
    costSavings: number;
    efficiencyGain: number;
  };
}

export interface PredictiveAnalytics {
  vehicleId: string;
  predictions: FuelPrediction[];
  totalPredictedConsumption: number;
  averageEfficiency: number;
  degradationTrend: number;
  recommendations: StrategicRecommendation[];
  accuracyScore: number;
  lastUpdated: Date;
  nextOptimalMaintenanceDate: Date;
  seasonalFactors: {
    winter: number;
    spring: number;
    summer: number;
    autumn: number;
  };
}

export class PredictiveFuelAI {
  private model: tf.LayersModel | null = null;
  private weatherApiKey: string = process.env.OPENWEATHER_API_KEY || '';
  private modelAccuracy: number = 0;
  private trainingData: VehicleHistoricalData[] = [];
  private isModelTrained: boolean = false;
  private predictionCache: Map<string, PredictiveAnalytics> = new Map();
  
  // Performance metrics
  private metrics = {
    totalPredictions: 0,
    correctPredictions: 0,
    avgAccuracy: 0,
    lastAccuracyCheck: new Date(),
    modelVersion: '1.0.0'
  };

  constructor(weatherApiKey?: string) {
    if (weatherApiKey) {
      this.weatherApiKey = weatherApiKey;
    }
    this.initializeModel();
  }

  /**
   * Initialize Neural Network Model
   * Architecture: 15 features → 128 → 64 → 32 → 7 days output
   */
  private async initializeModel(): Promise<void> {
    try {
      this.model = tf.sequential({
        layers: [
          // Input layer - 15 features
          tf.layers.dense({
            inputShape: [15],
            units: 128,
            activation: 'relu',
            kernelInitializer: 'glorotUniform',
            name: 'input_layer'
          }),
          
          // Dropout for regularization
          tf.layers.dropout({
            rate: 0.2,
            name: 'dropout_1'
          }),
          
          // Hidden layer 1
          tf.layers.dense({
            units: 64,
            activation: 'relu',
            kernelInitializer: 'glorotUniform',
            name: 'hidden_layer_1'
          }),
          
          // Dropout for regularization
          tf.layers.dropout({
            rate: 0.15,
            name: 'dropout_2'
          }),
          
          // Hidden layer 2
          tf.layers.dense({
            units: 32,
            activation: 'relu',
            kernelInitializer: 'glorotUniform',
            name: 'hidden_layer_2'
          }),
          
          // Output layer - 7 days prediction
          tf.layers.dense({
            units: 7,
            activation: 'linear',
            name: 'output_layer'
          })
        ]
      });

      // Compile model with Adam optimizer
      this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['meanAbsoluteError']
      });

      console.log('🧠 PredictiveFuelAI: Neural network initialized successfully');
      
    } catch (error) {
      console.error('❌ PredictiveFuelAI: Model initialization failed:', error);
      throw new Error(`Model initialization failed: ${error.message}`);
    }
  }

  /**
   * Train the neural network with historical data
   */
  async trainModel(historicalData: VehicleHistoricalData[]): Promise<number> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    this.trainingData = historicalData;
    
    try {
      // Prepare training data
      const { inputs, outputs } = this.prepareTrainingData(historicalData);
      
      console.log('🔄 PredictiveFuelAI: Starting model training...');
      
      // Training configuration
      const history = await this.model.fit(inputs, outputs, {
        epochs: 100,
        batchSize: 32,
        validationSplit: 0.2,
        shuffle: true,
        verbose: 0,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 20 === 0) {
              console.log(`Epoch ${epoch}: loss = ${logs?.loss?.toFixed(4)}, val_loss = ${logs?.val_loss?.toFixed(4)}`);
            }
          }
        }
      });

      // Calculate model accuracy
      const finalLoss = history.history.val_loss[history.history.val_loss.length - 1] as number;
      this.modelAccuracy = Math.max(0, 100 - (finalLoss * 100));
      this.isModelTrained = true;
      
      console.log(`✅ PredictiveFuelAI: Training completed with ${this.modelAccuracy.toFixed(2)}% accuracy`);
      
      // Cleanup tensors
      inputs.dispose();
      outputs.dispose();
      
      return this.modelAccuracy;
      
    } catch (error) {
      console.error('❌ PredictiveFuelAI: Training failed:', error);
      throw new Error(`Training failed: ${error.message}`);
    }
  }

  /**
   * Prepare training data for neural network
   */
  private prepareTrainingData(data: VehicleHistoricalData[]): { inputs: tf.Tensor, outputs: tf.Tensor } {
    const sequences: number[][] = [];
    const targets: number[][] = [];
    
    // Sort data by vehicle and date
    const sortedData = data.sort((a, b) => 
      a.vehicleId.localeCompare(b.vehicleId) || new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Create sequences for each vehicle
    const vehicleGroups = this.groupByVehicle(sortedData);
    
    Object.values(vehicleGroups).forEach(vehicleData => {
      for (let i = 0; i < vehicleData.length - 7; i++) {
        const features = this.extractFeatures(vehicleData[i]);
        const targets7Days = vehicleData.slice(i + 1, i + 8).map(d => d.fuelConsumed);
        
        if (targets7Days.length === 7) {
          sequences.push(features);
          targets.push(targets7Days);
        }
      }
    });
    
    return {
      inputs: tf.tensor2d(sequences),
      outputs: tf.tensor2d(targets)
    };
  }

  /**
   * Extract 15 features from historical data point
   */
  private extractFeatures(data: VehicleHistoricalData): number[] {
    return [
      data.fuelConsumed / 100,                    // 1. Normalized fuel consumption
      data.distanceTraveled / 1000,               // 2. Distance in km (normalized)
      data.driverBehaviorScore / 100,             // 3. Driver behavior (0-1)
      data.weatherConditions.temperature / 40,    // 4. Temperature (normalized)
      data.weatherConditions.humidity / 100,      // 5. Humidity (0-1)
      data.weatherConditions.windSpeed / 50,      // 6. Wind speed (normalized)
      data.weatherConditions.precipitation / 10,  // 7. Precipitation (normalized)
      data.trafficDensity / 10,                   // 8. Traffic density (0-1)
      data.loadWeight / 10000,                    // 9. Load weight (normalized)
      data.maintenanceScore / 100,                // 10. Maintenance score (0-1)
      data.avgSpeed / 120,                        // 11. Average speed (normalized)
      data.idleTime / 480,                        // 12. Idle time in minutes (normalized)
      data.routeEfficiency / 100,                 // 13. Route efficiency (0-1)
      data.elevationGain / 1000,                  // 14. Elevation gain (normalized)
      data.stopCount / 50                         // 15. Stop count (normalized)
    ];
  }

  /**
   * Group historical data by vehicle
   */
  private groupByVehicle(data: VehicleHistoricalData[]): Record<string, VehicleHistoricalData[]> {
    return data.reduce((groups, item) => {
      if (!groups[item.vehicleId]) {
        groups[item.vehicleId] = [];
      }
      groups[item.vehicleId].push(item);
      return groups;
    }, {} as Record<string, VehicleHistoricalData[]>);
  }

  /**
   * Generate 7-day fuel consumption predictions
   */
  async predict7DayFuelConsumption(
    vehicleId: string,
    currentData: Partial<VehicleHistoricalData>,
    weatherForecast?: WeatherData[]
  ): Promise<PredictiveAnalytics> {
    if (!this.model || !this.isModelTrained) {
      throw new Error('Model not trained yet');
    }

    const cacheKey = `${vehicleId}_${Date.now()}`;
    
    try {
      // Get weather forecast if not provided
      if (!weatherForecast) {
        weatherForecast = await this.getWeatherForecast();
      }

      // Prepare input features
      const baseFeatures = this.extractFeaturesFromPartialData(currentData);
      const predictions: FuelPrediction[] = [];
      
      // Generate predictions for 7 days
      for (let day = 1; day <= 7; day++) {
        const dayWeather = weatherForecast[Math.min(day - 1, weatherForecast.length - 1)];
        const features = this.adjustFeaturesForDay(baseFeatures, dayWeather, day);
        
        const inputTensor = tf.tensor2d([features]);
        const prediction = this.model.predict(inputTensor) as tf.Tensor;
        const predictionData = await prediction.data();
        
        const predictedConsumption = predictionData[day - 1];
        const confidence = this.calculateConfidence(predictedConsumption, currentData);
        
        predictions.push({
          day,
          date: new Date(Date.now() + day * 24 * 60 * 60 * 1000),
          predictedConsumption: Math.max(0, predictedConsumption * 100),
          confidence,
          weatherImpact: this.calculateWeatherImpact(dayWeather),
          trafficImpact: this.calculateTrafficImpact(day),
          baseConsumption: baseFeatures[0] * 100,
          recommendations: this.generateDayRecommendations(predictedConsumption, dayWeather, day)
        });
        
        // Cleanup tensors
        inputTensor.dispose();
        prediction.dispose();
      }

      // Generate strategic recommendations
      const strategicRecommendations = await this.generateStrategicRecommendations(
        vehicleId,
        predictions,
        currentData
      );

      // Calculate analytics
      const analytics: PredictiveAnalytics = {
        vehicleId,
        predictions,
        totalPredictedConsumption: predictions.reduce((sum, p) => sum + p.predictedConsumption, 0),
        averageEfficiency: this.calculateAverageEfficiency(predictions),
        degradationTrend: this.calculateDegradationTrend(vehicleId),
        recommendations: strategicRecommendations,
        accuracyScore: this.modelAccuracy,
        lastUpdated: new Date(),
        nextOptimalMaintenanceDate: this.calculateOptimalMaintenanceDate(predictions),
        seasonalFactors: this.calculateSeasonalFactors()
      };

      // Cache results
      this.predictionCache.set(cacheKey, analytics);
      
      console.log(`✅ PredictiveFuelAI: Generated 7-day forecast for vehicle ${vehicleId}`);
      
      return analytics;
      
    } catch (error) {
      console.error('❌ PredictiveFuelAI: Prediction failed:', error);
      throw new Error(`Prediction failed: ${error.message}`);
    }
  }

  /**
   * Get weather forecast from OpenWeatherMap API
   */
  private async getWeatherForecast(): Promise<WeatherData[]> {
    if (!this.weatherApiKey) {
      console.warn('⚠️ PredictiveFuelAI: No weather API key, using mock data');
      return this.generateMockWeatherData();
    }

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=Bucharest&appid=${this.weatherApiKey}&units=metric`
      );

      const forecasts = response.data.list.slice(0, 7);
      
      return forecasts.map((forecast: any) => ({
        temperature: forecast.main.temp,
        humidity: forecast.main.humidity,
        windSpeed: forecast.wind.speed,
        pressure: forecast.main.pressure,
        precipitation: forecast.rain?.['3h'] || 0,
        visibility: forecast.visibility / 1000,
        weatherCondition: forecast.weather[0].main
      }));
      
    } catch (error) {
      console.warn('⚠️ PredictiveFuelAI: Weather API failed, using mock data:', error.message);
      return this.generateMockWeatherData();
    }
  }

  /**
   * Generate mock weather data for testing
   */
  private generateMockWeatherData(): WeatherData[] {
    const conditions = ['Clear', 'Clouds', 'Rain', 'Snow'];
    
    return Array.from({ length: 7 }, (_, i) => ({
      temperature: 15 + Math.sin(i * 0.5) * 10,
      humidity: 60 + Math.random() * 30,
      windSpeed: 5 + Math.random() * 10,
      pressure: 1013 + Math.random() * 20 - 10,
      precipitation: Math.random() < 0.3 ? Math.random() * 5 : 0,
      visibility: 8 + Math.random() * 2,
      weatherCondition: conditions[Math.floor(Math.random() * conditions.length)]
    }));
  }

  /**
   * Extract features from partial data
   */
  private extractFeaturesFromPartialData(data: Partial<VehicleHistoricalData>): number[] {
    return [
      (data.fuelConsumed || 50) / 100,
      (data.distanceTraveled || 200) / 1000,
      (data.driverBehaviorScore || 85) / 100,
      (data.weatherConditions?.temperature || 20) / 40,
      (data.weatherConditions?.humidity || 65) / 100,
      (data.weatherConditions?.windSpeed || 10) / 50,
      (data.weatherConditions?.precipitation || 0) / 10,
      (data.trafficDensity || 5) / 10,
      (data.loadWeight || 5000) / 10000,
      (data.maintenanceScore || 90) / 100,
      (data.avgSpeed || 60) / 120,
      (data.idleTime || 30) / 480,
      (data.routeEfficiency || 85) / 100,
      (data.elevationGain || 100) / 1000,
      (data.stopCount || 10) / 50
    ];
  }

  /**
   * Adjust features for specific day with weather data
   */
  private adjustFeaturesForDay(baseFeatures: number[], weather: WeatherData, day: number): number[] {
    const adjusted = [...baseFeatures];
    
    // Update weather features
    adjusted[3] = weather.temperature / 40;
    adjusted[4] = weather.humidity / 100;
    adjusted[5] = weather.windSpeed / 50;
    adjusted[6] = weather.precipitation / 10;
    
    // Apply day-of-week patterns
    const dayOfWeek = (new Date().getDay() + day - 1) % 7;
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.8 : 1.0;
    adjusted[7] *= weekendFactor; // Traffic density
    
    return adjusted;
  }

  /**
   * Calculate prediction confidence
   */
  private calculateConfidence(prediction: number, currentData: Partial<VehicleHistoricalData>): number {
    const baseConfidence = this.modelAccuracy / 100;
    
    // Adjust based on data completeness
    const dataCompleteness = Object.keys(currentData).length / 15;
    const completenessBonus = dataCompleteness * 0.1;
    
    // Adjust based on prediction reasonableness
    const reasonableness = prediction > 0 && prediction < 2 ? 1 : 0.7;
    
    return Math.min(0.99, Math.max(0.5, baseConfidence + completenessBonus) * reasonableness);
  }

  /**
   * Calculate weather impact on fuel consumption
   */
  private calculateWeatherImpact(weather: WeatherData): number {
    let impact = 0;
    
    // Temperature impact
    if (weather.temperature < 0) impact += 0.15;
    else if (weather.temperature > 35) impact += 0.1;
    
    // Wind impact
    if (weather.windSpeed > 20) impact += 0.08;
    
    // Precipitation impact
    if (weather.precipitation > 2) impact += 0.12;
    
    // Visibility impact
    if (weather.visibility < 5) impact += 0.05;
    
    return Math.min(0.4, impact);
  }

  /**
   * Calculate traffic impact based on day
   */
  private calculateTrafficImpact(day: number): number {
    const dayOfWeek = (new Date().getDay() + day - 1) % 7;
    
    // Monday-Friday higher traffic
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      return 0.15;
    }
    
    // Weekend lower traffic
    return 0.05;
  }

  /**
   * Generate daily recommendations
   */
  private generateDayRecommendations(prediction: number, weather: WeatherData, day: number): string[] {
    const recommendations: string[] = [];
    
    if (prediction > 1.2) {
      recommendations.push('High fuel consumption predicted - consider route optimization');
    }
    
    if (weather.precipitation > 2) {
      recommendations.push('Rain expected - reduce speed for safety and efficiency');
    }
    
    if (weather.temperature < 0) {
      recommendations.push('Cold weather - allow extra warm-up time');
    }
    
    if (weather.windSpeed > 20) {
      recommendations.push('Strong winds - adjust driving style for fuel efficiency');
    }
    
    const dayOfWeek = (new Date().getDay() + day - 1) % 7;
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      recommendations.push('Weekday - expect higher traffic, plan alternative routes');
    }
    
    return recommendations;
  }

  /**
   * Generate strategic recommendations
   */
  private async generateStrategicRecommendations(
    vehicleId: string,
    predictions: FuelPrediction[],
    currentData: Partial<VehicleHistoricalData>
  ): Promise<StrategicRecommendation[]> {
    const recommendations: StrategicRecommendation[] = [];
    
    const avgConsumption = predictions.reduce((sum, p) => sum + p.predictedConsumption, 0) / 7;
    const highConsumptionDays = predictions.filter(p => p.predictedConsumption > avgConsumption * 1.2).length;
    
    // Fuel purchase recommendation
    if (predictions.some(p => p.predictedConsumption > avgConsumption * 1.3)) {
      recommendations.push({
        type: 'fuel_purchase',
        priority: 'medium',
        title: 'Optimal Fuel Purchase Strategy',
        description: 'Purchase fuel before high-consumption days to avoid premium pricing',
        expectedSavings: 150,
        implementationCost: 0,
        roi: 100,
        timeframe: '1-2 days',
        confidence: 0.85,
        impact: {
          fuelReduction: 0,
          costSavings: 150,
          efficiencyGain: 0
        }
      });
    }
    
    // Maintenance recommendation
    const maintenanceScore = currentData.maintenanceScore || 90;
    if (maintenanceScore < 80 || highConsumptionDays >= 3) {
      recommendations.push({
        type: 'maintenance',
        priority: maintenanceScore < 70 ? 'high' : 'medium',
        title: 'Preventive Maintenance Required',
        description: 'Vehicle showing signs of decreased efficiency - schedule maintenance',
        expectedSavings: 800,
        implementationCost: 300,
        roi: 166,
        timeframe: '1 week',
        confidence: 0.78,
        impact: {
          fuelReduction: 12,
          costSavings: 800,
          efficiencyGain: 15
        }
      });
    }
    
    // Driver training recommendation
    const driverScore = currentData.driverBehaviorScore || 85;
    if (driverScore < 80) {
      recommendations.push({
        type: 'driver_training',
        priority: 'medium',
        title: 'Eco-Driving Training Program',
        description: 'Driver behavior optimization to improve fuel efficiency',
        expectedSavings: 1200,
        implementationCost: 200,
        roi: 500,
        timeframe: '2 weeks',
        confidence: 0.82,
        impact: {
          fuelReduction: 18,
          costSavings: 1200,
          efficiencyGain: 20
        }
      });
    }
    
    // Route optimization recommendation
    const routeEfficiency = currentData.routeEfficiency || 85;
    if (routeEfficiency < 85 || highConsumptionDays >= 4) {
      recommendations.push({
        type: 'route_optimization',
        priority: 'high',
        title: 'Advanced Route Optimization',
        description: 'Implement AI-powered route optimization for high-consumption periods',
        expectedSavings: 2000,
        implementationCost: 100,
        roi: 1900,
        timeframe: 'Immediate',
        confidence: 0.92,
        impact: {
          fuelReduction: 25,
          costSavings: 2000,
          efficiencyGain: 30
        }
      });
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Calculate average efficiency
   */
  private calculateAverageEfficiency(predictions: FuelPrediction[]): number {
    const avgConsumption = predictions.reduce((sum, p) => sum + p.predictedConsumption, 0) / predictions.length;
    return Math.max(0, 100 - avgConsumption);
  }

  /**
   * Calculate degradation trend
   */
  private calculateDegradationTrend(vehicleId: string): number {
    // Mock calculation - in real implementation, compare with historical trends
    return Math.random() * 0.02 - 0.01; // -1% to +1% per month
  }

  /**
   * Calculate optimal maintenance date
   */
  private calculateOptimalMaintenanceDate(predictions: FuelPrediction[]): Date {
    // Find the lowest consumption day in next 30 days for maintenance
    const sortedPredictions = [...predictions].sort((a, b) => a.predictedConsumption - b.predictedConsumption);
    const optimalDay = sortedPredictions[0].date;
    
    return new Date(optimalDay.getTime() + 7 * 24 * 60 * 60 * 1000); // Add a week buffer
  }

  /**
   * Calculate seasonal factors
   */
  private calculateSeasonalFactors(): { winter: number; spring: number; summer: number; autumn: number } {
    return {
      winter: 1.15,  // 15% higher consumption in winter
      spring: 0.95,  // 5% lower in spring
      summer: 1.08,  // 8% higher in summer (AC usage)
      autumn: 0.98   // 2% lower in autumn
    };
  }

  /**
   * Update model accuracy based on real performance
   */
  async updateAccuracy(actualConsumption: number[], predictedConsumption: number[]): Promise<void> {
    if (actualConsumption.length !== predictedConsumption.length) {
      throw new Error('Actual and predicted arrays must have same length');
    }

    const errors = actualConsumption.map((actual, i) => 
      Math.abs(actual - predictedConsumption[i]) / Math.max(actual, 1)
    );
    
    const accuracy = (1 - errors.reduce((sum, error) => sum + error, 0) / errors.length) * 100;
    
    // Update running average
    this.metrics.totalPredictions += actualConsumption.length;
    this.metrics.correctPredictions += actualConsumption.length * (accuracy / 100);
    this.metrics.avgAccuracy = (this.metrics.correctPredictions / this.metrics.totalPredictions) * 100;
    this.metrics.lastAccuracyCheck = new Date();
    
    console.log(`📊 PredictiveFuelAI: Accuracy updated to ${this.metrics.avgAccuracy.toFixed(2)}%`);
  }

  /**
   * Get model performance metrics
   */
  getMetrics(): typeof this.metrics {
    return { ...this.metrics };
  }

  /**
   * Save model to file (for persistence)
   */
  async saveModel(path: string): Promise<void> {
    if (!this.model) {
      throw new Error('No model to save');
    }
    
    await this.model.save(`file://${path}`);
    console.log(`💾 PredictiveFuelAI: Model saved to ${path}`);
  }

  /**
   * Load model from file
   */
  async loadModel(path: string): Promise<void> {
    try {
      this.model = await tf.loadLayersModel(`file://${path}`);
      this.isModelTrained = true;
      console.log(`📂 PredictiveFuelAI: Model loaded from ${path}`);
    } catch (error) {
      console.error('❌ PredictiveFuelAI: Failed to load model:', error);
      throw error;
    }
  }

  /**
   * Get cached predictions
   */
  getCachedPrediction(vehicleId: string): PredictiveAnalytics | null {
    for (const [key, value] of this.predictionCache.entries()) {
      if (key.startsWith(vehicleId) && value.vehicleId === vehicleId) {
        return value;
      }
    }
    return null;
  }

  /**
   * Clear prediction cache
   */
  clearCache(): void {
    this.predictionCache.clear();
    console.log('🗑️ PredictiveFuelAI: Cache cleared');
  }
}

export default PredictiveFuelAI;