'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, Play, Pause, Settings, TrendingUp, Zap, Activity, AlertCircle,
  Crown, Shield, Cpu, Target, Truck, CloudRain, Wrench, Package, 
  FileCheck, Calculator, Users, DollarSign, Clock, MapPin, Navigation,
  Phone, MessageSquare, Calendar, Bell, CheckCircle, ArrowRight,
  BarChart3, Route, Fuel, Eye, Headphones, Radio, Monitor,
  AlertTriangle, RefreshCw, Send, Map, Layers, Timer, Award
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import MetricCard from '@/components/metric-card';

interface DispatcherAgent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'maintenance' | 'busy';
  performance: number;
  totalDispatched: number;
  activeOperations: number;
  successRate: number;
  avgResponseTime: number;
  description: string;
  version: string;
  capabilities: string[];
  isActive: boolean;
  lastOperation: string;
  currentTasks: string[];
}

interface ActiveOperation {
  id: string;
  type: 'route_optimization' | 'emergency_dispatch' | 'fleet_monitoring' | 'driver_communication';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  assignedVehicles: string[];
  estimatedCompletion: string;
  startTime: string;
}

interface SystemConnection {
  system: string;
  status: 'connected' | 'disconnected' | 'syncing';
  lastSync: string;
  dataPoints: number;
  icon: any;
}

export default function DispatcherAIPage() {
  const [agent, setAgent] = useState<DispatcherAgent>({
    id: 'dispatch-ai-001',
    name: 'FleetMind Dispatcher AI',
    type: 'intelligent-dispatcher',
    status: 'active',
    performance: 96.8,
    totalDispatched: 15847,
    activeOperations: 23,
    successRate: 98.2,
    avgResponseTime: 0.3,
    description: 'Advanced AI Dispatcher with real-time fleet management, route optimization, and intelligent decision-making capabilities',
    version: '4.1.2',
    capabilities: [
      'Real-time Route Optimization',
      'Emergency Response Coordination',
      'Multi-fleet Management',
      'Driver Communication Hub',
      'Predictive Maintenance Alerts',
      'Cost Optimization Analysis',
      'Traffic & Weather Integration',
      'Compliance Monitoring',
      'Performance Analytics',
      'Automated Scheduling'
    ],
    isActive: true,
    lastOperation: 'Optimized Route BUC-CTG-001 - 12% fuel savings',
    currentTasks: [
      'Monitoring 23 active vehicles',
      'Processing 7 route optimizations',
      'Handling 3 emergency dispatches',
      'Coordinating driver breaks schedule'
    ]
  });

  const [activeOperations, setActiveOperations] = useState<ActiveOperation[]>([
    {
      id: 'OP-001',
      type: 'route_optimization',
      description: 'Optimizing delivery route for 5 vehicles in Bucharest area',
      priority: 'high',
      status: 'in_progress',
      progress: 78,
      assignedVehicles: ['V-001', 'V-004', 'V-007', 'V-012', 'V-018'],
      estimatedCompletion: '14:32',
      startTime: '13:45'
    },
    {
      id: 'OP-002',
      type: 'emergency_dispatch',
      description: 'Emergency replacement vehicle for broken truck on A2 highway',
      priority: 'urgent',
      status: 'in_progress',
      progress: 45,
      assignedVehicles: ['V-023'],
      estimatedCompletion: '15:15',
      startTime: '14:02'
    },
    {
      id: 'OP-003',
      type: 'fleet_monitoring',
      description: 'Real-time monitoring and optimization of 23 active vehicles',
      priority: 'medium',
      status: 'in_progress',
      progress: 92,
      assignedVehicles: ['All Active'],
      estimatedCompletion: 'Continuous',
      startTime: '00:00'
    },
    {
      id: 'OP-004',
      type: 'driver_communication',
      description: 'Coordinating break schedules for 8 drivers due for mandatory rest',
      priority: 'medium',
      status: 'pending',
      progress: 15,
      assignedVehicles: ['V-003', 'V-009', 'V-014', 'V-019'],
      estimatedCompletion: '16:00',
      startTime: '14:30'
    }
  ]);

  const [systemConnections, setSystemConnections] = useState<SystemConnection[]>([
    { system: 'Real-time Tracking', status: 'connected', lastSync: '14:32:15', dataPoints: 1247, icon: MapPin },
    { system: 'Marketplace Integration', status: 'connected', lastSync: '14:31:58', dataPoints: 89, icon: Package },
    { system: 'Fleet Management', status: 'connected', lastSync: '14:32:10', dataPoints: 456, icon: Truck },
    { system: 'Weather API', status: 'connected', lastSync: '14:30:22', dataPoints: 12, icon: CloudRain },
    { system: 'Traffic Data', status: 'syncing', lastSync: '14:29:45', dataPoints: 334, icon: Navigation },
    { system: 'Driver Communication', status: 'connected', lastSync: '14:32:01', dataPoints: 67, icon: MessageSquare },
    { system: 'Analytics Engine', status: 'connected', lastSync: '14:31:30', dataPoints: 892, icon: BarChart3 },
    { system: 'API Integrations', status: 'connected', lastSync: '14:30:55', dataPoints: 234, icon: Zap }
  ]);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      updateOperationsProgress();
      updateSystemConnections();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const updateOperationsProgress = () => {
    setActiveOperations(prev => prev.map(op => ({
      ...op,
      progress: op.status === 'in_progress' ? Math.min(100, op.progress + Math.random() * 5) : op.progress
    })));
  };

  const updateSystemConnections = () => {
    setSystemConnections(prev => prev.map(conn => ({
      ...conn,
      lastSync: new Date().toLocaleTimeString(),
      dataPoints: conn.dataPoints + Math.floor(Math.random() * 10)
    })));
  };

  const toggleAgentStatus = () => {
    setAgent(prev => ({
      ...prev,
      status: prev.status === 'active' ? 'inactive' : 'active',
      isActive: prev.status !== 'active'
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20';
      case 'inactive': return 'text-gray-400 bg-gray-400/20';
      case 'maintenance': return 'text-yellow-400 bg-yellow-400/20';
      case 'busy': return 'text-blue-400 bg-blue-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'route_optimization': return <Route className="w-4 h-4" />;
      case 'emergency_dispatch': return <AlertTriangle className="w-4 h-4" />;
      case 'fleet_monitoring': return <Monitor className="w-4 h-4" />;
      case 'driver_communication': return <MessageSquare className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const sendDispatcherCommand = () => {
    if (!newMessage.trim()) return;
    
    // Simulate command processing
    console.log('Dispatcher command sent:', newMessage);
    setNewMessage('');
    
    // Add to current tasks
    setAgent(prev => ({
      ...prev,
      currentTasks: [...prev.currentTasks.slice(-2), `Processing: ${newMessage}`]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-xl font-light">Initializing Dispatcher AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            AI Dispatcher <span className="text-blue-400">Control Center</span>
          </h1>
          <p className="text-slate-300 font-light">
            Intelligent fleet dispatch and operations management system
          </p>
        </motion.div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Monitor className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="operations" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Activity className="w-4 h-4 mr-2" />
              Operations
            </TabsTrigger>
            <TabsTrigger value="communications" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              Communications
            </TabsTrigger>
            <TabsTrigger value="systems" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Systems
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="mt-6">
            {/* Agent Status Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            >
              <MetricCard
                title="Dispatcher Status"
                value={agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                subtitle="Current operational state"
                icon={Bot}
                trend="neutral"
                animate={true}
              />
              <MetricCard
                title="Performance Score"
                value={`${agent.performance}%`}
                subtitle="Overall efficiency"
                icon={TrendingUp}
                trend="up"
                trendValue="+2.3%"
                animate={true}
              />
              <MetricCard
                title="Total Dispatched"
                value={agent.totalDispatched.toLocaleString()}
                subtitle="All-time operations"
                icon={Target}
                trend="up"
                trendValue="+15.2%"
                animate={true}
              />
              <MetricCard
                title="Success Rate"
                value={`${agent.successRate}%`}
                subtitle="Operation completion rate"
                icon={CheckCircle}
                trend="up"
                trendValue="+1.8%"
                animate={true}
              />
            </motion.div>

            {/* Main Agent Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-6"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Crown className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{agent.name}</h2>
                    <p className="text-slate-400">Version {agent.version} • Intelligent Dispatcher</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                    {agent.status}
                  </span>
                  <button
                    onClick={toggleAgentStatus}
                    className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
                  >
                    {agent.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <p className="text-slate-300 mb-6">{agent.description}</p>

              {/* Current Tasks */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-400" />
                  Current Operations
                </h3>
                <div className="space-y-2">
                  {agent.currentTasks.map((task, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-sm text-slate-300">{task}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Active Operations</span>
                    <Activity className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-2xl font-semibold text-white">{agent.activeOperations}</p>
                </div>
                
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Avg Response Time</span>
                    <Timer className="w-4 h-4 text-green-400" />
                  </div>
                  <p className="text-2xl font-semibold text-white">{agent.avgResponseTime}s</p>
                </div>
                
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Success Rate</span>
                    <Award className="w-4 h-4 text-green-400" />
                  </div>
                  <p className="text-2xl font-semibold text-white">{agent.successRate}%</p>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Last Operation</span>
                    <CheckCircle className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-xs text-slate-300 truncate">{agent.lastOperation}</p>
                </div>
              </div>

              {/* Dispatcher Capabilities */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <Cpu className="w-5 h-5 mr-2 text-green-400" />
                  Dispatcher Capabilities
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {agent.capabilities.map((capability, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-slate-700/30 rounded-lg p-3">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-xs text-slate-300">{capability}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations" className="mt-6">
            <div className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-blue-400" />
                    Active Operations
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Real-time dispatch operations and their current status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeOperations.map((operation) => (
                      <div key={operation.id} className="p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                              {getOperationIcon(operation.type)}
                            </div>
                            <div>
                              <h4 className="font-medium text-white">{operation.description}</h4>
                              <p className="text-sm text-slate-400">Started: {operation.startTime} • ETC: {operation.estimatedCompletion}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`${getPriorityColor(operation.priority)} text-white text-xs`}>
                              {operation.priority.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {operation.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-400">Progress</span>
                            <span className="text-white">{operation.progress}%</span>
                          </div>
                          <Progress value={operation.progress} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Truck className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-400">
                              Vehicles: {operation.assignedVehicles.join(', ')}
                            </span>
                          </div>
                          <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                            <Eye className="w-4 h-4 mr-1" />
                            Monitor
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Communications Tab */}
          <TabsContent value="communications" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-green-400" />
                    Dispatcher Command Center
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Send commands and instructions to the AI dispatcher
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Enter dispatcher command..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                        onKeyPress={(e) => e.key === 'Enter' && sendDispatcherCommand()}
                      />
                      <Button onClick={sendDispatcherCommand} className="bg-blue-600 hover:bg-blue-700">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        <Route className="w-4 h-4 mr-2" />
                        Optimize Routes
                      </Button>
                      <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Emergency Dispatch
                      </Button>
                      <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Driver Check-in
                      </Button>
                      <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        <Monitor className="w-4 h-4 mr-2" />
                        Fleet Status
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Radio className="w-5 h-5 mr-2 text-green-400" />
                    Driver Communications
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Real-time communication with active drivers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { driver: 'Ion Popescu', vehicle: 'V-001', status: 'En route', lastMsg: '5 min ago' },
                      { driver: 'Maria Georgescu', vehicle: 'V-004', status: 'Loading', lastMsg: '12 min ago' },
                      { driver: 'Andrei Moldovan', vehicle: 'V-007', status: 'Break', lastMsg: '25 min ago' },
                      { driver: 'Elena Vasilescu', vehicle: 'V-012', status: 'Delivering', lastMsg: '3 min ago' }
                    ].map((comm, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-400 rounded-full" />
                          <div>
                            <p className="text-sm font-medium text-white">{comm.driver}</p>
                            <p className="text-xs text-slate-400">{comm.vehicle} • {comm.status}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-slate-400">{comm.lastMsg}</span>
                          <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                            <MessageSquare className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Systems Tab */}
          <TabsContent value="systems" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Layers className="w-5 h-5 mr-2 text-purple-400" />
                  System Integrations & Connections
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Real-time status of all connected systems and data sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {systemConnections.map((connection, index) => (
                    <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <connection.icon className="w-4 h-4 text-blue-400" />
                          <span className="text-sm font-medium text-white">{connection.system}</span>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          connection.status === 'connected' ? 'bg-green-400' :
                          connection.status === 'syncing' ? 'bg-yellow-400 animate-pulse' :
                          'bg-red-400'
                        }`} />
                      </div>
                      <div className="space-y-1 text-xs text-slate-400">
                        <p>Status: <span className="text-white capitalize">{connection.status}</span></p>
                        <p>Last sync: <span className="text-white">{connection.lastSync}</span></p>
                        <p>Data points: <span className="text-white">{connection.dataPoints.toLocaleString()}</span></p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* System Actions */}
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-4">System Actions</h3>
                  <div className="flex space-x-3">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync All Systems
                    </Button>
                    <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                      <Settings className="w-4 h-4 mr-2" />
                      System Configuration
                    </Button>
                    <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Performance Metrics
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
