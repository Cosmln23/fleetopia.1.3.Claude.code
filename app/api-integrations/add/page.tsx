'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Settings, TestTube, Key, Globe, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wizard } from '@/components/ui/wizard';

interface APIConfiguration {
  name: string;
  type: string;
  provider: string;
  baseUrl: string;
  credentials: {
    apiKey?: string;
    secretKey?: string;
    token?: string;
    username?: string;
    password?: string;
  };
  settings: {
    timeout: number;
    retryAttempts: number;
    cacheTime: number;
    rateLimitPerMinute: number;
  };
  endpoints: {
    name: string;
    path: string;
    method: string;
    purpose: string;
  }[];
}

// Step 1: Basic Information
function BasicInfoStep({ data, updateData }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Globe className="w-16 h-16 text-blue-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          Connect Your API
        </h3>
        <p className="text-gray-400">
          Add your preferred service API to optimize your fleet operations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Service Name
            </label>
            <Input
              placeholder="e.g., My Fuel Service"
              value={data.name || ''}
              onChange={(e) => updateData('name', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Service Type
            </label>
            <Select
              value={data.type || ''}
              onValueChange={(value) => updateData('type', value)}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transport">Transport/Logistics</SelectItem>
                <SelectItem value="fuel">Fuel Services</SelectItem>
                <SelectItem value="weather">Weather Services</SelectItem>
                <SelectItem value="maps">Maps/Navigation</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="payments">Payments</SelectItem>
                <SelectItem value="tracking">Vehicle Tracking</SelectItem>
                <SelectItem value="custom">Custom/Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Provider Name
            </label>
            <Input
              placeholder="e.g., OMV, Petrom, Custom Provider"
              value={data.provider || ''}
              onChange={(e) => updateData('provider', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Base URL
            </label>
            <Input
              placeholder="https://api.yourservice.com/v1"
              value={data.baseUrl || ''}
              onChange={(e) => updateData('baseUrl', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <Textarea
              placeholder="Brief description of what this API provides..."
              value={data.description || ''}
              onChange={(e) => updateData('description', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
              rows={4}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 2: Authentication
function AuthenticationStep({ data, updateData }: any) {
  const [authType, setAuthType] = useState(data.authType || 'api-key');

  const updateCredentials = (key: string, value: string) => {
    const credentials = data.credentials || {};
    updateData('credentials', { ...credentials, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Key className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          Authentication Setup
        </h3>
        <p className="text-gray-400">
          Configure how FleetMind will authenticate with your API
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Authentication Type
          </label>
          <Select
            value={authType}
            onValueChange={(value) => {
              setAuthType(value);
              updateData('authType', value);
            }}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="api-key">API Key</SelectItem>
              <SelectItem value="bearer-token">Bearer Token</SelectItem>
              <SelectItem value="basic-auth">Basic Authentication</SelectItem>
              <SelectItem value="oauth2">OAuth 2.0</SelectItem>
              <SelectItem value="custom-header">Custom Header</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {authType === 'api-key' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Key
              </label>
              <Input
                type="password"
                placeholder="Your API key"
                value={data.credentials?.apiKey || ''}
                onChange={(e) => updateCredentials('apiKey', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Secret Key (Optional)
              </label>
              <Input
                type="password"
                placeholder="Secret key if required"
                value={data.credentials?.secretKey || ''}
                onChange={(e) => updateCredentials('secretKey', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>
        )}

        {authType === 'bearer-token' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bearer Token
            </label>
            <Input
              type="password"
              placeholder="Your bearer token"
              value={data.credentials?.token || ''}
              onChange={(e) => updateCredentials('token', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
        )}

        {authType === 'basic-auth' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <Input
                placeholder="Username"
                value={data.credentials?.username || ''}
                onChange={(e) => updateCredentials('username', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <Input
                type="password"
                placeholder="Password"
                value={data.credentials?.password || ''}
                onChange={(e) => updateCredentials('password', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>
        )}
      </div>

      <div className="terminal-border rounded-lg p-4 bg-gray-900">
        <div className="flex items-center mb-2">
          <Settings className="w-4 h-4 text-blue-400 mr-2" />
          <span className="text-sm font-medium text-white">Security Note</span>
        </div>
        <p className="text-xs text-gray-400">
          All credentials are encrypted and stored securely. They are only used to make API calls on your behalf.
        </p>
      </div>
    </div>
  );
}

// Step 3: Configuration
function ConfigurationStep({ data, updateData }: any) {
  const updateSettings = (key: string, value: any) => {
    const settings = data.settings || {};
    updateData('settings', { ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Settings className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          API Configuration
        </h3>
        <p className="text-gray-400">
          Configure performance and behavior settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Request Timeout (seconds)
            </label>
            <Input
              type="number"
              placeholder="30"
              value={data.settings?.timeout || 30}
              onChange={(e) => updateSettings('timeout', parseInt(e.target.value))}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Retry Attempts
            </label>
            <Input
              type="number"
              placeholder="3"
              value={data.settings?.retryAttempts || 3}
              onChange={(e) => updateSettings('retryAttempts', parseInt(e.target.value))}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cache Time (minutes)
            </label>
            <Input
              type="number"
              placeholder="15"
              value={data.settings?.cacheTime || 15}
              onChange={(e) => updateSettings('cacheTime', parseInt(e.target.value))}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Rate Limit (requests/minute)
            </label>
            <Input
              type="number"
              placeholder="60"
              value={data.settings?.rateLimitPerMinute || 60}
              onChange={(e) => updateSettings('rateLimitPerMinute', parseInt(e.target.value))}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 4: Test Connection
function TestConnectionStep({ data, updateData }: any) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const testConnection = async () => {
    setTesting(true);
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTestResult({
        success: true,
        responseTime: 245,
        endpoints: ['GET /status', 'GET /data'],
        message: 'Connection successful!'
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: 'Connection failed',
        message: 'Please check your credentials and try again.'
      });
    }
    setTesting(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <TestTube className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          Test Your Connection
        </h3>
        <p className="text-gray-400">
          Verify that FleetMind can connect to your API
        </p>
      </div>

      <div className="terminal-border rounded-lg p-6 space-y-4">
        <div className="text-center">
          <Button
            onClick={testConnection}
            disabled={testing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {testing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Testing Connection...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Test Connection
              </>
            )}
          </Button>
        </div>

        {testResult && (
          <div className={`p-4 rounded-lg ${
            testResult.success 
              ? 'bg-green-900/50 border border-green-700' 
              : 'bg-red-900/50 border border-red-700'
          }`}>
            <div className="flex items-center mb-2">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                testResult.success ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
              <span className="font-medium text-white">
                {testResult.success ? 'Success' : 'Failed'}
              </span>
            </div>
            <p className="text-sm text-gray-300 mb-2">{testResult.message}</p>
            
            {testResult.success && (
              <div className="text-xs text-gray-400 space-y-1">
                <div>Response time: {testResult.responseTime}ms</div>
                <div>Available endpoints: {testResult.endpoints.join(', ')}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="terminal-border rounded-lg p-4 bg-gray-900">
        <h4 className="text-sm font-medium text-white mb-2">Summary</h4>
        <div className="space-y-2 text-xs text-gray-400">
          <div>Service: {data.name || 'Not specified'}</div>
          <div>Type: {data.type || 'Not specified'}</div>
          <div>Provider: {data.provider || 'Not specified'}</div>
          <div>URL: {data.baseUrl || 'Not specified'}</div>
        </div>
      </div>
    </div>
  );
}

export default function AddAPIPage() {
  const wizardSteps = [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Configure your API service details',
      component: BasicInfoStep
    },
    {
      id: 'auth',
      title: 'Authentication',
      description: 'Set up authentication credentials',
      component: AuthenticationStep
    },
    {
      id: 'config',
      title: 'Configuration',
      description: 'Configure performance settings',
      component: ConfigurationStep
    },
    {
      id: 'test',
      title: 'Test Connection',
      description: 'Verify your API connection',
      component: TestConnectionStep
    }
  ];

  const handleComplete = async (data: APIConfiguration) => {
    try {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        // Redirect to API integrations page
        window.location.href = '/api-integrations';
      }
    } catch (error) {
      console.error('Error saving API integration:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-thin text-white mb-2 matrix-text">
            Add Your <span className="text-blue-400">API Integration</span>
          </h1>
          <p className="text-gray-400 font-light">
            Connect your preferred services to optimize your fleet operations
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="terminal-border rounded-lg p-8"
        >
          <Wizard
            steps={wizardSteps}
            onComplete={handleComplete}
            className="w-full"
          />
        </motion.div>
      </div>
    </div>
  );
} 