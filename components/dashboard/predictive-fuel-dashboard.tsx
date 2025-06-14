'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Zap, TrendingUp, Calendar, Target, AlertTriangle, CheckCircle, Clock, Fuel, BarChart3, LineChart, PieChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PredictiveAnalytics {
  vehicleId: string;
  predictions: FuelPrediction[];
  totalPredictedConsumption: number;
  averageEfficiency: number;
  degradationTrend: number;
  recommendations: StrategicRecommendation[];
  accuracyScore: number;
  lastUpdated: string;
  nextOptimalMaintenanceDate: string;
  seasonalFactors: {
    winter: number;
    spring: number;
    summer: number;
    autumn: number;
  };
}

interface FuelPrediction {
  day: number;
  date: string;
  predictedConsumption: number;
  confidence: number;
  weatherImpact: number;
  trafficImpact: number;
  baseConsumption: number;
  recommendations: string[];
}

interface StrategicRecommendation {
  type: string;
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

interface ModelMetrics {
  totalPredictions: number;
  correctPredictions: number;
  avgAccuracy: number;
  lastAccuracyCheck: string;
  modelVersion: string;
}

export default function PredictiveFuelDashboard() {
  const [predictiveData, setPredictiveData] = useState<PredictiveAnalytics | null>(null);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState('TRUCK-001');
  const [activeTab, setActiveTab] = useState('predictions');

  useEffect(() => {
    loadModelMetrics();
  }, []);

  /**
   * Load model metrics
   */
  const loadModelMetrics = async () => {
    try {
      const response = await fetch('/api/predictive-fuel-ai?action=metrics');
      const data = await response.json();
      
      if (data.success) {
        setModelMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Failed to load model metrics:', error);
    }
  };

  /**
   * Train the neural network model
   */
  const trainModel = async () => {
    setIsTraining(true);
    setTrainingProgress(0);
    
    try {
      // First, get demo data
      const demoResponse = await fetch('/api/predictive-fuel-ai?action=demo_data');
      const demoData = await demoResponse.json();
      
      if (!demoData.success) {
        throw new Error('Failed to get training data');
      }

      // Simulate training progress
      const progressInterval = setInterval(() => {
        setTrainingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      // Train the model
      const response = await fetch('/api/predictive-fuel-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'train',
          historicalData: demoData.data.historicalData
        })
      });

      const result = await response.json();
      clearInterval(progressInterval);
      setTrainingProgress(100);
      
      if (result.success) {
        await loadModelMetrics();
        setTimeout(() => {
          setIsTraining(false);
          setTrainingProgress(0);
        }, 1000);
      } else {
        throw new Error(result.message || 'Training failed');
      }
    } catch (error) {
      console.error('Training failed:', error);
      setIsTraining(false);
      setTrainingProgress(0);
    }
  };

  /**
   * Generate 7-day predictions
   */
  const generatePredictions = async () => {
    setIsPredicting(true);
    
    try {
      // Get demo data
      const demoResponse = await fetch('/api/predictive-fuel-ai?action=demo_data');
      const demoData = await demoResponse.json();
      
      if (!demoData.success) {
        throw new Error('Failed to get current data');
      }

      // Generate predictions
      const response = await fetch('/api/predictive-fuel-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'predict',
          vehicleId: selectedVehicle,
          currentData: {
            ...demoData.data.currentData,
            vehicleId: selectedVehicle
          },
          weatherForecast: demoData.data.weatherForecast
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setPredictiveData(result.data);
      } else {
        throw new Error(result.message || 'Prediction failed');
      }
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setIsPredicting(false);
    }
  };

  /**
   * Get priority color for recommendations
   */
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Brain className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Predictive Fuel AI</h1>
              <p className="text-gray-400">7-Day Fuel Consumption Forecasting with TensorFlow Neural Networks</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={trainModel}
              disabled={isTraining}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isTraining ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Training... {trainingProgress.toFixed(0)}%
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Train Model
                </>
              )}
            </Button>
            
            <Button
              onClick={generatePredictions}
              disabled={isPredicting || !modelMetrics}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPredicting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Predicting...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Predictions
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Training Progress */}
        {isTraining && (
          <Card className="bg-gray-800/50 border-purple-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Neural Network Training</h3>
                <span className="text-purple-400">{trainingProgress.toFixed(0)}%</span>
              </div>
              <Progress value={trainingProgress} className="h-3" />
              <p className="text-sm text-gray-400 mt-2">
                Training TensorFlow model with historical vehicle data...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Model Metrics Overview */}
        {modelMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gray-800/50 border-blue-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Model Accuracy</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {modelMetrics.avgAccuracy.toFixed(1)}%
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-green-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Predictions</p>
                    <p className="text-2xl font-bold text-green-400">
                      {modelMetrics.totalPredictions.toLocaleString()}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-purple-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Model Version</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {modelMetrics.modelVersion}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-orange-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Last Update</p>
                    <p className="text-sm font-bold text-orange-400">
                      {new Date(modelMetrics.lastAccuracyCheck).toLocaleDateString()}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content Tabs */}
        {predictiveData && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
              <TabsTrigger value="predictions">7-Day Predictions</TabsTrigger>
              <TabsTrigger value="recommendations">Strategic Recommendations</TabsTrigger>
              <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
            </TabsList>

            {/* 7-Day Predictions */}
            <TabsContent value="predictions" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Prediction Summary */}
                <Card className="bg-gray-800/50 border-blue-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Fuel className="h-5 w-5 text-blue-500" />
                      <span>Prediction Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Vehicle ID</p>
                        <p className="font-semibold">{predictiveData.vehicleId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Total Consumption</p>
                        <p className="font-semibold text-blue-400">
                          {predictiveData.totalPredictedConsumption.toFixed(1)}L
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Avg Efficiency</p>
                        <p className="font-semibold text-green-400">
                          {predictiveData.averageEfficiency.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Model Accuracy</p>
                        <p className="font-semibold text-purple-400">
                          {predictiveData.accuracyScore.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Seasonal Factors */}
                <Card className="bg-gray-800/50 border-orange-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-orange-500" />
                      <span>Seasonal Factors</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(predictiveData.seasonalFactors).map(([season, factor]) => (
                      <div key={season} className="flex items-center justify-between">
                        <span className="capitalize">{season}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm ${factor > 1 ? 'text-red-400' : 'text-green-400'}`}>
                            {factor > 1 ? '+' : ''}{((factor - 1) * 100).toFixed(0)}%
                          </span>
                          <div className="w-20 bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${factor > 1 ? 'bg-red-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.abs((factor - 1) * 100) * 5}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Daily Predictions Chart */}
              <Card className="bg-gray-800/50 border-blue-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <LineChart className="h-5 w-5 text-blue-500" />
                    <span>7-Day Fuel Consumption Forecast</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {predictiveData.predictions.map((prediction, index) => (
                      <div key={prediction.day} className="flex items-center space-x-4 p-4 bg-gray-700/50 rounded-lg">
                        <div className="w-16 text-center">
                          <p className="text-sm text-gray-400">Day {prediction.day}</p>
                          <p className="text-xs text-gray-500">{formatDate(prediction.date)}</p>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">{prediction.predictedConsumption.toFixed(1)}L</span>
                            <Badge variant="outline" className="text-xs">
                              {(prediction.confidence * 100).toFixed(0)}% confidence
                            </Badge>
                          </div>
                          
                          <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                              style={{ 
                                width: `${(prediction.predictedConsumption / Math.max(...predictiveData.predictions.map(p => p.predictedConsumption))) * 100}%`,
                                animationDelay: `${index * 100}ms`
                              }}
                            />
                          </div>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-400">
                            <span>Weather: +{(prediction.weatherImpact * 100).toFixed(0)}%</span>
                            <span>Traffic: +{(prediction.trafficImpact * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Strategic Recommendations */}
            <TabsContent value="recommendations" className="space-y-6">
              <div className="grid gap-4">
                {predictiveData.recommendations.map((rec, index) => (
                  <Card key={index} className="bg-gray-800/50 border-gray-600/20">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge className={`${getPriorityColor(rec.priority)} text-white`}>
                              {rec.priority.toUpperCase()}
                            </Badge>
                            <h3 className="font-semibold">{rec.title}</h3>
                          </div>
                          
                          <p className="text-gray-400 mb-4">{rec.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-400">Expected Savings</p>
                              <p className="font-semibold text-green-400">${rec.expectedSavings}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Implementation Cost</p>
                              <p className="font-semibold text-orange-400">${rec.implementationCost}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">ROI</p>
                              <p className="font-semibold text-blue-400">{rec.roi}%</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Timeframe</p>
                              <p className="font-semibold">{rec.timeframe}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4 text-center">
                          <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-2">
                            <span className="text-lg font-bold text-blue-400">
                              {(rec.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">Confidence</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Performance Analytics */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gray-800/50 border-green-500/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Fuel Reduction Impact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-400">
                        {predictiveData.recommendations.reduce((sum, rec) => sum + rec.impact.fuelReduction, 0).toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-400">Potential Reduction</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-blue-500/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Cost Savings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-400">
                        ${predictiveData.recommendations.reduce((sum, rec) => sum + rec.impact.costSavings, 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-400">Annual Savings</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Efficiency Gain</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-400">
                        {predictiveData.recommendations.reduce((sum, rec) => sum + rec.impact.efficiencyGain, 0).toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-400">Performance Boost</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Degradation Trend */}
              <Card className="bg-gray-800/50 border-orange-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    <span>Vehicle Degradation Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        <span className={predictiveData.degradationTrend > 0 ? 'text-red-400' : 'text-green-400'}>
                          {predictiveData.degradationTrend > 0 ? '+' : ''}{(predictiveData.degradationTrend * 100).toFixed(2)}%
                        </span>
                      </p>
                      <p className="text-sm text-gray-400">Monthly degradation trend</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Next Optimal Maintenance</p>
                      <p className="font-semibold">
                        {new Date(predictiveData.nextOptimalMaintenanceDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Insights */}
            <TabsContent value="insights" className="space-y-6">
              <Card className="bg-gray-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    <span>Neural Network Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Model Architecture</h4>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Input Layer: 15 features</li>
                        <li>• Hidden Layer 1: 128 neurons (ReLU)</li>
                        <li>• Hidden Layer 2: 64 neurons (ReLU)</li>
                        <li>• Hidden Layer 3: 32 neurons (ReLU)</li>
                        <li>• Output Layer: 7 days prediction</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Training Features</h4>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Historical fuel consumption</li>
                        <li>• Weather conditions & forecasts</li>
                        <li>• Driver behavior patterns</li>
                        <li>• Traffic density analysis</li>
                        <li>• Vehicle maintenance scores</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-700">
                    <h4 className="font-semibold mb-2">Performance Metrics</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-400">85%+</p>
                        <p className="text-sm text-gray-400">Prediction Accuracy</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-400">15-20%</p>
                        <p className="text-sm text-gray-400">Planning Efficiency</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-400">97-99%</p>
                        <p className="text-sm text-gray-400">System Reliability</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* No Data State */}
        {!predictiveData && !isTraining && !isPredicting && (
          <Card className="bg-gray-800/50 border-gray-600/20">
            <CardContent className="p-12 text-center">
              <Brain className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Predictive Fuel AI Ready</h3>
              <p className="text-gray-400 mb-6">
                Train the neural network model and generate 7-day fuel consumption predictions
              </p>
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={trainModel}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Start Training
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 