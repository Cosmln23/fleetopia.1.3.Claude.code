'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Satellite, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Info,
  Settings,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { UniversalGPSConfig, createGPSConnector, GPS_PROVIDER_TEMPLATES } from '@/lib/universal-gps-connector';

interface UniversalGPSFormProps {
  onSave: (config: UniversalGPSConfig) => void;
  onCancel: () => void;
  initialConfig?: Partial<UniversalGPSConfig>;
}

export function UniversalGPSForm({ onSave, onCancel, initialConfig }: UniversalGPSFormProps) {
  const [config, setConfig] = useState<Partial<UniversalGPSConfig>>({
    name: '',
    baseUrl: '',
    authType: 'apikey',
    credentials: {},
    endpoints: {
      getVehicleLocation: '/vehicles/{vehicleId}/location',
      getFleetStatus: '/vehicles/locations'
    },
    dataMapping: {
      vehicleId: 'vehicleId',
      latitude: 'lat',
      longitude: 'lng',
      timestamp: 'timestamp'
    },
    ...initialConfig
  });

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; responseTime: number } | null>(null);

  const handleTemplateSelect = (template: string) => {
    const templateConfig = GPS_PROVIDER_TEMPLATES[template];
    if (templateConfig) {
      setConfig({
        ...templateConfig,
        credentials: config.credentials // Keep existing credentials
      });
      setTestResult(null);
    }
  };

  const handleTest = async () => {
    if (!config.baseUrl || !config.endpoints) {
      toast.error('Please fill in base URL and endpoints first');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const connector = createGPSConnector('custom', config);
      const result = await connector.testConnection();
      setTestResult(result);
      
      if (result.success) {
        toast.success('GPS API connection successful!');
      } else {
        toast.error('GPS API connection failed');
      }
    } catch (error) {
      const errorResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        responseTime: 0
      };
      setTestResult(errorResult);
      toast.error('Connection test failed');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (!config.name || !config.baseUrl || !config.endpoints) {
      toast.error('Please fill in all required fields');
      return;
    }

    onSave(config as UniversalGPSConfig);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="bg-[--card]">
        <CardHeader>
          <CardTitle className="flex items-center text-slate-200">
            <Satellite className="w-5 h-5 mr-2 text-orange-400" />
            Universal GPS API Configuration
          </CardTitle>
          <CardDescription>
            Connect any GPS tracking system to Fleetopia. Configure once, track everywhere.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="template" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="template">Quick Setup</TabsTrigger>
              <TabsTrigger value="custom">Custom API</TabsTrigger>
              <TabsTrigger value="test">Test & Save</TabsTrigger>
            </TabsList>

            {/* Quick Setup Tab */}
            <TabsContent value="template" className="space-y-4">
              <div className="space-y-4">
                <Label className="text-slate-300">Choose a GPS Provider Template</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(GPS_PROVIDER_TEMPLATES).map(([key, template]) => (
                    <div
                      key={key}
                      className="p-4 border border-slate-600 rounded-lg cursor-pointer hover:border-slate-500 transition-colors"
                      onClick={() => handleTemplateSelect(key)}
                    >
                      <h3 className="font-medium text-slate-200 mb-2">{template.name}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {template.authType?.toUpperCase()}
                          </Badge>
                          <span className="text-slate-400">{template.baseUrl}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Custom API Tab */}
            <TabsContent value="custom" className="space-y-6">
              {/* Basic Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-200 flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Basic Configuration
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-300">Provider Name *</Label>
                    <Input
                      id="name"
                      value={config.name || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="My GPS Provider"
                      className="text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="baseUrl" className="text-slate-300">Base API URL *</Label>
                    <Input
                      id="baseUrl"
                      value={config.baseUrl || ''}
                      onChange={(e) => setConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                      placeholder="https://api.example.com/v1"
                      className="text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="authType" className="text-slate-300">Authentication Type</Label>
                  <Select 
                    value={config.authType || 'apikey'} 
                    onValueChange={(value) => setConfig(prev => ({ ...prev, authType: value as any }))}
                  >
                    <SelectTrigger className="text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apikey">API Key</SelectItem>
                      <SelectItem value="bearer">Bearer Token</SelectItem>
                      <SelectItem value="basic">Basic Auth</SelectItem>
                      <SelectItem value="none">No Authentication</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Credentials */}
                {config.authType === 'apikey' && (
                  <div className="space-y-2">
                    <Label htmlFor="apiKey" className="text-slate-300">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={config.credentials?.apiKey || ''}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        credentials: { ...prev.credentials, apiKey: e.target.value }
                      }))}
                      placeholder="Your API key"
                      className="text-white"
                    />
                  </div>
                )}

                {config.authType === 'bearer' && (
                  <div className="space-y-2">
                    <Label htmlFor="token" className="text-slate-300">Bearer Token</Label>
                    <Input
                      id="token"
                      type="password"
                      value={config.credentials?.token || ''}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        credentials: { ...prev.credentials, token: e.target.value }
                      }))}
                      placeholder="Your bearer token"
                      className="text-white"
                    />
                  </div>
                )}

                {config.authType === 'basic' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-slate-300">Username</Label>
                      <Input
                        id="username"
                        value={config.credentials?.username || ''}
                        onChange={(e) => setConfig(prev => ({ 
                          ...prev, 
                          credentials: { ...prev.credentials, username: e.target.value }
                        }))}
                        placeholder="Username"
                        className="text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-slate-300">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={config.credentials?.password || ''}
                        onChange={(e) => setConfig(prev => ({ 
                          ...prev, 
                          credentials: { ...prev.credentials, password: e.target.value }
                        }))}
                        placeholder="Password"
                        className="text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* API Endpoints */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-200">API Endpoints</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Get Vehicle Location</Label>
                    <Input
                      value={config.endpoints?.getVehicleLocation || ''}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        endpoints: { ...prev.endpoints!, getVehicleLocation: e.target.value }
                      }))}
                      placeholder="/vehicles/{vehicleId}/location"
                      className="text-white"
                    />
                    <p className="text-xs text-slate-400">Use {vehicleId} as placeholder for vehicle ID</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300">Get Fleet Status</Label>
                    <Input
                      value={config.endpoints?.getFleetStatus || ''}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        endpoints: { ...prev.endpoints!, getFleetStatus: e.target.value }
                      }))}
                      placeholder="/vehicles/locations"
                      className="text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Data Mapping */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-200">Data Field Mapping</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Vehicle ID Field</Label>
                    <Input
                      value={config.dataMapping?.vehicleId || ''}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        dataMapping: { ...prev.dataMapping!, vehicleId: e.target.value }
                      }))}
                      placeholder="vehicleId"
                      className="text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300">Latitude Field</Label>
                    <Input
                      value={config.dataMapping?.latitude || ''}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        dataMapping: { ...prev.dataMapping!, latitude: e.target.value }
                      }))}
                      placeholder="lat"
                      className="text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300">Longitude Field</Label>
                    <Input
                      value={config.dataMapping?.longitude || ''}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        dataMapping: { ...prev.dataMapping!, longitude: e.target.value }
                      }))}
                      placeholder="lng"
                      className="text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300">Timestamp Field</Label>
                    <Input
                      value={config.dataMapping?.timestamp || ''}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        dataMapping: { ...prev.dataMapping!, timestamp: e.target.value }
                      }))}
                      placeholder="timestamp"
                      className="text-white"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Test & Save Tab */}
            <TabsContent value="test" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-slate-200 flex items-center">
                  <TestTube className="w-4 h-4 mr-2" />
                  Test Connection
                </h3>
                
                <div className="p-4 bg-slate-800 rounded-lg">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Provider:</span>
                      <span className="text-white">{config.name || 'Unnamed'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Base URL:</span>
                      <span className="text-white text-sm">{config.baseUrl || 'Not set'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Auth Type:</span>
                      <Badge variant="outline">{config.authType?.toUpperCase()}</Badge>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleTest} 
                  disabled={testing || !config.baseUrl}
                  className="w-full"
                >
                  {testing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4 mr-2" />
                      Test GPS API Connection
                    </>
                  )}
                </Button>

                {testResult && (
                  <div className={`p-4 rounded-lg border ${
                    testResult.success 
                      ? 'bg-green-900/20 border-green-700' 
                      : 'bg-red-900/20 border-red-700'
                  }`}>
                    <div className="flex items-start space-x-3">
                      {testResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className={`font-medium ${
                          testResult.success ? 'text-green-200' : 'text-red-200'
                        }`}>
                          {testResult.success ? 'Connection Successful!' : 'Connection Failed'}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          {testResult.message}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Response time: {testResult.responseTime}ms
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t border-slate-700">
            <Button variant="outline" onClick={onCancel} className="text-slate-300">
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!config.name || !config.baseUrl}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Save GPS Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}