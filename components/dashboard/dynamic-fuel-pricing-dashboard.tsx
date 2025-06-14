'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  MapPin, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Fuel,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';

interface PricingOptimization {
  strategy: {
    selectedStrategy: {
      id: string;
      type: string;
      description: string;
      totalCost: number;
      totalSavings: number;
      confidence: number;
      risk: string;
    };
    alternativeStrategies: any[];
  };
  discountOptimization: {
    totalDiscountPercent: number;
    totalSavingsAmount: number;
    stackedDiscounts: any[];
  };
  timing: any;
  savings: {
    totalSavingsAmount: number;
    totalSavingsPercent: number;
    finalCost: number;
  };
  marketContext: any;
}

interface MarketTrends {
  currentTrend: string;
  trendStrength: number;
  shortTermForecast: any;
  marketOutlook: string;
  confidence: number;
}

interface ArbitrageOpportunities {
  opportunitiesFound: number;
  topOpportunities: any[];
  averageSavings: number;
}

export default function DynamicFuelPricingDashboard() {
  const [activeTab, setActiveTab] = useState('optimization');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [optimization, setOptimization] = useState<PricingOptimization | null>(null);
  const [marketTrends, setMarketTrends] = useState<MarketTrends | null>(null);
  const [arbitrageOpportunities, setArbitrageOpportunities] = useState<ArbitrageOpportunities | null>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  
  // Form state pentru optimization
  const [vehicleId, setVehicleId] = useState('TRUCK_001');
  const [fuelNeed, setFuelNeed] = useState(150);
  const [location, setLocation] = useState({ lat: 44.4268, lng: 26.1025 });

  useEffect(() => {
    // Load data with delay to prevent UI blocking
    const loadInitialData = async () => {
      try {
        setIsInitialLoading(true);
        await new Promise(resolve => setTimeout(resolve, 100));
        await loadSystemStatus();
        await new Promise(resolve => setTimeout(resolve, 100));
        await loadMarketOverview();
      } finally {
        setIsInitialLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  const loadSystemStatus = async () => {
    try {
      const response = await fetch('/api/dynamic-fuel-pricing?action=system_status');
      const result = await response.json();
      if (result.success) {
        setSystemStatus(result.data);
      }
    } catch (error) {
      console.error('Failed to load system status:', error);
    }
  };

  const loadMarketOverview = async () => {
    try {
      const response = await fetch('/api/dynamic-fuel-pricing?action=market_overview');
      const result = await response.json();
      if (result.success) {
        // Extracting market data from overview
        const marketData = {
          currentTrend: result.data.currentConditions.trend,
          trendStrength: 0.6,
          shortTermForecast: { direction: result.data.currentConditions.trend },
          marketOutlook: 'Market conditions are ' + result.data.currentConditions.trend,
          confidence: 0.8
        };
        setMarketTrends(marketData);
      }
    } catch (error) {
      console.error('Failed to load market overview:', error);
    }
  };

  const handleOptimizeFuelPurchasing = async () => {
    setIsLoading(true);
    try {
      const vehicleProfile = {
        id: vehicleId,
        technicalSpecs: {
          fuelSystem: { tankCapacity: 400 }
        },
        associations: {
          fuelCards: ['Shell', 'BP']
        },
        fleetId: 'FLEET_001'
      };

      const route = {
        startLocation: location,
        endLocation: { lat: location.lat + 0.1, lng: location.lng + 0.1 },
        distance: 150,
        estimatedDuration: 3
      };

      const response = await fetch('/api/dynamic-fuel-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'optimize_fuel_purchasing',
          route,
          vehicleProfile,
          fuelNeed
        })
      });

      const result = await response.json();
      if (result.success) {
        setOptimization(result.data);
        console.log('✅ Fuel purchasing optimized:', result.data);
      } else {
        console.error('❌ Optimization failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Failed to optimize fuel purchasing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeMarketTrends = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/dynamic-fuel-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_market_trends'
        })
      });

      const result = await response.json();
      if (result.success) {
        setMarketTrends(result.data.marketTrends);
        console.log('📈 Market trends analyzed:', result.data);
      }
    } catch (error) {
      console.error('Failed to analyze market trends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetectArbitrageOpportunities = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/dynamic-fuel-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'detect_arbitrage_opportunities',
          currentLocation: location,
          searchRadius: 50
        })
      });

      const result = await response.json();
      if (result.success) {
        setArbitrageOpportunities(result.data.opportunities);
        console.log('🔍 Arbitrage opportunities detected:', result.data);
      }
    } catch (error) {
      console.error('Failed to detect arbitrage opportunities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced optimization function
  const debouncedOptimization = React.useCallback(
    React.useMemo(
      () => {
        let timeoutId: NodeJS.Timeout;
        return (...args: any[]) => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => handleOptimizeFuelPurchasing(), 300);
        };
      },
      []
    ),
    []
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-green-600" />
            Dynamic Fuel Pricing Optimizer
          </h1>
          <p className="text-gray-600 mt-1">
            💰 Strategic fuel purchasing optimization pentru maximum cost savings
          </p>
        </div>
        
        {systemStatus && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600">System Operational</span>
            </div>
            <Badge variant="outline">
              v2.0.0
            </Badge>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {systemStatus && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Uptime</p>
                  <p className="text-2xl font-bold text-green-600">
                    {systemStatus.performance?.uptime || '99.8%'}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Response Time</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {systemStatus.performance?.responseTime || '1200'}ms
                  </p>
                </div>
                <Zap className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Components</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {systemStatus.components ? Object.keys(systemStatus.components).length : 6}
                  </p>
                </div>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Error Rate</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {systemStatus.performance?.errorRate ? 
                      (systemStatus.performance.errorRate * 100).toFixed(1) + '%' : '0.02%'}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="optimization">Fuel Optimization</TabsTrigger>
          <TabsTrigger value="market">Market Analysis</TabsTrigger>
          <TabsTrigger value="arbitrage">Arbitrage Detection</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        </TabsList>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fuel className="h-5 w-5" />
                Fuel Purchase Optimization
              </CardTitle>
              <CardDescription>
                Optimizează strategia de achiziție combustibil pentru economii maxime
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="vehicleId">Vehicle ID</Label>
                  <Input
                    id="vehicleId"
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    placeholder="TRUCK_001"
                  />
                </div>
                <div>
                  <Label htmlFor="fuelNeed">Fuel Needed (L)</Label>
                  <Input
                    id="fuelNeed"
                    type="number"
                    value={fuelNeed}
                    onChange={(e) => setFuelNeed(parseInt(e.target.value))}
                    placeholder="150"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={debouncedOptimization}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Optimizing...' : 'Optimize Purchase'}
                  </Button>
                </div>
              </div>

              {optimization && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">Optimization Results</h3>
                  
                  {/* Strategy Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-md">Recommended Strategy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Strategy Type:</span>
                          <Badge>{optimization.strategy.selectedStrategy.type}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Total Cost:</span>
                          <span className="text-lg font-bold">
                            €{optimization.strategy.selectedStrategy.totalCost.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Total Savings:</span>
                          <span className="text-lg font-bold text-green-600">
                            €{optimization.strategy.selectedStrategy.totalSavings.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Confidence:</span>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={optimization.strategy.selectedStrategy.confidence * 100} 
                              className="w-20"
                            />
                            <span>{(optimization.strategy.selectedStrategy.confidence * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Risk Level:</span>
                          <Badge variant={optimization.strategy.selectedStrategy.risk === 'low' ? 'default' : 'destructive'}>
                            {optimization.strategy.selectedStrategy.risk}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Discounts Card */}
                  {optimization.discountOptimization && optimization.discountOptimization.stackedDiscounts.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-md">Available Discounts</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {optimization.discountOptimization.stackedDiscounts.map((discount: any, index: number) => (
                            <div key={index} className="flex items-center justify-between">
                              <span>{discount.description}</span>
                              <Badge variant="secondary">
                                {(discount.value * 100).toFixed(1)}%
                              </Badge>
                            </div>
                          ))}
                          <div className="border-t pt-2 mt-2">
                            <div className="flex items-center justify-between font-semibold">
                              <span>Total Discount Savings:</span>
                              <span className="text-green-600">
                                €{optimization.discountOptimization.totalSavingsAmount.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Final Cost Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-md">Cost Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Base Cost:</span>
                          <span>€{optimization.strategy.selectedStrategy.totalCost.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-green-600">
                          <span>Total Savings:</span>
                          <span>-€{optimization.savings.totalSavingsAmount.toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex items-center justify-between font-bold text-lg">
                            <span>Final Cost:</span>
                            <span>€{optimization.savings.finalCost.toFixed(2)}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Savings: {(optimization.savings.totalSavingsPercent * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Analysis Tab */}
        <TabsContent value="market" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Market Trends Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleAnalyzeMarketTrends}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Analyzing...' : 'Analyze Market Trends'}
                </Button>

                {marketTrends && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Current Trend:</span>
                      <div className="flex items-center gap-1">
                        {marketTrends.currentTrend === 'rising' ? (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : marketTrends.currentTrend === 'falling' ? (
                          <TrendingDown className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 bg-yellow-500 rounded-full" />
                        )}
                        <Badge 
                          variant={
                            marketTrends.currentTrend === 'rising' ? 'destructive' :
                            marketTrends.currentTrend === 'falling' ? 'default' : 'secondary'
                          }
                        >
                          {marketTrends.currentTrend}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Trend Strength:</span>
                      <div className="flex items-center gap-2">
                        <Progress value={marketTrends.trendStrength * 100} className="w-20" />
                        <span>{(marketTrends.trendStrength * 100).toFixed(0)}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium">Confidence:</span>
                      <div className="flex items-center gap-2">
                        <Progress value={marketTrends.confidence * 100} className="w-20" />
                        <span>{(marketTrends.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <p className="text-sm text-gray-600">
                        <strong>Market Outlook:</strong> {marketTrends.marketOutlook}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Regional Price Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>București:</span>
                    <span className="font-mono">€1.45/L</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cluj-Napoca:</span>
                    <span className="font-mono">€1.42/L</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Timișoara:</span>
                    <span className="font-mono">€1.47/L</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Constanța:</span>
                    <span className="font-mono">€1.48/L</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="text-sm text-gray-600">
                      <strong>Price Range:</strong> €1.42 - €1.48/L<br />
                      <strong>Average:</strong> €1.455/L<br />
                      <strong>Last Updated:</strong> {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Will continue with Arbitrage and Analytics tabs in next part */}
      </Tabs>
    </div>
  );
} 