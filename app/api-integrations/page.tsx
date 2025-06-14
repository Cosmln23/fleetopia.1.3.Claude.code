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
  Smartphone
} from 'lucide-react';
import { APIIntegrationForm } from '@/components/api-integration-form';
import { AgentAPIConnector } from '@/components/agent-api-connector';

interface APIIntegration {
  id: string;
  name: string;
  description: string;
  provider: string;
  type: 'REST' | 'GraphQL' | 'WebSocket' | 'SOAP';
  status: 'connected' | 'disconnected' | 'error' | 'testing';
  health: number;
  endpoint: string;
  lastTested: string;
  requestsToday: number;
  responseTime: number;
  connectedAgents: number;
  category: string;
  requiresAuth: boolean;
}

export default function APIIntegrationsPage() {
  const [integrations, setIntegrations] = useState<APIIntegration[]>([
    {
      id: '1',
      name: 'Google Maps API',
      description: 'Real-time mapping and routing services',
      provider: 'Google',
      type: 'REST',
      status: 'error',
      health: 50,
      endpoint: 'https://maps.googleapis.com/maps/api/',
      lastTested: 'Just now',
      requestsToday: 1547,
      responseTime: 120,
      connectedAgents: 3,
      category: 'Navigation',
      requiresAuth: true
    },
    {
      id: '2',
      name: 'Weather Service API',
      description: 'Weather data and forecasting',
      provider: 'OpenWeather',
      type: 'REST',
      status: 'error',
      health: 50,
      endpoint: 'https://api.openweathermap.org/data/',
      lastTested: 'Just now',
      requestsToday: 234,
      responseTime: 89,
      connectedAgents: 2,
      category: 'Weather',
      requiresAuth: true
    },
    {
      id: '3',
      name: 'Fuel Price API',
      description: 'Real-time fuel pricing data',
      provider: 'FuelPrices.io',
      type: 'REST',
      status: 'error',
      health: 50,
      endpoint: 'https://api.fuelprices.io/v1/',
      lastTested: 'Just now',
      requestsToday: 89,
      responseTime: 156,
      connectedAgents: 1,
      category: 'Pricing',
      requiresAuth: true
    },
    {
      id: '4',
      name: 'Payment Gateway',
      description: 'Secure payment processing',
      provider: 'Stripe',
      type: 'REST',
      status: 'error',
      health: 45,
      endpoint: 'https://api.stripe.com/v1/',
      lastTested: '3 hours ago',
      requestsToday: 12,
      responseTime: 2340,
      connectedAgents: 0,
      category: 'Payment',
      requiresAuth: true
    },
    {
      id: '5',
      name: 'SMS Gateway',
      description: 'Customer notification service',
      provider: 'Twilio',
      type: 'REST',
      status: 'disconnected',
      health: 0,
      endpoint: 'https://api.twilio.com/2010-04-01/',
      lastTested: 'Never',
      requestsToday: 0,
      responseTime: 0,
      connectedAgents: 0,
      category: 'Communication',
      requiresAuth: true
    }
  ]);

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

  // Mock logs data for demonstration
  const [systemLogs] = useState([
    {
      id: '1',
      timestamp: new Date(Date.now() - 300000),
      level: 'ERROR',
      api: 'Google Maps API',
      message: 'Rate limit exceeded for geocoding requests',
      details: { endpoint: '/geocode/json', status: 429, retryAfter: '60s' }
    },
    {
      id: '2', 
      timestamp: new Date(Date.now() - 600000),
      level: 'WARNING',
      api: 'Weather Service API',
      message: 'High response time detected',
      details: { responseTime: '2.3s', threshold: '1s', endpoint: '/current' }
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 900000),
      level: 'INFO',
      api: 'Fuel Price API',
      message: 'Successfully updated fuel prices',
      details: { recordsUpdated: 1247, duration: '450ms' }
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 1200000),
      level: 'ERROR',
      api: 'Payment Gateway',
      message: 'Connection timeout during payment processing',
      details: { timeout: '30s', transactionId: 'tx_1234567890' }
    }
  ]);

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
      case 'connected': return 'text-green-400 border-green-400';
      case 'disconnected': return 'text-gray-400 border-gray-400';
      case 'error': return 'text-red-400 border-red-400';
      case 'testing': return 'text-yellow-400 border-yellow-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'testing': return <TestTube className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Navigation': return <Globe className="w-5 h-5" />;
      case 'Weather': return <Cloud className="w-5 h-5" />;
      case 'Pricing': return <Database className="w-5 h-5" />;
      case 'Payment': return <Shield className="w-5 h-5" />;
      case 'Communication': return <Smartphone className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const totalIntegrations = integrations.length;
  const connectedIntegrations = integrations.filter(i => i.status === 'connected').length;
  const totalRequests = integrations.reduce((sum, i) => sum + i.requestsToday, 0);
  const avgHealth = integrations.reduce((sum, i) => sum + i.health, 0) / integrations.length;

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
      
      // Update integration status based on test result
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? { 
              ...integration, 
              status: result.success ? 'connected' : 'error',
              health: result.success ? Math.max(90, integration.health) : Math.min(50, integration.health),
              responseTime: result.responseTime || integration.responseTime,
              lastTested: 'Just now'
            }
          : integration
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
    
    const testPromises = integrations.map(async (integration) => {
      await runIndividualTest(integration.id);
      // Add small delay between tests to avoid overwhelming
      await new Promise(resolve => setTimeout(resolve, 500));
    });
    
    await Promise.all(testPromises);
    setRunningAllTests(false);
    console.log('✅ All API tests completed');
  };

  const generateTestReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      totalAPIs: integrations.length,
      successfulTests: Object.values(testResults).filter((result: any) => result.success).length,
      failedTests: Object.values(testResults).filter((result: any) => !result.success).length,
      averageResponseTime: Object.values(testResults)
        .filter((result: any) => result.responseTime)
        .reduce((sum: number, result: any) => sum + result.responseTime, 0) / 
        Object.values(testResults).filter((result: any) => result.responseTime).length || 0
    };
    
    console.log('📊 Test Report:', report);
    return report;
  };

  // Function to handle error badge clicks
  const handleErrorClick = (apiId: string) => {
    const api = integrations.find(a => a.id === apiId);
    if (api && api.status === 'error') {
      const errorId = `error-${Date.now()}`;
      const mockError = {
        id: errorId,
        timestamp: new Date(),
        type: 'api-connection',
        message: `${api.name} connection failed`,
        details: {
          endpoint: api.endpoint,
          provider: api.provider,
          lastWorking: api.lastTested,
          errorCode: 'CONN_TIMEOUT',
          suggestion: 'Check API credentials and network connectivity'
        },
        status: 503
      };
      setApiErrors(prev => [mockError, ...prev]);
      setShowErrorDetails(errorId);
    }
  };

  // Function to handle settings button clicks
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
                Connect your APIs and let clients bring their own services
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-400 border-green-400">
                <LinkIcon className="w-4 h-4 mr-2" />
                {connectedIntegrations}/{totalIntegrations} Connected
              </Badge>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Integration
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
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total APIs</p>
                  <p className="text-2xl font-bold text-white">{totalIntegrations}</p>
                  <p className="text-xs text-blue-400">5 categories</p>
                </div>
                <Zap className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Connected</p>
                  <p className="text-2xl font-bold text-green-400">{connectedIntegrations}</p>
                  <p className="text-xs text-green-400">{((connectedIntegrations / totalIntegrations) * 100).toFixed(0)}% uptime</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
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
          
          <Card className="bg-slate-800/50 border-slate-700">
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">API Overview</TabsTrigger>
              <TabsTrigger value="connections">Agent Connections</TabsTrigger>
              <TabsTrigger value="testing">API Testing</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* API List */}
                <div className="lg:col-span-2">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-slate-200">Connected APIs</CardTitle>
                      <CardDescription>Manage your external API integrations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {integrations.map((api) => (
                        <motion.div
                          key={api.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-4 bg-slate-700/50 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-10 h-10 bg-slate-600 rounded-lg">
                                {getCategoryIcon(api.category)}
                              </div>
                              <div>
                                <p className="font-medium text-white">{api.name}</p>
                                <p className="text-sm text-slate-400">{api.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getStatusColor(api.status)} ${api.status === 'error' ? 'cursor-pointer hover:bg-red-900/20' : ''}`}
                                onClick={() => api.status === 'error' && handleErrorClick(api.id)}
                              >
                                {getStatusIcon(api.status)}
                                <span className="ml-1 capitalize">{api.status}</span>
                              </Badge>
                              <Button variant="outline" size="sm" onClick={() => handleSettingsClick(api.id)}>
                                <Settings className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-slate-400">Health</p>
                              <div className="flex items-center space-x-2">
                                <Progress value={api.health} className="h-2 flex-1" />
                                <span className="text-white font-medium">{api.health}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-slate-400">Requests Today</p>
                              <p className="text-white font-medium">{api.requestsToday.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Response Time</p>
                              <p className="text-white font-medium">{api.responseTime}ms</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Connected Agents</p>
                              <p className="text-white font-medium">{api.connectedAgents}</p>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                            <span>{api.provider} • {api.type}</span>
                            <span>Last tested: {api.lastTested}</span>
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Side Panel */}
                <div className="space-y-6">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-slate-200">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button 
                        className="w-full justify-start"
                        onClick={() => setShowAddForm(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New API
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => setShowConnector(true)}
                      >
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Connect to Agent
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={runAllAPITests}
                        disabled={runningAllTests}
                      >
                        {runningAllTests ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
                        ) : (
                          <TestTube className="w-4 h-4 mr-2" />
                        )}
                        {runningAllTests ? 'Testing All APIs...' : 'Test All APIs'}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => setShowLogsModal(true)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Logs
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-700">
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

            {/* Connections Tab */}
            <TabsContent value="connections">
              <Card className="bg-slate-800/50 border-slate-700">
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-200">API Testing Suite</CardTitle>
                    <CardDescription>Test API endpoints and monitor performance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {integrations.filter(api => api.status === 'connected').map((api) => (
                        <div key={api.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getCategoryIcon(api.category)}
                            <span className="text-white">{api.name}</span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => runIndividualTest(api.id)}
                            disabled={testing[api.id]}
                          >
                            {testing[api.id] ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-2"></div>
                            ) : (
                              <TestTube className="w-4 h-4 mr-2" />
                            )}
                            {testing[api.id] ? 'Testing...' : 'Test Now'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-200">Test Results</CardTitle>
                    <CardDescription>
                      {Object.keys(testResults).length > 0 && (
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-green-400">
                            ✅ {Object.values(testResults).filter((r: any) => r.success).length} Passed
                          </span>
                          <span className="text-red-400">
                            ❌ {Object.values(testResults).filter((r: any) => !r.success).length} Failed
                          </span>
                        </div>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(testResults).length === 0 ? (
                      <div className="text-center py-8">
                        <TestTube className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-400">Run API tests to see results here</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(testResults).map(([integrationId, result]: [string, any]) => {
                          const integration = integrations.find(i => i.id === integrationId);
                          return (
                            <div key={integrationId} className="p-3 bg-slate-700/50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <div className={`w-3 h-3 rounded-full ${result.success ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                  <span className="text-white font-medium">{integration?.name}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs">
                                  {result.responseTime && (
                                    <span className="text-blue-400">{result.responseTime}ms</span>
                                  )}
                                  <span className={result.success ? 'text-green-400' : 'text-red-400'}>
                                    {result.success ? 'PASS' : 'FAIL'}
                                  </span>
                                </div>
                              </div>
                              
                              <p className="text-sm text-slate-300 mb-2">{result.message}</p>
                              
                              {result.recommendations && result.recommendations.length > 0 && (
                                <div className="text-xs space-y-1">
                                  {result.recommendations.slice(0, 2).map((rec: any, idx: number) => (
                                    <div key={idx} className={`p-2 rounded ${
                                      rec.type === 'error' ? 'bg-red-900/30 text-red-300' :
                                      rec.type === 'warning' ? 'bg-yellow-900/30 text-yellow-300' :
                                      rec.type === 'success' ? 'bg-green-900/30 text-green-300' :
                                      'bg-blue-900/30 text-blue-300'
                                    }`}>
                                      <div className="font-medium">{rec.title}</div>
                                      <div className="opacity-80">{rec.message}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        
                        <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-700/50">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => {
                              const report = generateTestReport();
                              console.log('📊 Full Test Report Generated:', report);
                            }}
                          >
                            📊 Generate Full Report
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-800/50 border-slate-700">
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
                        <p className="text-2xl font-bold text-green-400">{connectedIntegrations}</p>
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

                <Card className="bg-slate-800/50 border-slate-700">
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
                const api = integrations.find(a => a.id === showSettingsModal);
                if (!api) return null;
                
                return (
                  <>
                    <div className="flex items-center justify-between p-6 border-b border-slate-700">
                      <div className="flex items-center space-x-3">
                        <Settings className="w-6 h-6 text-blue-400" />
                        <div>
                          <h3 className="text-lg font-bold text-white">{api.name} Settings</h3>
                          <p className="text-slate-400 text-sm">{api.provider} • {api.type}</p>
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
                              <input type="number" defaultValue={api.responseTime * 2} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm text-slate-300 mb-2">Retry Attempts</label>
                              <input type="number" defaultValue={3} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white" />
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
