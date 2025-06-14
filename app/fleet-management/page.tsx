'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Truck, 
  MapPin, 
  Navigation, 
  Fuel, 
  Clock, 
  Route,
  AlertTriangle,
  CheckCircle,
  Activity,
  TrendingUp,
  Users,
  Settings,
  Eye,
  Zap
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Vehicle {
  id: string;
  license: string;
  driver: string;
  status: 'active' | 'idle' | 'maintenance' | 'offline';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  route: {
    origin: string;
    destination: string;
    progress: number;
    eta: string;
  };
  fuel: {
    level: number;
    efficiency: number;
    cost: number;
  };
  performance: {
    speed: number;
    distance: number;
    duration: string;
  };
}

export default function FleetManagementPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: 'VH-001',
      license: 'FL-234-AB',
      driver: 'Johann Schmidt',
      status: 'active',
      location: {
        lat: 52.5200,
        lng: 13.4050,
        address: 'Berlin, Alexanderplatz'
      },
      route: {
        origin: 'Berlin',
        destination: 'Munich',
        progress: 67,
        eta: '14:30'
      },
      fuel: {
        level: 78,
        efficiency: 12.4,
        cost: 145.20
      },
      performance: {
        speed: 85,
        distance: 342,
        duration: '4h 15m'
      }
    },
    {
      id: 'VH-002',
      license: 'FL-567-CD',
      driver: 'Maria Müller',
      status: 'idle',
      location: {
        lat: 48.1351,
        lng: 11.5820,
        address: 'Munich, Central Station'
      },
      route: {
        origin: 'Munich',
        destination: 'Frankfurt',
        progress: 0,
        eta: '16:45'
      },
      fuel: {
        level: 92,
        efficiency: 11.8,
        cost: 89.50
      },
      performance: {
        speed: 0,
        distance: 0,
        duration: '0h 0m'
      }
    },
    {
      id: 'VH-003',
      license: 'FL-890-EF',
      driver: 'Klaus Weber',
      status: 'active',
      location: {
        lat: 50.1109,
        lng: 8.6821,
        address: 'Frankfurt, Airport'
      },
      route: {
        origin: 'Frankfurt',
        destination: 'Hamburg',
        progress: 23,
        eta: '18:15'
      },
      fuel: {
        level: 45,
        efficiency: 13.2,
        cost: 98.75
      },
      performance: {
        speed: 75,
        distance: 127,
        duration: '1h 45m'
      }
    },
    {
      id: 'VH-004',
      license: 'FL-123-GH',
      driver: 'Anna Fischer',
      status: 'maintenance',
      location: {
        lat: 53.5511,
        lng: 9.9937,
        address: 'Hamburg, Service Center'
      },
      route: {
        origin: 'Hamburg',
        destination: 'Service',
        progress: 100,
        eta: 'N/A'
      },
      fuel: {
        level: 25,
        efficiency: 0,
        cost: 45.30
      },
      performance: {
        speed: 0,
        distance: 0,
        duration: '0h 0m'
      }
    }
  ]);

  const [fleetStats, setFleetStats] = useState({
    totalVehicles: 156,
    activeVehicles: 134,
    totalDrivers: 189,
    availableDrivers: 45,
    totalRoutes: 89,
    completedToday: 67,
    fuelEfficiency: 87.3,
    onTimeDelivery: 94.2
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(vehicle => {
        if (vehicle.status === 'active') {
          const newProgress = Math.min(vehicle.route.progress + Math.random() * 5, 100);
          return {
            ...vehicle,
            route: {
              ...vehicle.route,
              progress: newProgress
            },
            fuel: {
              ...vehicle.fuel,
              level: Math.max(vehicle.fuel.level - Math.random() * 2, 0)
            },
            performance: {
              ...vehicle.performance,
              speed: 70 + Math.random() * 30,
              distance: vehicle.performance.distance + Math.random() * 10
            }
          };
        }
        return vehicle;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'maintenance': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'In Transit';
      case 'idle': return 'Available';
      case 'maintenance': return 'Maintenance';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

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
                Fleet Management
              </h1>
              <p className="text-slate-400 text-lg">
                Real-time tracking and optimization of your entire fleet
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-400 border-green-400">
                <Activity className="w-4 h-4 mr-2" />
                {fleetStats.activeVehicles} Active
              </Badge>
              <Button>
                <Eye className="w-4 h-4 mr-2" />
                Live Map View
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Fleet Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Vehicles</p>
                  <p className="text-2xl font-bold text-white">{fleetStats.totalVehicles}</p>
                  <p className="text-xs text-green-400">+12 this month</p>
                </div>
                <Truck className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Active Now</p>
                  <p className="text-2xl font-bold text-green-400">{fleetStats.activeVehicles}</p>
                  <p className="text-xs text-blue-400">{((fleetStats.activeVehicles / fleetStats.totalVehicles) * 100).toFixed(1)}% utilization</p>
                </div>
                <Activity className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Fuel Efficiency</p>
                  <p className="text-2xl font-bold text-yellow-400">{fleetStats.fuelEfficiency}%</p>
                  <p className="text-xs text-green-400">+2.3% this week</p>
                </div>
                <Fuel className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">On-Time Delivery</p>
                  <p className="text-2xl font-bold text-purple-400">{fleetStats.onTimeDelivery}%</p>
                  <p className="text-xs text-green-400">+1.2% improvement</p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="live-tracking" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="live-tracking">Live Tracking</TabsTrigger>
              <TabsTrigger value="routes">Route Optimization</TabsTrigger>
              <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>

            {/* Live Tracking Tab */}
            <TabsContent value="live-tracking" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Vehicle List */}
                <div className="lg:col-span-2">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-slate-200">Vehicle Status</CardTitle>
                      <CardDescription>Real-time fleet monitoring</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {vehicles.map((vehicle) => (
                        <motion.div
                          key={vehicle.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-4 bg-slate-700/50 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <Truck className="w-6 h-6 text-blue-400" />
                                <div className={`absolute -top-1 -right-1 w-3 h-3 ${getStatusColor(vehicle.status)} rounded-full border-2 border-slate-700`}></div>
                              </div>
                              <div>
                                <p className="font-medium text-white">{vehicle.license}</p>
                                <p className="text-sm text-slate-400">{vehicle.driver}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className={`text-xs ${
                              vehicle.status === 'active' ? 'text-green-400 border-green-400' :
                              vehicle.status === 'idle' ? 'text-yellow-400 border-yellow-400' :
                              vehicle.status === 'maintenance' ? 'text-red-400 border-red-400' :
                              'text-gray-400 border-gray-400'
                            }`}>
                              {getStatusText(vehicle.status)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-slate-400">Location</p>
                              <p className="text-white truncate">{vehicle.location.address}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Fuel Level</p>
                              <div className="flex items-center space-x-2">
                                <Progress value={vehicle.fuel.level} className="h-2 flex-1" />
                                <span className="text-white font-medium">{vehicle.fuel.level.toFixed(0)}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-slate-400">Route Progress</p>
                              <div className="flex items-center space-x-2">
                                <Progress value={vehicle.route.progress} className="h-2 flex-1" />
                                <span className="text-white font-medium">{vehicle.route.progress.toFixed(0)}%</span>
                              </div>
                            </div>
                          </div>
                          
                          {vehicle.status === 'active' && (
                            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                              <span>{vehicle.route.origin} → {vehicle.route.destination}</span>
                              <span>ETA: {vehicle.route.eta}</span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions & Alerts */}
                <div className="space-y-6">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-slate-200">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full justify-start">
                        <MapPin className="w-4 h-4 mr-2" />
                        Add New Route
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Navigation className="w-4 h-4 mr-2" />
                        Optimize Routes
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        Assign Driver
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                        Fleet Settings
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="flex items-center text-slate-200">
                        <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
                        Active Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <p className="text-sm font-medium text-yellow-400">Low Fuel Warning</p>
                        <p className="text-xs text-slate-400">VH-003 fuel level below 50%</p>
                      </div>
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-sm font-medium text-blue-400">Route Optimization</p>
                        <p className="text-xs text-slate-400">3 routes can be optimized</p>
                      </div>
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-sm font-medium text-green-400">Delivery Complete</p>
                        <p className="text-xs text-slate-400">VH-001 arrived 15 min early</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Routes Tab */}
            <TabsContent value="routes">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-200">Route Optimization</CardTitle>
                  <CardDescription>AI-powered route planning and optimization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-16">
                    <Route className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-300 mb-2">Route Optimization Engine</h3>
                    <p className="text-slate-400 mb-6">
                      Advanced AI algorithms optimize routes for fuel efficiency and delivery times
                    </p>
                    <Button>
                      <Zap className="w-4 h-4 mr-2" />
                      Start Optimization
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-200">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Fleet Utilization</span>
                      <span className="text-green-400 font-bold">85.9%</span>
                    </div>
                    <Progress value={85.9} className="h-3" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Average Speed</span>
                      <span className="text-blue-400 font-bold">67 km/h</span>
                    </div>
                    <Progress value={67} className="h-3" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Customer Satisfaction</span>
                      <span className="text-purple-400 font-bold">4.8/5.0</span>
                    </div>
                    <Progress value={96} className="h-3" />
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-200">Cost Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-400">€2,340</p>
                        <p className="text-sm text-slate-400">Fuel Savings</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-400">€1,890</p>
                        <p className="text-sm text-slate-400">Route Optimization</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-400">€945</p>
                        <p className="text-sm text-slate-400">Maintenance Savings</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-400">€5,175</p>
                        <p className="text-sm text-slate-400">Total Savings</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Maintenance Tab */}
            <TabsContent value="maintenance">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-200">Maintenance Schedule</CardTitle>
                  <CardDescription>Predictive maintenance and service planning</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-16">
                    <Settings className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-300 mb-2">Maintenance Dashboard</h3>
                    <p className="text-slate-400 mb-6">
                      AI-powered predictive maintenance keeps your fleet running smoothly
                    </p>
                    <Button variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View Maintenance Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
