'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  MapPin, 
  Cloud, 
  Navigation, 
  Fuel, 
  AlertTriangle,
  Truck,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Zap,
  Eye,
  BarChart3,
  DollarSign,
  Target,
  Brain,
  Download,
  Calendar,
  Users,
  Award,
  CheckCircle,
  Bell
} from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { DialogFooter } from '@/components/ui/dialog';

// Dynamic imports for Leaflet components (client-side only)
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });

// Custom marker icons
const createCustomIcon = (status: string) => {
  const color = status === 'active' ? '#22c55e' :
                status === 'idle' ? '#eab308' :
                status === 'maintenance' ? '#ef4444' : '#6b7280';

  if (typeof window !== 'undefined') {
    const L = require('leaflet');
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
            <path d="M15 18H9"/>
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>  
            <circle cx="17" cy="18" r="2"/>
            <circle cx="7" cy="18" r="2"/>
          </svg>
        </div>
      `,
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });
  }
  return null;
};

interface RealTimeData {
  vehicleTracking: any[];
  weatherAlerts: any[];
  trafficIncidents: any[];
  fuelPrices: any[];
  systemAlerts: any[];
}

interface LiveMetrics {
  activeVehicles: number;
  ongoingTrips: number;
  fuelEfficiency: number;
  averageSpeed: number;
  alertsCount: number;
  complianceStatus: number;
}

interface AnalyticsData {
  performance: {
    fleetEfficiency: number;
    fuelSavings: number;
    timeOptimization: number;
    costReduction: number;
    customerSatisfaction: number;
  };
  predictions: {
    nextWeekSavings: number;
    maintenanceAlerts: number;
    routeOptimizations: number;
    efficiency: number;
  };
  trends: {
    dailyRequests: number[];
    weeklyRevenue: number[];
    monthlyGrowth: number;
    userRetention: number;
  };
  insights: {
    topAgent: string;
    bestRoute: string;
    peakHours: string;
    recommendations: string[];
  };
}

interface IntegrationStatus {
  freight: boolean;
  gps: boolean;
  mapping: boolean;
  weather: boolean;
  traffic: boolean;
  communication: boolean;
  fuel: boolean;
  compliance: boolean;
  maintenance: boolean;
  financial: boolean;
}

export default function RealTimeAnalyticsPage() {
  const [realTimeData, setRealTimeData] = useState<RealTimeData>({
    vehicleTracking: [],
    weatherAlerts: [],
    trafficIncidents: [],
    fuelPrices: [],
    systemAlerts: []
  });
  
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({
    activeVehicles: 134,
    ongoingTrips: 89,
    fuelEfficiency: 87.3,
    averageSpeed: 65,
    alertsCount: 3,
    complianceStatus: 96
  });

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    performance: {
      fleetEfficiency: 87.3,
      fuelSavings: 31200,
      timeOptimization: 23.4,
      costReduction: 42.1,
      customerSatisfaction: 4.8
    },
    predictions: {
      nextWeekSavings: 8450,
      maintenanceAlerts: 3,
      routeOptimizations: 12,
      efficiency: 91.2
    },
    trends: {
      dailyRequests: [1200, 1350, 1180, 1420, 1560, 1340, 1280],
      weeklyRevenue: [23400, 25600, 28100, 26800],
      monthlyGrowth: 18.7,
      userRetention: 94.2
    },
    insights: {
      topAgent: 'RouteOptimizer Pro',
      bestRoute: 'Berlin → Munich',
      peakHours: '08:00 - 10:00',
      recommendations: [
        'Optimize fuel consumption for Route #34',
        'Schedule maintenance for Vehicle FL-234-AB',
        'Update route planning for rush hour traffic',
        'Implement driver training program'
      ]
    }
  });
  
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>({
    freight: true,
    gps: true,
    mapping: true,
    weather: true,
    traffic: true,
    communication: false,
    fuel: true,
    compliance: true,
    maintenance: false,
    financial: true
  });

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [activeTab, setActiveTab] = useState('realtime');
  const [offerToEdit, setOfferToEdit] = useState<any>(null);
  const [editing, setEditing] = useState(false);

  // Mock vehicle data
  const vehicleData = [
    { id: 'V001', status: 'active', lat: 44.4268, lng: 26.1025, driver: 'Ion Popescu', route: 'Bucharest → Constanta' },
    { id: 'V002', status: 'idle', lat: 45.7489, lng: 21.2087, driver: 'Maria Georgescu', route: 'Timisoara → Arad' },
    { id: 'V003', status: 'active', lat: 46.7712, lng: 23.6236, driver: 'Andrei Moldovan', route: 'Cluj → Oradea' },
    { id: 'V004', status: 'maintenance', lat: 47.1585, lng: 27.6014, driver: 'Elena Vasilescu', route: 'Iasi → Bacau' }
  ];

  useEffect(() => {
    // Set up real-time updates every 10 seconds
    const interval = setInterval(() => {
      fetchRealTimeData(true);
      updateAnalytics();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchRealTimeData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    
    try {
      // Simulate API call with mock data
      const mockData = {
        vehicleTracking: vehicleData,
        weatherAlerts: [
          { id: 1, type: 'warning', message: 'Fog expected on A1 highway', severity: 'medium' },
          { id: 2, type: 'info', message: 'Good weather conditions', severity: 'low' }
        ],
        trafficIncidents: [
          { id: 1, location: 'A2 km 45', description: 'Minor accident, expect delays', severity: 'high' }
        ],
        fuelPrices: [
          { station: 'Petrom', price: 6.45, location: 'Bucharest' },
          { station: 'OMV', price: 6.52, location: 'Cluj-Napoca' }
        ],
        systemAlerts: [
          { id: 1, type: 'maintenance', message: 'Vehicle V002 needs inspection', priority: 'high' }
        ]
      };
      
      setRealTimeData(mockData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch real-time data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateAnalytics = () => {
    setAnalyticsData(prev => ({
      ...prev,
      performance: {
        ...prev.performance,
        fleetEfficiency: Math.max(80, Math.min(95, prev.performance.fleetEfficiency + (Math.random() - 0.5) * 2)),
        customerSatisfaction: Math.min(5, Math.max(4, prev.performance.customerSatisfaction + (Math.random() - 0.5) * 0.2))
      }
    }));
  };

  const handleVehicleClick = (vehicle: any) => {
    setSelectedVehicle(vehicle);
  };

  const MetricCard = ({ 
    icon: Icon, 
    title, 
    value, 
    unit, 
    color, 
    trend, 
    description,
    onClick 
  }: any) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={onClick ? 'cursor-pointer' : ''}
    >
      <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            {trend !== undefined && (
              <div className={`flex items-center space-x-1 ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="text-sm font-medium">{Math.abs(trend)}%</span>
              </div>
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-slate-400">{title}</h3>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-bold text-white">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </span>
              {unit && <span className="text-sm text-slate-400">{unit}</span>}
            </div>
            {description && (
              <p className="text-xs text-slate-400">{description}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const AlertCard = ({ alert, type }: { alert: any, type: string }) => {
    const getAlertIcon = () => {
      switch (type) {
        case 'weather': return <Cloud className="w-4 h-4" />;
        case 'traffic': return <AlertTriangle className="w-4 h-4" />;
        case 'system': return <Zap className="w-4 h-4" />;
        default: return <AlertTriangle className="w-4 h-4" />;
      }
    };

    const getAlertColor = (severity: string) => {
      switch (severity) {
        case 'high': return 'border-red-500 bg-red-500/10 text-red-400';
        case 'medium': return 'border-yellow-500 bg-yellow-500/10 text-yellow-400';
        case 'low': return 'border-blue-500 bg-blue-500/10 text-blue-400';
        default: return 'border-gray-500 bg-gray-500/10 text-gray-400';
      }
    };

    return (
      <Card className={`border ${getAlertColor(alert.severity)}`}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="mt-1">{getAlertIcon()}</div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{alert.message || alert.description}</p>
              {alert.location && (
                <p className="text-xs text-slate-400 mt-1">{alert.location}</p>
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              {alert.severity}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  const IntegrationStatusCard = () => (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Zap className="w-5 h-5 mr-2 text-blue-400" />
          System Integration Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(integrationStatus).map(([key, status]) => (
            <div key={key} className="flex items-center justify-between p-2 rounded bg-slate-700/50">
              <span className="text-sm text-slate-300 capitalize">{key.replace('_', ' ')}</span>
              <div className={`w-2 h-2 rounded-full ${status ? 'bg-green-400' : 'bg-red-400'}`} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!offerToEdit) return;
    const { name, value } = e.target;
    const updatedOffer = { ...offerToEdit, [name]: value };
    // Format dates correctly if they are being changed
    if (name === 'loadingDate' || name === 'deliveryDate') {
        updatedOffer[name] = new Date(value).toISOString().split('T')[0];
    }
    setOfferToEdit(updatedOffer);
  };

  const handleUpdateCargo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerToEdit) return;
    setEditing(true);

    // Prepare data for submission, ensuring correct types
    const submissionData = {
        ...offerToEdit,
        weight: parseFloat(offerToEdit.weight as any),
        price: parseFloat(offerToEdit.price as any),
    };

    try {
        const response = await fetch(`/api/marketplace/cargo/${offerToEdit.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submissionData),
        });

        if (!response.ok) {
            throw new Error('Failed to update cargo offer');
        }

        toast({
            title: "Success!",
            description: "Cargo offer has been updated.",
        });

        fetchCargoOffers(); // Refresh the list
    } catch (error) {
        console.error(error);
        toast({
            title: "Error",
            description: "Could not update the cargo offer.",
            variant: "destructive",
        });
    } finally {
        setEditing(false);
        setOfferToEdit(null); // Close the dialog
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
                Real-time Data & Analytics
              </h1>
              <p className="text-slate-400 text-lg">
                Live monitoring, alerts and AI-powered performance insights
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
              <Button 
                onClick={() => fetchRealTimeData(true)} 
                disabled={refreshing}
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="realtime" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Activity className="w-4 h-4 mr-2" />
              Real-time Data
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics & Insights
            </TabsTrigger>
            <TabsTrigger value="predictions" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Brain className="w-4 h-4 mr-2" />
              AI Predictions
            </TabsTrigger>
          </TabsList>

          {/* Real-time Data Tab */}
          <TabsContent value="realtime" className="mt-6">
            {/* Live Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"
            >
              <MetricCard
                icon={Truck}
                title="Active Vehicles"
                value={liveMetrics.activeVehicles}
                color="bg-blue-500"
                trend={2.3}
              />
              <MetricCard
                icon={Navigation}
                title="Ongoing Trips"
                value={liveMetrics.ongoingTrips}
                color="bg-green-500"
                trend={1.8}
              />
              <MetricCard
                icon={Fuel}
                title="Fuel Efficiency"
                value={liveMetrics.fuelEfficiency.toFixed(1)}
                unit="%"
                color="bg-yellow-500"
                trend={-0.5}
              />
              <MetricCard
                icon={Clock}
                title="Avg Speed"
                value={liveMetrics.averageSpeed}
                unit="km/h"
                color="bg-purple-500"
                trend={3.2}
              />
              <MetricCard
                icon={AlertTriangle}
                title="Active Alerts"
                value={liveMetrics.alertsCount}
                color="bg-red-500"
                trend={-12.5}
              />
              <MetricCard
                icon={CheckCircle}
                title="Compliance"
                value={liveMetrics.complianceStatus}
                unit="%"
                color="bg-emerald-500"
                trend={0.8}
              />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map and Vehicle Tracking */}
              <div className="lg:col-span-2">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-blue-400" />
                      Live Vehicle Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 bg-slate-700 rounded-lg flex items-center justify-center">
                      <div className="text-center text-slate-400">
                        <MapPin className="w-12 h-12 mx-auto mb-4" />
                        <p>Interactive Map</p>
                        <p className="text-sm">Showing {vehicleData.length} vehicles</p>
                      </div>
                    </div>
                    
                    {/* Vehicle List */}
                    <div className="mt-4 space-y-2">
                      {vehicleData.map((vehicle) => (
                        <div 
                          key={vehicle.id}
                          className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700"
                          onClick={() => handleVehicleClick(vehicle)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              vehicle.status === 'active' ? 'bg-green-400' :
                              vehicle.status === 'idle' ? 'bg-yellow-400' :
                              'bg-red-400'
                            }`} />
                            <div>
                              <p className="text-sm font-medium text-white">{vehicle.id}</p>
                              <p className="text-xs text-slate-400">{vehicle.driver}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-300">{vehicle.route}</p>
                            <Badge variant="outline" className="text-xs">
                              {vehicle.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Alerts and Integration Status */}
              <div className="space-y-6">
                <IntegrationStatusCard />
                
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                      Live Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {realTimeData.weatherAlerts?.map((alert) => (
                        <AlertCard key={alert.id} alert={alert} type="weather" />
                      ))}
                      {realTimeData.trafficIncidents?.map((alert) => (
                        <AlertCard key={alert.id} alert={alert} type="traffic" />
                      ))}
                      {realTimeData.systemAlerts?.map((alert) => (
                        <AlertCard key={alert.id} alert={alert} type="system" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            {/* Analytics Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Button
                  variant={selectedTimeframe === 'day' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeframe('day')}
                >
                  Day
                </Button>
                <Button
                  variant={selectedTimeframe === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeframe('week')}
                >
                  Week
                </Button>
                <Button
                  variant={selectedTimeframe === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeframe('month')}
                >
                  Month
                </Button>
              </div>
            </div>

            {/* Performance Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8"
            >
              <MetricCard
                icon={Target}
                title="Fleet Efficiency"
                value={analyticsData.performance.fleetEfficiency.toFixed(1)}
                unit="%"
                trend={2.4}
                color="bg-blue-500"
                description="Overall fleet performance"
              />
              <MetricCard
                icon={DollarSign}
                title="Fuel Savings"
                value={analyticsData.performance.fuelSavings}
                unit="€"
                trend={15.3}
                color="bg-green-500"
                description="Monthly savings"
              />
              <MetricCard
                icon={Clock}
                title="Time Optimization"
                value={analyticsData.performance.timeOptimization.toFixed(1)}
                unit="%"
                trend={5.7}
                color="bg-purple-500"
                description="Route efficiency gain"
              />
              <MetricCard
                icon={TrendingDown}
                title="Cost Reduction"
                value={analyticsData.performance.costReduction.toFixed(1)}
                unit="%"
                trend={8.2}
                color="bg-red-500"
                description="Operational cost savings"
              />
              <MetricCard
                icon={Award}
                title="Satisfaction"
                value={analyticsData.performance.customerSatisfaction.toFixed(1)}
                unit="/5"
                trend={3.1}
                color="bg-yellow-500"
                description="Customer rating"
              />
            </motion.div>

            {/* Trends and Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                    Performance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Daily Requests Growth</span>
                        <span className="text-green-400">+{analyticsData.trends.monthlyGrowth}%</span>
                      </div>
                      <Progress value={analyticsData.trends.monthlyGrowth} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">User Retention</span>
                        <span className="text-blue-400">{analyticsData.trends.userRetention}%</span>
                      </div>
                      <Progress value={analyticsData.trends.userRetention} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Fleet Efficiency</span>
                        <span className="text-purple-400">{analyticsData.performance.fleetEfficiency.toFixed(1)}%</span>
                      </div>
                      <Progress value={analyticsData.performance.fleetEfficiency} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-green-400" />
                    AI Insights & Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-sm text-blue-400 font-medium">Top Performing Agent</p>
                      <p className="text-white">{analyticsData.insights.topAgent}</p>
                    </div>
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-sm text-green-400 font-medium">Best Route</p>
                      <p className="text-white">{analyticsData.insights.bestRoute}</p>
                    </div>
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <p className="text-sm text-purple-400 font-medium">Peak Hours</p>
                      <p className="text-white">{analyticsData.insights.peakHours}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card className="bg-slate-800/50 border-slate-700 mt-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="w-5 h-5 mr-2 text-yellow-400" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analyticsData.insights.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-slate-700/30 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-slate-300">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>Notifications from other system modules.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {realTimeData.systemAlerts?.map(alert => (
                  <div key={alert.id} className="p-3 rounded-lg bg-slate-900/70 flex items-start space-x-3">
                    <div className="flex-shrink-0 pt-1">
                      {alert.type === 'urgent' ? <AlertTriangle className="w-5 h-5 text-red-400"/> : <Bell className="w-5 h-5 text-blue-400"/>}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{alert.message}</p>
                      <p className="text-xs text-slate-500">{new Date(alert.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Predictions Tab */}
          <TabsContent value="predictions" className="mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              <MetricCard
                icon={DollarSign}
                title="Next Week Savings"
                value={analyticsData.predictions.nextWeekSavings}
                unit="€"
                color="bg-green-500"
                description="Predicted fuel & route savings"
              />
              <MetricCard
                icon={AlertTriangle}
                title="Maintenance Alerts"
                value={analyticsData.predictions.maintenanceAlerts}
                color="bg-red-500"
                description="Predicted maintenance needs"
              />
              <MetricCard
                icon={Navigation}
                title="Route Optimizations"
                value={analyticsData.predictions.routeOptimizations}
                color="bg-blue-500"
                description="Routes to be optimized"
              />
              <MetricCard
                icon={TrendingUp}
                title="Efficiency Improvement"
                value={analyticsData.predictions.efficiency.toFixed(1)}
                unit="%"
                color="bg-purple-500"
                description="Predicted efficiency gain"
              />
            </motion.div>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-blue-400" />
                  AI Predictive Analytics
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Machine learning predictions based on historical data and current trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Brain className="w-16 h-16 mx-auto text-blue-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">AI Predictions Dashboard</h3>
                  <p className="text-slate-400 mb-6">Advanced predictive analytics will be displayed here</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div className="p-4 bg-slate-700/30 rounded-lg">
                      <h4 className="font-medium text-white mb-2">Fuel Optimization</h4>
                      <p className="text-sm text-slate-400">AI predicts 12% fuel savings in next 30 days through route optimization</p>
                    </div>
                    <div className="p-4 bg-slate-700/30 rounded-lg">
                      <h4 className="font-medium text-white mb-2">Maintenance Forecasting</h4>
                      <p className="text-sm text-slate-400">3 vehicles scheduled for predictive maintenance based on usage patterns</p>
                    </div>
                    <div className="p-4 bg-slate-700/30 rounded-lg">
                      <h4 className="font-medium text-white mb-2">Demand Prediction</h4>
                      <p className="text-sm text-slate-400">Peak demand expected Thu-Fri, optimize fleet allocation accordingly</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={!!offerToEdit} onOpenChange={() => setOfferToEdit(null)}>
          <DialogContent className="sm:max-w-[625px] bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Edit Cargo Offer</DialogTitle>
              <DialogDescription>
                Make changes to your cargo offer here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            {offerToEdit && (
              <form onSubmit={handleUpdateCargo} className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                      <Input name="title" value={offerToEdit.title} onChange={handleEditInputChange} placeholder="Offer Title" required className="bg-slate-700 border-slate-600"/>
                      <Input name="companyName" value={offerToEdit.companyName} onChange={handleEditInputChange} placeholder="Company Name" className="bg-slate-700 border-slate-600"/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input name="fromLocation" value={offerToEdit.fromLocation} onChange={handleEditInputChange} placeholder="From" required className="bg-slate-700 border-slate-600"/>
                    <Input name="toLocation" value={offerToEdit.toLocation} onChange={handleEditInputChange} placeholder="To" required className="bg-slate-700 border-slate-600"/>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Input name="weight" type="number" value={offerToEdit.weight} onChange={handleEditInputChange} placeholder="Weight (kg)" required className="bg-slate-700 border-slate-600"/>
                    <Input name="price" type="number" value={offerToEdit.price} onChange={handleEditInputChange} placeholder="Price (€)" required className="bg-slate-700 border-slate-600"/>
                    <select name="urgency" value={offerToEdit.urgency} onChange={handleEditInputChange} className="bg-slate-700 border-slate-600 rounded-md p-2 w-full">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setOfferToEdit(null)}>Cancel</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={editing}>
                      {editing ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 