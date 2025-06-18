'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  ChevronUp,
  ClipboardList,
  Map,
  Settings,
  Database,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
// import MetricCard from '@/components/metric-card';

interface DashboardMetrics {
  totalAgents: number;
  activeAgents: number;
  marketplaceRevenue: number;
  agentPerformance: number;
  totalVehicles: number;
  activeVehicles: number;
  fleetEfficiency: number;
  fuelSavings: number;
  totalRequests: number;
  avgResponseTime: number;
  successRate: number;
  connectedAPIs: number;
}

const dashboardPages = [
  {
    title: 'Fleet Management',
    description: 'Manage your vehicles, drivers, and routes',
    href: '/fleet-management',
    icon: Truck,
    color: 'bg-blue-500',
    stats: '12 Vehicles Active'
  },
  {
    title: 'Marketplace',
    description: 'Find cargo offers and transport opportunities',
    href: '/marketplace',
    icon: ShoppingCart,
    color: 'bg-green-500',
    stats: '45 New Offers'
  },
  {
    title: 'AI Agents',
    description: 'Explore AI-powered transport solutions',
    href: '/ai-agents',
    icon: Bot,
    color: 'bg-purple-500',
    stats: '8 Active Agents'
  },
  {
    title: 'Dispatch Center',
    description: 'Manage active jobs and deliveries',
    href: '/dispatch',
    icon: ClipboardList,
    color: 'bg-orange-500',
    stats: '3 Active Jobs'
  },
  {
    title: 'Free Maps',
    description: 'Route planning and navigation tools',
    href: '/free-maps',
    icon: Map,
    color: 'bg-cyan-500',
    stats: 'GPS Tracking'
  },
  {
    title: 'ML Route Optimizer',
    description: 'AI-powered route optimization',
    href: '/ml-route-optimizer',
    icon: Brain,
    color: 'bg-pink-500',
    stats: '25% Fuel Savings'
  },
  {
    title: 'API Integrations',
    description: 'Connect external services and APIs',
    href: '/api-integrations',
    icon: Network,
    color: 'bg-indigo-500',
    stats: '5 Connected'
  },
  {
    title: 'Settings',
    description: 'Configure your account and preferences',
    href: '/settings',
    icon: Settings,
    color: 'bg-gray-500',
    stats: 'Profile Setup'
  }
];

export default function FleetopiaHome() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalAgents: 8,
    activeAgents: 6,
    marketplaceRevenue: 12750,
    agentPerformance: 94.2,
    totalVehicles: 12,
    activeVehicles: 10,
    fleetEfficiency: 87.3,
    fuelSavings: 3120,
    totalRequests: 2584,
    avgResponseTime: 0.8,
    successRate: 98.7,
    connectedAPIs: 5
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        activeAgents: Math.max(1, prev.activeAgents + Math.floor(Math.random() * 3 - 1)),
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 10),
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
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">AI Agents</p>
                  <p className="text-2xl font-bold text-white">{metrics.activeAgents}/{metrics.totalAgents}</p>
                  <p className="text-xs text-slate-500">Active agents</p>
                </div>
                <Bot className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
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
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">API Connections</p>
                  <p className="text-2xl font-bold text-white">{metrics.connectedAPIs}</p>
                  <p className="text-xs text-slate-500">Integrations</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Success Rate</p>
                  <p className="text-2xl font-bold text-white">{metrics.successRate}%</p>
                  <p className="text-xs text-slate-500">System performance</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Dashboard Pages Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardPages.map((page, index) => (
              <motion.div
                key={page.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link href={page.href}>
                  <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-lg ${page.color} group-hover:scale-110 transition-transform duration-300`}>
                          <page.icon className="w-6 h-6 text-white" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                      <CardTitle className="text-white group-hover:text-blue-400 transition-colors duration-300">
                        {page.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-slate-400 mb-3">
                        {page.description}
                      </CardDescription>
                      <Badge variant="outline" className="text-xs text-slate-300 border-slate-600">
                        {page.stats}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Activity className="w-5 h-5 mr-2 text-green-400" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{metrics.successRate}%</div>
                  <div className="text-sm text-slate-400">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{metrics.avgResponseTime}s</div>
                  <div className="text-sm text-slate-400">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{metrics.totalRequests.toLocaleString()}</div>
                  <div className="text-sm text-slate-400">Total Requests</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}