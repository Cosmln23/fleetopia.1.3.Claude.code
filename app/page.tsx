'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Activity, 
  TrendingUp, 
  Truck,
  DollarSign,
  Wifi,
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
// import MetricCard from '@/components/metric-card';

interface DashboardMetrics {
  activeVehicles: number;
  totalVehicles: number;
  aiAgentsOnline: number;
  revenueToday: number;
  fuelEfficiency: number;
  totalTrips: number;
  averageDeliveryTime: number;
  costSavings: number;
  aiProcessingRate: number;
  connectedAPIs: number;
}


export default function FleetopiaHome() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeVehicles: 0,
    totalVehicles: 0,
    aiAgentsOnline: 0,
    revenueToday: 0,
    fuelEfficiency: 0,
    totalTrips: 0,
    averageDeliveryTime: 0,
    costSavings: 0,
    aiProcessingRate: 0,
    connectedAPIs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (response.ok) {
          const data = await response.json();
          setMetrics({ ...data, connectedAPIs: 0 }); // Set to 0 until API provides this
        } else {
          setMetrics({
            activeVehicles: 0,
            totalVehicles: 0,
            aiAgentsOnline: 0,
            revenueToday: 0,
            fuelEfficiency: 0,
            totalTrips: 0,
            averageDeliveryTime: 0,
            costSavings: 0,
            aiProcessingRate: 0,
            connectedAPIs: 0,
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setMetrics({
            activeVehicles: 0,
            totalVehicles: 0,
            aiAgentsOnline: 0,
            revenueToday: 0,
            fuelEfficiency: 0,
            totalTrips: 0,
            averageDeliveryTime: 0,
            costSavings: 0,
            aiProcessingRate: 0,
            connectedAPIs: 0,
          });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
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
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white"
              >
                Welcome to
                <span className="block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mt-2">
                  Fleetopia Dashboard
                </span>
              </motion.h1>
              <p className="text-slate-400 text-lg mt-4">
                Your complete transport management platform
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-400 border-green-400">
                <Wifi className="w-4 h-4 mr-2" />
                ONLINE
              </Badge>
              <Badge variant="outline" className="text-blue-400 border-blue-400">
                <Globe className="w-4 h-4 mr-2" />
                ACTIVE
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
          <Card className="bg-[--card] border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">AI Agents</p>
                  <p className="text-2xl font-bold text-white">{metrics.aiAgentsOnline}</p>
                  <p className="text-xs text-slate-500">Online</p>
                </div>
                <Bot className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[--card] border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Fleet Vehicles</p>
                  <p className="text-2xl font-bold text-white">{metrics.activeVehicles}/{metrics.totalVehicles}</p>
                  <p className="text-xs text-slate-500">Currently active</p>
                </div>
                <Truck className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[--card] border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Today's Revenue</p>
                  <p className="text-2xl font-bold text-white">${metrics.revenueToday.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">From {metrics.totalTrips} trips</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[--card] border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Fleet Efficiency</p>
                  <p className="text-2xl font-bold text-white">{metrics.fuelEfficiency}%</p>
                  <p className="text-xs text-slate-500">Vehicle utilization</p>
                </div>
                <TrendingUp className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>


        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8"
        >
          <div className="lg:col-span-3">
            <Card className="bg-[--card] border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Activity className="w-5 h-5 mr-2 text-green-400" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{metrics.fuelEfficiency}%</div>
                    <div className="text-sm text-slate-400">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{metrics.averageDeliveryTime}s</div>
                    <div className="text-sm text-slate-400">Response Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{metrics.totalTrips.toLocaleString()}</div>
                    <div className="text-sm text-slate-400">Total Requests</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* AI Assistant Widget */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-white text-sm">
                  <Bot className="w-4 h-4 mr-2 text-purple-400" />
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Cargo Analyzer</span>
                    <span className="text-green-400">96%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Fuel Predictor</span>
                    <span className="text-green-400">85%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Route Optimizer</span>
                    <span className="text-yellow-400">Training</span>
                  </div>
                  <div className="pt-2 border-t border-slate-700">
                    <p className="text-xs text-slate-400 mb-2">Today: 12 opportunities</p>
                    <Link href="/marketplace">
                      <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-xs h-7">
                        View in Marketplace →
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
