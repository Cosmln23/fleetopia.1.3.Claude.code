'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Link as LinkIcon, 
  CheckCircle, 
  AlertTriangle, 
  Settings, 
  Plus,
  Eye,
  Trash2,
  TestTube,
  Globe,
  Clock,
  Shield,
  Activity,
  Database,
  Cloud,
  Smartphone,
  Navigation,
  Truck,
  Mail,
  Gauge,
  MapPin,
  Package
} from 'lucide-react';
import { APIIntegrationForm } from '@/components/api-integration-form';
import { AgentAPIConnector } from '@/components/agent-api-connector';
import { API_PROVIDERS } from '@/lib/universal-api-bridge';

interface APIProvider {
  category: 'gps' | 'freight' | 'communication' | 'weather' | 'fuel';
  provider: string;
  name: string;
  description: string;
  tier: 'free' | 'freemium' | 'paid' | 'enterprise';
  status: 'built-in' | 'configured' | 'available' | 'client-configurable';
  credentialsRequired: string[];
  rateLimit?: {
    requests: number;
    period: 'minute' | 'hour' | 'day' | 'month';
  };
  costEstimate?: {
    free?: string;
    paid?: string;
  };
  setupComplexity: 'easy' | 'medium' | 'hard';
  documentation?: string;
  health?: number;
  lastTested?: string;
  requestsToday?: number;
  responseTime?: number;
}

export default function APIIntegrationsPage() {
  // Enrich API_PROVIDERS with current status and metrics
  const [providers, setProviders] = useState<APIProvider[]>(
    API_PROVIDERS.map(provider => ({
      ...provider,
      status: provider.tier === 'free' || provider.tier === 'freemium' ? 'built-in' : 'client-configurable',
      health: undefined,
      lastTested: undefined,
      requestsToday: 0,
      responseTime: 0
    }))
  );

  const [showAddForm, setShowAddForm] = useState(false);
  const [showConnector, setShowConnector] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [testResults, setTestResults] = useState<{ [key: string]: any }>({});
  const [testing, setTesting] = useState<{ [key: string]: boolean }>({});
  const [runningAllTests, setRunningAllTests] = useState(false);
  const [apiErrors, setApiErrors] = useState<any[]>([]);
  const [showErrorDetails, setShowErrorDetails] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState<string | null>(null);
  const [showLogsModal, setShowLogsModal] = useState(false);

  // Remove mock systemLogs, rely on real-time data
  const [systemLogs] = useState<Array<{
    id: string;
    timestamp: Date;
    level: 'INFO' | 'WARNING' | 'ERROR';
    api: string;
    message: string;
    details?: any;
  }>>([]);

  // Monitor API errors from real-time endpoint
  React.useEffect(() => {
    const fetchApiErrors = async () => {
      try {
        const response = await fetch('/api/real-time?type=errors');
        if (!response.ok) {
          const errorData = await response.json();
          setApiErrors(prev => [...prev, {
            id: Date.now(),
            timestamp: new Date(),
            type: 'real-time-api',
            message: errorData.message || 'Real-time API error',
            details: errorData.details || {},
            status: response.status
          }]);
        }
      } catch (error) {
        setApiErrors(prev => [...prev, {
          id: Date.now(),
          timestamp: new Date(),
          type: 'fetch-error',
          message: 'Failed to connect to real-time API',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
          status: 500
        }]);
      }
    };

    // Check for errors every 30 seconds
    const interval = setInterval(fetchApiErrors, 30000);
    fetchApiErrors(); // Initial check

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'built-in': return 'text-green-400 border-green-400';
      case 'configured': return 'text-blue-400 border-blue-400';
      case 'available': return 'text-yellow-400 border-yellow-400';
      case 'client-configurable': return 'text-purple-400 border-purple-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'built-in': return <CheckCircle className="w-4 h-4" />;
      case 'configured': return <CheckCircle className="w-4 h-4" />;
      case 'available': return <Clock className="w-4 h-4" />;
      case 'client-configurable': return <Settings className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'gps': return <MapPin className="w-5 h-5" />;
      case 'freight': return <Package className="w-5 h-5" />;
      case 'communication': return <Mail className="w-5 h-5" />;
      case 'weather': return <Cloud className="w-5 h-5" />;
      case 'fuel': return <Gauge className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const totalProviders = providers.length;
  const builtInProviders = providers.filter(p => p.status === 'built-in').length;
  const totalRequests = providers.reduce((sum, p) => sum + (p.requestsToday || 0), 0);
  const avgHealth = providers.filter(p => p.health).reduce((sum, p) => sum + (p.health || 0), 0) / providers.filter(p => p.health).length || 0;

  // 🧪 API TESTING FUNCTIONS
  const runIndividualTest = async (integrationId: string) => {
    setTesting(prev => ({ ...prev, [integrationId]: true }));
    
    try {
      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId })
      });
      
      const result = await response.json();
      setTestResults(prev => ({ ...prev, [integrationId]: result }));
      
      // Update provider status based on test result
      setProviders(prev => prev.map(provider => 
        `${provider.category}_${provider.provider}` === integrationId 
          ? { 
              ...provider, 
              status: result.success ? 'configured' : 'available',
              health: result.success ? Math.max(90, provider.health || 50) : Math.min(50, provider.health || 50),
              responseTime: result.responseTime || provider.responseTime || 0,
              lastTested: 'Just now'
            }
          : provider
      ));
      
    } catch (error) {
      console.error('Test failed:', error);
      setTestResults(prev => ({ 
        ...prev, 
        [integrationId]: { 
          success: false, 
          error: 'Network error',
          message: 'Failed to connect to test endpoint'
        }
      }));
    } finally {
      setTesting(prev => ({ ...prev, [integrationId]: false }));
    }
  };

  const runAllAPITests = async () => {
    setRunningAllTests(true);
    console.log('🧪 Starting comprehensive API testing...');
    
    const testPromises = providers.map(async (provider) => {
      await runIndividualTest(`${provider.category}_${provider.provider}`);
      // Add small delay between tests to avoid overwhelming
      await new Promise(resolve => setTimeout(resolve, 500));
    });
    
    await Promise.all(testPromises);
    setRunningAllTests(false);
    console.log('✅ All API tests completed');
  };

  const handleSettingsClick = (apiId: string) => {
    setShowSettingsModal(apiId);
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
                API Integrations
              </h1>
              <p className="text-slate-400 text-lg">
                Universal API Bridge - Built-in free APIs + client-configurable services
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-400 border-green-400">
                <LinkIcon className="w-4 h-4 mr-2" />
                {builtInProviders}/{totalProviders} Ready
              </Badge>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Configure API
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-[--card] border-0 wave-hover">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Providers</p>
                  <p className="text-2xl font-bold text-white">{totalProviders}</p>
                  <p className="text-xs text-blue-400">5 categories</p>
                </div>
                <Zap className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[--card] border-0 wave-hover">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Built-in Ready</p>
                  <p className="text-2xl font-bold text-green-400">{builtInProviders}</p>
                  <p className="text-xs text-green-400">Free APIs available</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[--card] border-0 wave-hover">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Requests Today</p>
                  <p className="text-2xl font-bold text-purple-400">{totalRequests.toLocaleString()}</p>
                  <p className="text-xs text-green-400">+12% from yesterday</p>
                </div>
                <Activity className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-[--card] border-0 wave-hover">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Avg Health</p>
                  <p className="text-2xl font-bold text-yellow-400">{avgHealth.toFixed(0)}%</p>
                  <p className="text-xs text-green-400">All systems operational</p>
                </div>
                <Shield className="w-8 h-8 text-yellow-400" />
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
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">API Overview</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="connections">Agent Connections</TabsTrigger>
              <TabsTrigger value="testing">API Testing</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* API List */}
                <div className="lg:col-span-2">
                  <Card className="bg-[--card] border-0 wave-hover">
                    <CardHeader>
                      <CardTitle className="text-slate-200">Universal API Providers</CardTitle>
                      <CardDescription>Built-in free APIs and client-configurable services</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {providers.slice(0, 6).map((provider) => (
                        <motion.div
                          key={`${provider.category}_${provider.provider}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-4 bg-slate-700/50 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-10 h-10 bg-slate-600 rounded-lg">
                                {getCategoryIcon(provider.category)}
                              </div>
                              <div>
                                <p className="font-medium text-white">{provider.name}</p>
                                <p className="text-sm text-slate-400">{provider.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getStatusColor(provider.status)}`}
                              >
                                {getStatusIcon(provider.status)}
                                <span className="ml-1 capitalize">{provider.status}</span>
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  provider.tier === 'free' ? 'text-green-400 border-green-400' :
                                  provider.tier === 'freemium' ? 'text-blue-400 border-blue-400' :
                                  provider.tier === 'paid' ? 'text-yellow-400 border-yellow-400' :
                                  'text-purple-400 border-purple-400'
                                }`}
                              >
                                {provider.tier.toUpperCase()}
                              </Badge>
                              {provider.status === 'client-configurable' && (
                                <Button variant="outline" size="sm" onClick={() => handleSettingsClick(`${provider.category}_${provider.provider}`)}>
                                  <Settings className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-slate-400">Complexity</p>
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  provider.setupComplexity === 'easy' ? 'bg-green-400' :
                                  provider.setupComplexity === 'medium' ? 'bg-yellow-400' :
                                  'bg-red-400'
                                }`}></div>
                                <span className="text-white font-medium capitalize">{provider.setupComplexity}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-slate-400">Cost</p>
                              <p className="text-white font-medium">
                                {provider.costEstimate?.free || provider.costEstimate?.paid || 'Contact'}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400">Rate Limit</p>
                              <p className="text-white font-medium">
                                {provider.rateLimit ? `${provider.rateLimit.requests}/${provider.rateLimit.period}` : 'Variable'}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-400">Health</p>
                              <p className="text-white font-medium">
                                {provider.health ? `${provider.health}%` : 'N/A'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                            <span>{provider.category.toUpperCase()} • {provider.credentialsRequired.join(', ')}</span>
                            <span>{provider.lastTested ? `Last tested: ${provider.lastTested}` : 'Client configurable'}</span>
                          </div>
                        </motion.div>
                      ))}
                      
                      <div className="text-center py-4">
                        <Button variant="outline" onClick={() => setSelectedTab('categories')}>
                          <Eye className="w-4 h-4 mr-2" />
                          View All Categories
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Side Panel */}
                <div className="space-y-6">
                  <Card className="bg-[--card] border-0 wave-hover">
                    <CardHeader>
                      <CardTitle className="flex items-center text-slate-200">
                        <Activity className="w-5 h-5 mr-2 text-blue-400" />
                        System Health
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">API Gateway</span>
                        <span className="text-green-400 font-bold">Online</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Load Balancer</span>
                        <span className="text-green-400 font-bold">Healthy</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Rate Limiting</span>
                        <span className="text-blue-400 font-bold">Active</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Security</span>
                        <span className="text-green-400 font-bold">Secured</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {['gps', 'freight', 'communication', 'weather', 'fuel'].map((category) => {
                  const categoryProviders = providers.filter(p => p.category === category);
                  const builtInCount = categoryProviders.filter(p => p.status === 'built-in').length;
                  const totalCount = categoryProviders.length;
                  
                  return (
                    <Card key={category} className="bg-[--card] border-0">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-12 h-12 bg-slate-600 rounded-lg">
                              {getCategoryIcon(category)}
                            </div>
                            <div>
                              <CardTitle className="text-slate-200 capitalize">{category} APIs</CardTitle>
                              <CardDescription>
                                {builtInCount} built-in • {totalCount - builtInCount} client-configurable
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-green-400 border-green-400">
                            {builtInCount}/{totalCount} Ready
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categoryProviders.map((provider) => (
                            <div
                              key={provider.provider}
                              className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-slate-500/50 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <p className="font-medium text-white text-sm">{provider.name}</p>
                                  <p className="text-xs text-slate-400 mt-1">{provider.description}</p>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    provider.tier === 'free' ? 'text-green-400 border-green-400' :
                                    provider.tier === 'freemium' ? 'text-blue-400 border-blue-400' :
                                    provider.tier === 'paid' ? 'text-yellow-400 border-yellow-400' :
                                    'text-purple-400 border-purple-400'
                                  }`}
                                >
                                  {provider.tier.toUpperCase()}
                                </Badge>
                              </div>
                              
                              <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Setup:</span>
                                  <span className={`font-medium ${
                                    provider.setupComplexity === 'easy' ? 'text-green-400' :
                                    provider.setupComplexity === 'medium' ? 'text-yellow-400' :
                                    'text-red-400'
                                  }`}>
                                    {provider.setupComplexity}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Cost:</span>
                                  <span className="text-white font-medium">
                                    {provider.costEstimate?.free || provider.costEstimate?.paid || 'Custom'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Status:</span>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${getStatusColor(provider.status)}`}
                                  >
                                    {provider.status === 'built-in' ? 'Ready' : 'Configure'}
                                  </Badge>
                                </div>
                              </div>
                              
                              {provider.status === 'client-configurable' && (
                                <div className="mt-3 pt-3 border-t border-slate-600">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full text-xs"
                                    onClick={() => handleSettingsClick(`${provider.category}_${provider.provider}`)}
                                  >
                                    <Settings className="w-3 h-3 mr-2" />
                                    Configure
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Connections Tab */}
            <TabsContent value="connections">
              <Card className="bg-[--card] border-0">
                <CardHeader>
                  <CardTitle className="text-slate-200">Agent-API Connections</CardTitle>
                  <CardDescription>Connect AI agents with your APIs for seamless integration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-16">
                    <LinkIcon className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-300 mb-2">Agent Connection Hub</h3>
                    <p className="text-slate-400 mb-6">
                      Connect your AI agents with APIs to enable intelligent automation
                    </p>
                    <Button onClick={() => setShowConnector(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Connection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Testing Tab */}
            <TabsContent value="testing">
              <Card>
                <CardHeader>
                  <CardTitle>API Test Center</CardTitle>
                  <CardDescription>
                    Run diagnostics on your configured API integrations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2">
                    <Button onClick={runAllAPITests} disabled={runningAllTests || providers.length === 0}>
                      {runningAllTests ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <TestTube className="w-4 h-4 mr-2" />
                          Run All Tests
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-[--card] border-0">
                  <CardHeader>
                    <CardTitle className="text-slate-200">Usage Analytics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-400">{totalRequests.toLocaleString()}</p>
                        <p className="text-sm text-slate-400">Total Requests</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-400">{providers.filter(p => p.status === 'configured' || p.status === 'built-in').length}</p>
                        <p className="text-sm text-slate-400">Active APIs</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-400">142ms</p>
                        <p className="text-sm text-slate-400">Avg Response</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-400">99.2%</p>
                        <p className="text-sm text-slate-400">Uptime</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[--card] border-0">
                  <CardHeader>
                    <CardTitle className="text-slate-200">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">System Load</span>
                      <span className="text-green-400 font-bold">23%</span>
                    </div>
                    <Progress value={23} className="h-3" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Error Rate</span>
                      <span className="text-green-400 font-bold">0.8%</span>
                    </div>
                    <Progress value={0.8} className="h-3" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Throughput</span>
                      <span className="text-blue-400 font-bold">1.2K req/min</span>
                    </div>
                    <Progress value={85} className="h-3" />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Add API Form Modal */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Add New API Integration</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                  >
                    <span>✕</span>
                  </Button>
                </div>
                <APIIntegrationForm
                  onSubmit={(data) => {
                    console.log('New API integration:', data);
                    setShowAddForm(false);
                  }}
                  onCancel={() => setShowAddForm(false)}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Agent Connector Modal */}
        {showConnector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-800 rounded-lg max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-slate-700"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <h2 className="text-xl font-bold text-white">Connect Agent to API</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowConnector(false)}
                  className="hover:bg-slate-700"
                >
                  <span>✕</span>
                </Button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
                <AgentAPIConnector
                  onConnect={(data) => {
                    console.log('Agent connected to API:', data);
                    setShowConnector(false);
                  }}
                  onCancel={() => setShowConnector(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* API Error Notifications */}
        {apiErrors.length > 0 && (
          <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
            {apiErrors.slice(-3).map((error) => (
              <motion.div
                key={error.id}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-900/90 border border-red-700 rounded-lg p-4 backdrop-blur-sm cursor-pointer hover:bg-red-900/95 transition-colors"
                onClick={() => setShowErrorDetails(error.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-red-200 font-medium text-sm">API Error</span>
                    </div>
                    <p className="text-red-100 text-sm mt-1 line-clamp-2">{error.message}</p>
                    <p className="text-red-300/70 text-xs mt-1">
                      {error.timestamp.toLocaleTimeString()} • Click for details
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-300 hover:text-red-100 p-1 h-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      setApiErrors(prev => prev.filter(err => err.id !== error.id));
                    }}
                  >
                    ✕
                  </Button>
                </div>
              </motion.div>
            ))}
            
            {apiErrors.length > 3 && (
              <div className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-300 border-red-700 hover:bg-red-900/50"
                  onClick={() => setApiErrors([])}
                >
                  Clear all ({apiErrors.length})
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Error Details Modal */}
        {showErrorDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setShowErrorDetails(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden border border-red-700/50"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const error = apiErrors.find(err => err.id === showErrorDetails);
                if (!error) return null;
                
                return (
                  <>
                    <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-red-900/20">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                        <div>
                          <h3 className="text-lg font-bold text-white">API Error Details</h3>
                          <p className="text-red-300 text-sm">{error.type} • Status {error.status}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowErrorDetails(null)}
                        className="hover:bg-slate-700"
                      >
                        ✕
                      </Button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-white font-medium mb-2">Error Message</h4>
                          <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3">
                            <p className="text-red-200 font-mono text-sm">{error.message}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-white font-medium mb-2">Timestamp</h4>
                          <p className="text-gray-300 text-sm">{error.timestamp.toLocaleString()}</p>
                        </div>
                        
                        {error.details && Object.keys(error.details).length > 0 && (
                          <div>
                            <h4 className="text-white font-medium mb-2">Technical Details</h4>
                            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                              <pre className="text-gray-300 text-sm overflow-x-auto font-mono">
                                {JSON.stringify(error.details, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <h4 className="text-white font-medium mb-2">Possible Solutions</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start space-x-2">
                              <span className="text-blue-400 mt-1">•</span>
                              <span className="text-gray-300">Check if the API endpoint is accessible</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <span className="text-blue-400 mt-1">•</span>
                              <span className="text-gray-300">Verify API credentials and permissions</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <span className="text-blue-400 mt-1">•</span>
                              <span className="text-gray-300">Check network connectivity and firewall settings</span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <span className="text-blue-400 mt-1">•</span>
                              <span className="text-gray-300">Review API documentation for any recent changes</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-700">
                        <Button
                          variant="outline"
                          onClick={() => setShowErrorDetails(null)}
                        >
                          Close
                        </Button>
                        <Button
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={async () => {
                            // Retry the failed API call
                            try {
                              await fetch('/api/real-time?type=all');
                              setApiErrors(prev => prev.filter(err => err.id !== error.id));
                              setShowErrorDetails(null);
                            } catch (retryError) {
                              console.error('Retry failed:', retryError);
                            }
                          }}
                        >
                          Retry API Call
                        </Button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}

        {/* Settings Modal */}
        {showSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setShowSettingsModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden border border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const api = providers.find(a => `${a.category}_${a.provider}` === showSettingsModal);
                if (!api) return null;
                
                return (
                  <>
                    <div className="flex items-center justify-between p-6 border-b border-slate-700">
                      <div className="flex items-center space-x-3">
                        <Settings className="w-6 h-6 text-blue-400" />
                        <div>
                          <h3 className="text-lg font-bold text-white">{api.name} Settings</h3>
                          <p className="text-slate-400 text-sm">{api.provider} • {api.category}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowSettingsModal(null)}
                        className="hover:bg-slate-700"
                      >
                        ✕
                      </Button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-white font-medium mb-3">Performance Settings</h4>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm text-slate-300 mb-2">Response Timeout (ms)</label>
                              <input type="number" defaultValue={(api.responseTime || 500) * 2} className="w-full rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm text-slate-300 mb-2">Retry Attempts</label>
                              <input type="number" defaultValue={3} className="w-full rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm text-slate-300 mb-2">Health Check Interval (minutes)</label>
                              <input type="number" defaultValue={5} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white" />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-white font-medium mb-3">Security & Access</h4>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm text-slate-300 mb-2">API Key</label>
                              <input type="password" placeholder="••••••••••••••••" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm text-slate-300 mb-2">Rate Limit (requests/hour)</label>
                              <input type="number" defaultValue={1000} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" defaultChecked className="rounded bg-slate-700 border-slate-600" />
                              <label className="text-sm text-slate-300">Enable SSL verification</label>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-white font-medium mb-3">Monitoring & Alerts</h4>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" defaultChecked className="rounded bg-slate-700 border-slate-600" />
                              <label className="text-sm text-slate-300">Enable error notifications</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" defaultChecked className="rounded bg-slate-700 border-slate-600" />
                              <label className="text-sm text-slate-300">Log all requests</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" className="rounded bg-slate-700 border-slate-600" />
                              <label className="text-sm text-slate-300">Debug mode</label>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between space-x-3 mt-8 pt-6 border-t border-slate-700">
                        <Button
                          variant="outline"
                          className="text-red-400 border-red-700 hover:bg-red-900/20"
                        >
                          Reset to Defaults
                        </Button>
                        <div className="flex space-x-3">
                          <Button
                            variant="outline"
                            onClick={() => setShowSettingsModal(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => {
                              // Mock save settings
                              console.log(`Settings saved for ${api.name}`);
                              setShowSettingsModal(null);
                            }}
                          >
                            Save Settings
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}

        {/* Logs Modal */}
        {showLogsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setShowLogsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-800 rounded-lg max-w-5xl w-full max-h-[85vh] overflow-hidden border border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <div className="flex items-center space-x-3">
                  <Eye className="w-6 h-6 text-blue-400" />
                  <div>
                    <h3 className="text-lg font-bold text-white">System Logs</h3>
                    <p className="text-slate-400 text-sm">API integration activity logs</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowLogsModal(false)}
                  className="hover:bg-slate-700"
                >
                  ✕
                </Button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
                <div className="space-y-3">
                  {systemLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className={`p-4 rounded-lg border-l-4 ${
                        log.level === 'ERROR' ? 'bg-red-900/20 border-red-500' :
                        log.level === 'WARNING' ? 'bg-yellow-900/20 border-yellow-500' :
                        'bg-blue-900/20 border-blue-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                              log.level === 'ERROR' ? 'bg-red-900 text-red-200' :
                              log.level === 'WARNING' ? 'bg-yellow-900 text-yellow-200' :
                              'bg-blue-900 text-blue-200'
                            }`}>
                              {log.level}
                            </span>
                            <span className="text-slate-300 font-medium">{log.api}</span>
                            <span className="text-slate-500 text-sm">{log.timestamp.toLocaleString()}</span>
                          </div>
                          <p className="text-white mb-2">{log.message}</p>
                          {log.details && (
                            <div className="bg-slate-900/50 border border-slate-700 rounded p-3">
                              <pre className="text-xs text-slate-300 font-mono overflow-x-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-center mt-6">
                  <Button variant="outline" className="text-slate-400">
                    Load More Logs
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
