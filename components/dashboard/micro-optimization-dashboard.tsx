'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Activity,
  Gauge,
  MessageCircle,
  Settings,
  Car,
  Timer,
  Fuel,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface MicroOptimizationMetrics {
  sessionDuration: number;
  totalOptimizations: number;
  cumulativeSavings: number;
  averageEfficiencyGain: number;
  coachingMessages: number;
  realTimeScore: number;
  currentDataQuality: number;
  bufferStatus: {
    currentSize: number;
    maxSize: number;
  };
  systemStatus: string;
  performance: {
    efficiencyTrend: string;
    savingsRate: number;
    coachingEffectiveness: number;
    systemHealth: string;
  };
}

interface DriverCoachingInsights {
  driverId: string;
  overallEffectiveness: number;
  responseRate: number;
  improvementAreas: string[];
  strengths: string[];
  analytics: {
    improvementRate: number;
    consistencyScore: number;
    adaptabilityScore: number;
    preferredCoachingStyle: string;
  };
}

interface VehicleOptimizations {
  vehicleId: string;
  optimizations: Array<{
    type: string;
    description: string;
    potentialGain: number;
    technique: string;
    implementation: string;
  }>;
  totalPotentialGain: number;
}

export default function MicroOptimizationDashboard() {
  const [activeTab, setActiveTab] = useState('real-time');
  const [isOptimizationActive, setIsOptimizationActive] = useState(false);
  const [metrics, setMetrics] = useState<MicroOptimizationMetrics | null>(null);
  const [driverInsights, setDriverInsights] = useState<DriverCoachingInsights | null>(null);
  const [vehicleOptimizations, setVehicleOptimizations] = useState<VehicleOptimizations | null>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Settings
  const [coachingLevel, setCoachingLevel] = useState('moderate');
  const [selectedVehicle, setSelectedVehicle] = useState('TRUCK_001');
  const [selectedDriver, setSelectedDriver] = useState('driver_001');

  useEffect(() => {
    loadSystemStatus();
    loadRealTimeMetrics();
    loadDriverInsights();
    loadVehicleOptimizations();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      if (isOptimizationActive) {
        loadRealTimeMetrics();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isOptimizationActive]);

  const loadSystemStatus = async () => {
    try {
      const response = await fetch('/api/micro-optimization?action=system_status');
      const result = await response.json();
      if (result.success) {
        setSystemStatus(result.data);
      }
    } catch (error) {
      console.error('Failed to load system status:', error);
    }
  };

  const loadRealTimeMetrics = async () => {
    try {
      const response = await fetch('/api/micro-optimization?action=real_time_metrics');
      const result = await response.json();
      if (result.success) {
        setMetrics(result.data);
      }
    } catch (error) {
      console.error('Failed to load real-time metrics:', error);
    }
  };

  const loadDriverInsights = async () => {
    try {
      const response = await fetch(`/api/micro-optimization?action=driver_coaching_insights&driverId=${selectedDriver}`);
      const result = await response.json();
      if (result.success) {
        setDriverInsights(result.data);
      }
    } catch (error) {
      console.error('Failed to load driver insights:', error);
    }
  };

  const loadVehicleOptimizations = async () => {
    try {
      const response = await fetch(`/api/micro-optimization?action=vehicle_specific_optimizations&vehicleId=${selectedVehicle}`);
      const result = await response.json();
      if (result.success) {
        setVehicleOptimizations(result.data);
      }
    } catch (error) {
      console.error('Failed to load vehicle optimizations:', error);
    }
  };

  const handleStartOptimization = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/micro-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_real_time_optimization',
          vehicleId: selectedVehicle,
          coachingLevel: coachingLevel,
          optimizationThreshold: 0.02
        })
      });

      const result = await response.json();
      if (result.success) {
        setIsOptimizationActive(true);
        console.log('✅ Real-time optimization started:', result.data);
      } else {
        console.error('❌ Failed to start optimization:', result.error);
      }
    } catch (error) {
      console.error('❌ Failed to start optimization:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopOptimization = () => {
    setIsOptimizationActive(false);
    console.log('⏹️ Real-time optimization stopped');
  };

  const handleUpdateSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/micro-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_coaching_settings',
          coachingLevel: coachingLevel,
          samplingRate: 1000,
          optimizationThreshold: 0.02
        })
      });

      const result = await response.json();
      if (result.success) {
        console.log('✅ Settings updated:', result.data);
      }
    } catch (error) {
      console.error('❌ Failed to update settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getEfficiencyColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyBadge = (score: number) => {
    if (score >= 0.9) return { label: 'Excellent', variant: 'default' as const };
    if (score >= 0.8) return { label: 'Good', variant: 'secondary' as const };
    if (score >= 0.6) return { label: 'Fair', variant: 'outline' as const };
    return { label: 'Needs Improvement', variant: 'destructive' as const };
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="text-yellow-500" />
            Micro-Optimization Fuel Engine
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time driving behavior optimization și intelligent coaching
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Badge variant={isOptimizationActive ? "default" : "secondary"}>
            {isOptimizationActive ? "ACTIVE" : "STOPPED"}
          </Badge>
          
          {!isOptimizationActive ? (
            <Button 
              onClick={handleStartOptimization}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Optimization
            </Button>
          ) : (
            <Button 
              onClick={handleStopOptimization}
              variant="destructive"
            >
              <Pause className="w-4 h-4 mr-2" />
              Stop Optimization
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Real-time Score</p>
                  <p className={`text-2xl font-bold ${getEfficiencyColor(metrics.realTimeScore)}`}>
                    {(metrics.realTimeScore * 100).toFixed(1)}%
                  </p>
                </div>
                <Gauge className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Session Duration</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatDuration(metrics.sessionDuration)}
                  </p>
                </div>
                <Timer className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Fuel Savings</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(metrics.cumulativeSavings * 100).toFixed(1)}%
                  </p>
                </div>
                <Fuel className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Coaching Messages</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {metrics.coachingMessages}
                  </p>
                </div>
                <MessageCircle className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="real-time">Real-time Monitoring</TabsTrigger>
          <TabsTrigger value="coaching">Driver Coaching</TabsTrigger>
          <TabsTrigger value="vehicle">Vehicle Optimizations</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Real-time Monitoring Tab */}
        <TabsContent value="real-time" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Efficiency Score</span>
                        <span className={`text-sm font-bold ${getEfficiencyColor(metrics.realTimeScore)}`}>
                          {(metrics.realTimeScore * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={metrics.realTimeScore * 100} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Data Quality</span>
                        <span className="text-sm font-bold text-green-600">
                          {(metrics.currentDataQuality * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={metrics.currentDataQuality * 100} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Buffer Usage</span>
                        <span className="text-sm font-bold text-blue-600">
                          {metrics.bufferStatus.currentSize}/{metrics.bufferStatus.maxSize}
                        </span>
                      </div>
                      <Progress value={(metrics.bufferStatus.currentSize / metrics.bufferStatus.maxSize) * 100} />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Total Optimizations</p>
                        <p className="text-lg font-bold text-green-600">{metrics.totalOptimizations}</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Avg Efficiency Gain</p>
                        <p className="text-lg font-bold text-blue-600">
                          {(metrics.averageEfficiencyGain * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {systemStatus && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Overall Status</span>
                      <Badge variant="default" className="bg-green-600">
                        {systemStatus.status.toUpperCase()}
                      </Badge>
                    </div>

                    {Object.entries(systemStatus.components).map(([key, component]: [string, any]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <div className="flex items-center gap-2">
                          {component.status === 'active' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          )}
                          <Badge variant={component.status === 'active' ? 'default' : 'secondary'}>
                            {component.status}
                          </Badge>
                        </div>
                      </div>
                    ))}

                    {metrics?.performance && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-2">Performance</p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Coaching Effectiveness:</span>
                            <span className="font-medium">
                              {(metrics.performance.coachingEffectiveness * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Savings Rate:</span>
                            <span className="font-medium">
                              {metrics.performance.savingsRate.toFixed(2)}%/h
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>System Health:</span>
                            <span className="font-medium">{metrics.performance.systemHealth}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Real-time Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isOptimizationActive ? (
                <div className="space-y-3">
                  <Alert>
                    <Activity className="h-4 w-4" />
                    <AlertTitle>Real-time Monitoring Active</AlertTitle>
                    <AlertDescription>
                      System is analyzing driving behavior și providing micro-optimizations. 
                      {metrics && ` Current efficiency score: ${(metrics.realTimeScore * 100).toFixed(1)}%`}
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Last Update</p>
                      <p className="font-medium">
                        {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Monitoring Since</p>
                      <p className="font-medium">
                        {metrics ? formatDuration(metrics.sessionDuration) : '--'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Data Points</p>
                      <p className="font-medium">
                        {metrics?.bufferStatus.currentSize || 0}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <Alert>
                  <Pause className="h-4 w-4" />
                  <AlertTitle>Monitoring Stopped</AlertTitle>
                  <AlertDescription>
                    Click "Start Optimization" to begin real-time driving behavior analysis.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Driver Coaching Tab */}
        <TabsContent value="coaching" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Driver Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Driver Performance Insights
                </CardTitle>
                <CardDescription>
                  Driver: {selectedDriver}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {driverInsights && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Overall Effectiveness</span>
                        <Badge {...getEfficiencyBadge(driverInsights.overallEffectiveness)}>
                          {(driverInsights.overallEffectiveness * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      <Progress value={driverInsights.overallEffectiveness * 100} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Response Rate</span>
                        <span className="text-sm font-bold">
                          {(driverInsights.responseRate * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={driverInsights.responseRate * 100} />
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Strengths</h4>
                      <div className="flex flex-wrap gap-2">
                        {driverInsights.strengths.map((strength, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                            {strength.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Improvement Areas</h4>
                      <div className="flex flex-wrap gap-2">
                        {driverInsights.improvementAreas.map((area, index) => (
                          <Badge key={index} variant="outline" className="border-orange-300 text-orange-700">
                            {area.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {driverInsights.analytics && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-2">Analytics</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-600">Improvement Rate:</span>
                            <span className="font-medium ml-1">
                              {(driverInsights.analytics.improvementRate * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Consistency:</span>
                            <span className="font-medium ml-1">
                              {(driverInsights.analytics.consistencyScore * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Adaptability:</span>
                            <span className="font-medium ml-1">
                              {(driverInsights.analytics.adaptabilityScore * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Coaching Style:</span>
                            <span className="font-medium ml-1">
                              {driverInsights.analytics.preferredCoachingStyle}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Coaching Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Coaching Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Driver Selection
                  </label>
                  <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="driver_001">Driver 001</SelectItem>
                      <SelectItem value="driver_002">Driver 002</SelectItem>
                      <SelectItem value="driver_003">Driver 003</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Coaching Level
                  </label>
                  <Select value={coachingLevel} onValueChange={setCoachingLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gentle">Gentle (60s intervals)</SelectItem>
                      <SelectItem value="moderate">Moderate (30s intervals)</SelectItem>
                      <SelectItem value="aggressive">Aggressive (15s intervals)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleUpdateSettings}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Update Coaching Settings
                </Button>

                <Button 
                  onClick={loadDriverInsights}
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Refresh Insights
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vehicle Optimizations Tab */}
        <TabsContent value="vehicle" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehicle-Specific Optimizations
              </CardTitle>
              <CardDescription>
                Vehicle: {selectedVehicle}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Vehicle Selection
                </label>
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRUCK_001">TRUCK_001 (Standard)</SelectItem>
                    <SelectItem value="ELECTRIC_001">ELECTRIC_001 (Electric)</SelectItem>
                    <SelectItem value="HYBRID_001">HYBRID_001 (Hybrid)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {vehicleOptimizations && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Total Potential Gain</h3>
                    <p className="text-2xl font-bold text-blue-700">
                      {(vehicleOptimizations.totalPotentialGain * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-blue-600">
                      Fuel efficiency improvement potential
                    </p>
                  </div>

                  <div className="space-y-3">
                    {vehicleOptimizations.optimizations.map((optimization, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">
                              {optimization.description}
                            </h4>
                            <Badge variant="secondary">
                              +{(optimization.potentialGain * 100).toFixed(1)}%
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Technique:</strong> {optimization.technique}
                          </p>
                          
                          <p className="text-sm text-gray-600">
                            <strong>Implementation:</strong> {optimization.implementation}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Button 
                    onClick={loadVehicleOptimizations}
                    variant="outline"
                    className="w-full"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Refresh Vehicle Optimizations
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Optimization Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Vehicle Selection
                  </label>
                  <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRUCK_001">TRUCK_001</SelectItem>
                      <SelectItem value="TRUCK_002">TRUCK_002</SelectItem>
                      <SelectItem value="TRUCK_003">TRUCK_003</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Coaching Aggression
                  </label>
                  <Select value={coachingLevel} onValueChange={setCoachingLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gentle">Gentle</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleUpdateSettings}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Apply Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Version:</span>
                    <span className="font-medium">3.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">API Status:</span>
                    <Badge variant="default">Online</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">{new Date().toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 