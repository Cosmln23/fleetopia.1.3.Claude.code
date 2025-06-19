'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Cpu, TrendingUp, Zap, Route, Activity, Target, CheckCircle } from 'lucide-react';

interface MLStats {
  isLoaded: boolean;
  accuracy: number;
  trainingDataPoints: number;
  model: string;
}

interface OptimizationResult {
  routeId: string;
  originalDistance: number;
  optimizedDistance: number;
  timeSaved: number;
  fuelSaved: number;
  costSaved: number;
  efficiency: number;
  mlUsed?: boolean;
  confidence?: number;
}

export default function MLRouteOptimizerDashboard() {
  const [mlStats, setMLStats] = useState<MLStats | null>(null);
  const [routeId, setRouteId] = useState('test-route-001');
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMLStats();
  }, []);

  const fetchMLStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/route-optimizer-ml?action=stats');
      const data = await response.json();
      
      if (data.success) {
        setMLStats(data.data);
      } else {
        setError(data.message || 'Failed to fetch ML stats');
      }
    } catch (err) {
      setError('Network error while fetching ML stats');
      console.error('Error fetching ML stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeRoute = async (mlOnly = false) => {
    try {
      setIsOptimizing(true);
      setError(null);
      
      const response = await fetch('/api/route-optimizer-ml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeId,
          action: mlOnly ? 'optimize-ml-only' : 'optimize'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOptimizationResult(data.data);
      } else {
        setError(data.message || 'Optimization failed');
      }
    } catch (err) {
      setError('Network error during optimization');
      console.error('Error optimizing route:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleLearnFromResult = async () => {
    if (!optimizationResult) return;
    
    try {
      const actualResult = {
        actualOptimization: optimizationResult.efficiency / 100,
        actualTimeSaved: optimizationResult.timeSaved * 1.1,
        timestamp: new Date().toISOString()
      };
      
      const response = await fetch('/api/route-optimizer-ml', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeId: optimizationResult.routeId,
          prediction: optimizationResult,
          actualResult
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchMLStats();
        alert('Learning data added successfully! 📚');
      } else {
        setError(data.message || 'Learning failed');
      }
    } catch (err) {
      setError('Network error during learning');
      console.error('Error learning from result:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading ML Route Optimizer...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            ML Route Optimizer
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered route optimization with TensorFlow.js
          </p>
        </div>
        <Button onClick={fetchMLStats} variant="outline" size="sm">
          <Activity className="h-4 w-4 mr-2" />
          Refresh Stats
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="optimizer">Route Optimizer</TabsTrigger>
          <TabsTrigger value="training">Training & Learning</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Model Status</CardTitle>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant={mlStats?.isLoaded ? "default" : "destructive"}>
                    {mlStats?.isLoaded ? "Loaded" : "Not Loaded"}
                  </Badge>
                  {mlStats?.isLoaded && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Neural Network: {mlStats?.model}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {((mlStats?.accuracy || 0) * 100).toFixed(1)}%
                </div>
                <Progress value={(mlStats?.accuracy || 0) * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Training Data</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mlStats?.trainingDataPoints?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Data points used for training
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Performance</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  Fast
                </div>
                <p className="text-xs text-muted-foreground">
                  Real-time optimization
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimizer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Route Optimization</CardTitle>
              <CardDescription>
                Test the ML-powered route optimization engine
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Route ID (e.g., test-route-001)"
                  value={routeId}
                  onChange={(e) => setRouteId(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={() => handleOptimizeRoute(false)}
                  disabled={isOptimizing || !routeId}
                >
                  {isOptimizing ? 'Optimizing...' : 'Optimize Route'}
                </Button>
                <Button 
                  onClick={() => handleOptimizeRoute(true)}
                  disabled={isOptimizing || !routeId || !mlStats?.isLoaded}
                  variant="outline"
                >
                  ML Only
                </Button>
              </div>

              {optimizationResult && (
                <div className="mt-6 p-4 border rounded-lg space-y-3">
                  <h3 className="font-semibold">Optimization Results</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Original Distance:</span>
                      <div className="font-medium">{optimizationResult.originalDistance} km</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Optimized Distance:</span>
                      <div className="font-medium text-green-600">{optimizationResult.optimizedDistance} km</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time Saved:</span>
                      <div className="font-medium text-blue-600">{optimizationResult.timeSaved} min</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fuel Saved:</span>
                      <div className="font-medium text-green-600">{optimizationResult.fuelSaved} L</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cost Saved:</span>
                      <div className="font-medium text-green-600">€{optimizationResult.costSaved}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Efficiency:</span>
                      <div className="font-medium">{optimizationResult.efficiency}%</div>
                    </div>
                  </div>
                  
                  {optimizationResult.mlUsed && (
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary">ML Enhanced</Badge>
                      <span className="text-sm text-muted-foreground">
                        Confidence: {optimizationResult.confidence}%
                      </span>
                    </div>
                  )}

                  <Button 
                    onClick={handleLearnFromResult}
                    variant="outline" 
                    size="sm"
                    className="mt-3"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Learn from This Result
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Machine Learning Training</CardTitle>
              <CardDescription>
                Model training status and continuous learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Continuous Learning</div>
                    <div className="text-sm text-muted-foreground">
                      Model improves with each optimization result
                    </div>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Training Data Points</div>
                    <div className="text-sm text-muted-foreground">
                      {mlStats?.trainingDataPoints?.toLocaleString() || 0} samples collected
                    </div>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Model Performance</div>
                    <div className="text-sm text-muted-foreground">
                      Current accuracy: {((mlStats?.accuracy || 0) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <Progress value={(mlStats?.accuracy || 0) * 100} className="w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
