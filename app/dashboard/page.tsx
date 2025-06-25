'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, Bot, Euro, Fuel, Route, Clock, TrendingUp, Activity } from 'lucide-react';
import MetricCard from '@/components/metric-card';
import DigitalScreen from '@/components/digital-screen';
import { GmailStatusIndicator } from '@/components/gmail-status-indicator';
import { Suspense } from 'react';

interface DashboardData {
  activeVehicles: number;
  aiAgentsOnline: number;
  revenueToday: number;
  fuelEfficiency: number;
  totalTrips: number;
  averageDeliveryTime: number;
  costSavings: number;
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    activeVehicles: 0,
    aiAgentsOnline: 0,
    revenueToday: 0,
    fuelEfficiency: 0,
    totalTrips: 0,
    averageDeliveryTime: 0,
    costSavings: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch real dashboard data
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/dashboard');
        const data = await response.json();
        if (data.success) {
          setDashboardData(data);
        } else {
            throw new Error(data.error || 'Failed to fetch dashboard data');
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Fallback to default values if API fails
        setDashboardData({
          activeVehicles: 0,
          aiAgentsOnline: 0,
          revenueToday: 0,
          fuelEfficiency: 0,
          totalTrips: 0,
          averageDeliveryTime: 0,
          costSavings: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    // Refresh data every 30 seconds for real-time updates
    const updateTimer = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => {
      clearInterval(updateTimer);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-400 matrix-text">Initializing Control Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Fleet Control <span className="text-blue-400">Center</span>
          </h1>
          <p className="text-slate-300">
            Real-time monitoring and control of your entire fleet ecosystem
          </p>
        </motion.div>

        {/* Digital Screen */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <DigitalScreen />
        </motion.div>

        {/* Main Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <MetricCard
            title="Active Vehicles"
            value={dashboardData.activeVehicles}
            subtitle="Currently operational"
            icon={Truck}
            trend="up"
            trendValue="+3"
            animate={true}
          />
          <MetricCard
            title="AI Agents Online"
            value={dashboardData.aiAgentsOnline}
            subtitle="Processing requests"
            icon={Bot}
            trend="neutral"
            animate={true}
          />
          <MetricCard
            title="Revenue Today"
            value={`€${dashboardData.revenueToday.toLocaleString()}`}
            subtitle="Daily earnings"
            icon={Euro}
            trend="up"
            trendValue="+12%"
            animate={true}
          />
          <MetricCard
            title="Fuel Efficiency"
            value={`${dashboardData.fuelEfficiency.toFixed(1)}%`}
            subtitle="Fleet average"
            icon={Fuel}
            trend="up"
            trendValue="+2.3%"
            animate={true}
          />
        </motion.div>

        {/* Secondary Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <MetricCard
            title="Total Trips"
            value={dashboardData.totalTrips}
            subtitle="Completed today"
            icon={Route}
            trend="up"
            trendValue="+47"
            animate={true}
          />
          <MetricCard
            title="Avg Delivery Time"
            value={`${dashboardData.averageDeliveryTime} min`}
            subtitle="Route optimization"
            icon={Clock}
            trend="down"
            trendValue="-8 min"
            animate={true}
          />
          <MetricCard
            title="Cost Savings"
            value={`€${dashboardData.costSavings.toLocaleString()}`}
            subtitle="AI optimization"
            icon={TrendingUp}
            trend="up"
            trendValue="+15%"
            animate={true}
          />
        </motion.div>

        {/* Fleet Status Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Active Operations */}
          <div className="bg-[--card] rounded-lg p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <Activity className="h-6 w-6 text-green-400" />
              <h3 className="text-xl font-semibold text-white">Active Operations</h3>
            </div>
            <div className="space-y-4">
              {[
                { id: 'OP-001', route: 'Berlin → Munich', status: 'In Transit', progress: 67 },
                { id: 'OP-002', route: 'Hamburg → Frankfurt', status: 'Loading', progress: 15 },
                { id: 'OP-003', route: 'Cologne → Stuttgart', status: 'Delivered', progress: 100 },
                { id: 'OP-004', route: 'Dresden → Leipzig', status: 'In Transit', progress: 43 }
              ].map((operation) => (
                <div key={operation.id} className="bg-[--card]/50 border-0 rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white font-mono">{operation.id}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      operation.status === 'Delivered' ? 'bg-green-400/20 text-green-400' :
                      operation.status === 'In Transit' ? 'bg-blue-400/20 text-blue-400' :
                      'bg-yellow-400/20 text-yellow-400'
                    }`}>
                      {operation.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300 mb-2">{operation.route}</div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${operation.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Agent Status */}
          <div className="bg-[--card] rounded-lg p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <Bot className="h-6 w-6 text-green-400" />
              <h3 className="text-xl font-semibold text-white">AI Agent Status</h3>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Fuel Optimizer', status: 'Active', requests: 234, efficiency: 97 },
                { name: 'Route Genius', status: 'Active', requests: 189, efficiency: 94 },
                { name: 'Weather Prophet', status: 'Active', requests: 156, efficiency: 91 },
                { name: 'Maintenance Predictor', status: 'Standby', requests: 67, efficiency: 89 }
              ].map((agent) => (
                <div key={agent.name} className="bg-[--card]/50 border-0 rounded p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">{agent.name}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      agent.status === 'Active' ? 'bg-green-400/20 text-green-400' :
                      'bg-gray-400/20 text-gray-400'
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{agent.requests} requests</span>
                    <span>{agent.efficiency}% efficiency</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Suspense fallback={<div className="h-6 w-24 bg-gray-200 rounded-md animate-pulse" />}>
              <GmailStatusIndicator />
            </Suspense>
          </div>
        </div>

        <div className="text-center py-12 text-muted-foreground">
          <p>Main dashboard content will be displayed here.</p>
          <p className="text-sm">For example: charts, statistics, recent alerts.</p>
        </div>
      </div>
    </div>
  );
}
