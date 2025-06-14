'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  Users, 
  ShoppingCart, 
  Activity, 
  TrendingUp, 
  Zap, 
  TreePine,
  Target,
  Sparkles,
  Heart,
  Cpu,
  Network,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  MapPin,
  Fuel,
  Navigation,
  DollarSign,
  Eye,
  Star,
  Shield,
  Wifi,
  Globe,
  Brain,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import DigitalScreen from '@/components/digital-screen';
import MetricCard from '@/components/metric-card';

interface FleetMindDashboardMetrics {
  // AI Marketplace
  totalAgents: number;
  activeAgents: number;
  marketplaceRevenue: number;
  agentPerformance: number;
  customAgents: number;
  connectedAPIs: number;
  
  // Fleet Management
  totalVehicles: number;
  activeVehicles: number;
  fleetEfficiency: number;
  fuelSavings: number;
  optimizedRoutes: number;
  realTimeTracking: number;
  
  // Analytics & Insights
  totalRequests: number;
  avgResponseTime: number;
  successRate: number;
  costReduction: number;
  predictiveInsights: number;
  automatedDecisions: number;
  
  // API Integrations
  apiConnections: number;
  dataPoints: number;
  integrationHealth: number;
  clientSatisfaction: number;
}

export default function FleetMindHome() {
  const [metrics, setMetrics] = useState<FleetMindDashboardMetrics>({
    totalAgents: 47,
    activeAgents: 42,
    marketplaceRevenue: 127500,
    agentPerformance: 94.2,
    customAgents: 12,
    connectedAPIs: 23,
    
    totalVehicles: 156,
    activeVehicles: 134,
    fleetEfficiency: 87.3,
    fuelSavings: 31200,
    optimizedRoutes: 89,
    realTimeTracking: 134,
    
    totalRequests: 25847,
    avgResponseTime: 0.8,
    successRate: 98.7,
    costReduction: 42.1,
    predictiveInsights: 187,
    automatedDecisions: 1247,
    
    apiConnections: 23,
    dataPoints: 847532,
    integrationHealth: 96.8,
    clientSatisfaction: 4.8
  });

  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const featuredAgents = [
    { 
      id: 'route-optimizer-pro',
      name: 'RouteOptimizer Pro', 
      rating: 4.9, 
      price: '€299/mo',
      description: 'AI-powered route optimization with ML learning'
    },
    { 
      id: 'fuel-master-ai',
      name: 'FuelMaster AI', 
      rating: 4.8, 
      price: '€199/mo',
      description: 'Complete fuel optimization ecosystem with 3 advanced AI engines',
      systems: [
        {
          name: 'PROMPT 1: Predictive Fuel Consumption AI',
          icon: Brain,
          color: 'purple',
          features: [
            '7-day fuel consumption forecasting with TensorFlow',
            'Weather forecast integration pentru impact predictions',
            'Driver behavior trend analysis cu ML models',
            '95%+ prediction accuracy with neural networks'
          ]
        },
        {
          name: 'PROMPT 2: Dynamic Fuel Pricing Optimizer',
          icon: TrendingUp,
          color: 'green',
          features: [
            'Real-time market price tracking și optimization',
            'Strategic fuel purchasing cu cost predictions',
            'Market trend analysis pentru 15-25% savings',
            'Multi-supplier negotiation cu automated bidding'
          ]
        },
        {
          name: 'PROMPT 3: Micro-Optimization Fuel Engine',
          icon: Zap,
          color: 'yellow',
          features: [
            'Real-time driving behavior analysis cu IoT integration',
            'Immediate coaching feedback pentru fuel efficiency',
            '8-12% improvement prin micro-optimizations',
            'Vehicle-specific algorithms cu 85% accuracy'
          ]
        }
      ]
    },
    { 
      id: 'delivery-predictor',
      name: 'DeliveryPredictor', 
      rating: 4.7, 
      price: '€149/mo',
      description: 'ML-powered delivery time predictions and scheduling'
    }
  ];

  const toggleAgentExpand = (agentId: string) => {
    setExpandedAgent(expandedAgent === agentId ? null : agentId);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        activeAgents: prev.activeAgents + Math.floor(Math.random() * 3 - 1),
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 100),
        dataPoints: prev.dataPoints + Math.floor(Math.random() * 1000)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-6 py-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                FleetMind.ai Dashboard
              </h1>
              <p className="text-slate-400 text-lg">
                Self-Evolving AI Marketplace for Transport Paradise
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-400 border-green-400">
                <Wifi className="w-4 h-4 mr-2" />
                ONLINE
              </Badge>
              <Badge variant="outline" className="text-blue-400 border-blue-400">
                <Globe className="w-4 h-4 mr-2" />
                47 CLIENTS
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <MetricCard
            title="AI Agents"
            value={`${metrics.activeAgents}/${metrics.totalAgents}`}
            subtitle="Active in marketplace"
            icon={Bot}
            trend="up"
            trendValue="+5"
            animate={true}
          />
          <MetricCard
            title="Fleet Vehicles"
            value={`${metrics.activeVehicles}/${metrics.totalVehicles}`}
            subtitle="Currently tracked"
            icon={Truck}
            trend="up"
            trendValue="+12"
            animate={true}
          />
          <MetricCard
            title="API Connections"
            value={metrics.connectedAPIs}
            subtitle="Client integrations"
            icon={Zap}
            trend="up"
            trendValue="+3"
            animate={true}
          />
          <MetricCard
            title="Revenue Today"
            value={`€${(metrics.marketplaceRevenue / 1000).toFixed(0)}K`}
            subtitle="Marketplace earnings"
            icon={DollarSign}
            trend="up"
            trendValue="+23%"
            animate={true}
          />
        </motion.div>

        {/* Main Dashboard Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="marketplace">AI Marketplace</TabsTrigger>
              <TabsTrigger value="fleet">Fleet Management</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="integrations">API Integrations</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                
                {/* AI Performance */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-slate-200">
                      <Bot className="w-5 h-5 mr-2 text-blue-400" />
                      AI Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Success Rate</span>
                      <span className="text-green-400 font-bold">{metrics.successRate}%</span>
                    </div>
                    <Progress value={metrics.successRate} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Response Time</span>
                      <span className="text-blue-400 font-bold">{metrics.avgResponseTime}s</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </CardContent>
                </Card>

                {/* Fleet Status */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-slate-200">
                      <Truck className="w-5 h-5 mr-2 text-green-400" />
                      Fleet Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Efficiency</span>
                      <span className="text-green-400 font-bold">{metrics.fleetEfficiency}%</span>
                    </div>
                    <Progress value={metrics.fleetEfficiency} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Fuel Savings</span>
                      <span className="text-blue-400 font-bold">€{(metrics.fuelSavings / 1000).toFixed(0)}K</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </CardContent>
                </Card>

                {/* Real-time Activity */}
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center text-slate-200">
                      <Activity className="w-5 h-5 mr-2 text-purple-400" />
                      Real-time Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">API Requests</span>
                      <span className="text-green-400">{metrics.totalRequests.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Data Points</span>
                      <span className="text-blue-400">{metrics.dataPoints.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Automated Decisions</span>
                      <span className="text-purple-400">{metrics.automatedDecisions}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/marketplace">
                  <Button variant="outline" className="w-full h-20 flex-col space-y-2">
                    <ShoppingCart className="w-6 h-6" />
                    <span>Browse Marketplace</span>
                  </Button>
                </Link>
                <Link href="/fleet-management">
                  <Button variant="outline" className="w-full h-20 flex-col space-y-2">
                    <MapPin className="w-6 h-6" />
                    <span>Track Fleet</span>
                  </Button>
                </Link>
                <Link href="/analytics">
                  <Button variant="outline" className="w-full h-20 flex-col space-y-2">
                    <BarChart3 className="w-6 h-6" />
                    <span>View Analytics</span>
                  </Button>
                </Link>
                <Link href="/api-integrations">
                  <Button variant="outline" className="w-full h-20 flex-col space-y-2">
                    <Zap className="w-6 h-6" />
                    <span>Manage APIs</span>
                  </Button>
                </Link>
              </div>
            </TabsContent>

            {/* Marketplace Tab */}
            <TabsContent value="marketplace">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-200">Featured Agents</CardTitle>
                    <CardDescription>Top performing AI agents</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {featuredAgents.map((agent, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-200">{agent.name}</p>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="text-sm text-slate-400">{agent.rating}</span>
                          </div>
                        </div>
                        <Badge variant="secondary">{agent.price}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-200">My Agents</CardTitle>
                    <CardDescription>Your connected AI agents</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center py-8">
                      <Bot className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                      <p className="text-slate-400">Connect your first agent</p>
                      <Button className="mt-4" size="sm">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Browse Marketplace
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-200">Revenue Stats</CardTitle>
                    <CardDescription>Marketplace performance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">This Month</span>
                        <span className="text-green-400 font-bold">€{(metrics.marketplaceRevenue / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Growth</span>
                        <span className="text-blue-400 font-bold">+23%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Transactions</span>
                        <span className="text-purple-400 font-bold">1,247</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Fleet Tab */}
            <TabsContent value="fleet">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-200">Live Fleet Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-green-400">{metrics.activeVehicles}</p>
                          <p className="text-sm text-slate-400">Active</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-yellow-400">{metrics.totalVehicles - metrics.activeVehicles}</p>
                          <p className="text-sm text-slate-400">Maintenance</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-blue-400">{metrics.optimizedRoutes}</p>
                          <p className="text-sm text-slate-400">Optimized</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-200">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Fleet Efficiency</span>
                      <span className="text-green-400 font-bold">{metrics.fleetEfficiency}%</span>
                    </div>
                    <Progress value={metrics.fleetEfficiency} />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Cost Reduction</span>
                      <span className="text-blue-400 font-bold">{metrics.costReduction}%</span>
                    </div>
                    <Progress value={metrics.costReduction} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-200">AI Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Predictive Insights</span>
                        <span className="text-green-400 font-bold">{metrics.predictiveInsights}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Auto Decisions</span>
                        <span className="text-blue-400 font-bold">{metrics.automatedDecisions}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Success Rate</span>
                        <span className="text-purple-400 font-bold">{metrics.successRate}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-slate-200">Performance Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                      <p className="text-slate-400">Advanced analytics charts will be displayed here</p>
                      <Button variant="outline" className="mt-4">
                        <Eye className="w-4 h-4 mr-2" />
                        View Detailed Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Integrations Tab */}
            <TabsContent value="integrations">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-200">Connected APIs</CardTitle>
                    <CardDescription>{metrics.connectedAPIs} active integrations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { name: 'Google Maps API', status: 'Connected', health: 98 },
                      { name: 'Weather Service', status: 'Connected', health: 95 },
                      { name: 'Fuel Price API', status: 'Connected', health: 92 }
                    ].map((api, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-200">{api.name}</p>
                          <p className="text-sm text-green-400">{api.status}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-400">Health</p>
                          <p className="font-bold text-green-400">{api.health}%</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-200">Integration Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Overall Health</span>
                      <span className="text-green-400 font-bold">{metrics.integrationHealth}%</span>
                    </div>
                    <Progress value={metrics.integrationHealth} className="h-3" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Client Satisfaction</span>
                      <span className="text-blue-400 font-bold">{metrics.clientSatisfaction}/5.0</span>
                    </div>
                    <Progress value={metrics.clientSatisfaction * 20} className="h-3" />
                    
                    <Button className="w-full mt-4">
                      <Zap className="w-4 h-4 mr-2" />
                      Add New Integration
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
} 
