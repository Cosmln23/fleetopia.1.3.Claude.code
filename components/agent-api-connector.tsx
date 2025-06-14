'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Plug, Settings, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface AIAgent {
  id: string;
  name: string;
  description: string;
  category: string;
  marketplace: boolean;
  requiresAPI: string[];
  capabilities: any;
}

interface APIIntegration {
  id: string;
  name: string;
  type: string;
  provider: string;
  status: string;
}

interface AgentAPIConnectorProps {
  onConnect: (connection: any) => void;
  onCancel?: () => void;
  existingConnections?: any[];
}

export function AgentAPIConnector({ onConnect, existingConnections = [] }: AgentAPIConnectorProps) {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [apis, setApis] = useState<APIIntegration[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [selectedAPI, setSelectedAPI] = useState<string>('');
  const [connectionConfig, setConnectionConfig] = useState({
    priority: 1,
    autoSync: true,
    permissions: {
      read: true,
      write: false,
      delete: false
    },
    mapping: {},
    notes: ''
  });

  // Simulate data loading
  useEffect(() => {
    // Load available agents (marketplace + user's custom)
    setAgents([
      {
        id: 'fuel-optimizer',
        name: 'Fuel Optimizer Pro',
        description: 'Optimizes fuel consumption and costs',
        category: 'fuel',
        marketplace: true,
        requiresAPI: ['fuel', 'maps'],
        capabilities: ['cost-optimization', 'route-planning', 'consumption-analysis']
      },
      {
        id: 'route-genius',
        name: 'Route Genius Elite',
        description: 'Intelligent route optimization',
        category: 'transport',
        marketplace: true,
        requiresAPI: ['maps', 'traffic', 'weather'],
        capabilities: ['route-optimization', 'traffic-analysis', 'weather-adaptation']
      },
      {
        id: 'custom-agent-1',
        name: 'My Custom Transport Agent',
        description: 'Custom agent for specific transport needs',
        category: 'custom',
        marketplace: false,
        requiresAPI: ['transport', 'fuel'],
        capabilities: ['custom-logic', 'specialized-routing']
      }
    ]);

    // Load user's API integrations
    setApis([
      {
        id: 'api-1',
        name: 'OMV Fuel API',
        type: 'fuel',
        provider: 'OMV',
        status: 'active'
      },
      {
        id: 'api-2',
        name: 'Google Maps API',
        type: 'maps',
        provider: 'Google',
        status: 'active'
      },
      {
        id: 'api-3',
        name: 'Custom Transport API',
        type: 'transport',
        provider: 'My Company',
        status: 'active'
      }
    ]);
  }, []);

  const selectedAgentData = agents.find(a => a.id === selectedAgent);
  const selectedAPIData = apis.find(a => a.id === selectedAPI);
  
  // Check if connection is compatible
  const isCompatible = selectedAgentData && selectedAPIData && 
    selectedAgentData.requiresAPI.includes(selectedAPIData.type);

  // Check if connection already exists
  const connectionExists = existingConnections.some(
    conn => conn.agentId === selectedAgent && conn.apiId === selectedAPI
  );

  const handleConnect = () => {
    if (!selectedAgent || !selectedAPI) return;

    const connection = {
      agentId: selectedAgent,
      apiId: selectedAPI,
      mapping: connectionConfig.mapping,
      permissions: connectionConfig.permissions,
      priority: connectionConfig.priority,
      settings: {
        autoSync: connectionConfig.autoSync,
        notes: connectionConfig.notes
      }
    };

    onConnect(connection);
  };

  const updatePermissions = (permission: string, value: boolean) => {
    setConnectionConfig({
      ...connectionConfig,
      permissions: {
        ...connectionConfig.permissions,
        [permission]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Bot className="w-8 h-8 text-blue-400" />
            </div>
            <Plug className="w-6 h-6 text-gray-400" />
            <div className="w-16 h-16 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Connect AI Agent to Your API
        </h2>
        <p className="text-gray-400">
          Choose an AI agent and connect it to your API integration
        </p>
      </div>

      {/* Agent Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">1. Select AI Agent</h3>
        <Select value={selectedAgent} onValueChange={setSelectedAgent}>
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-12">
            <SelectValue placeholder="Choose an AI agent" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 text-white z-[60] max-h-60">
            <div className="text-xs text-gray-400 px-2 py-1 border-b border-gray-700 mb-1">Marketplace Agents</div>
            {agents.filter(a => a.marketplace).map(agent => (
              <SelectItem key={agent.id} value={agent.id} className="hover:bg-gray-700 focus:bg-gray-700">
                <div className="flex items-center space-x-2 py-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                  <span className="truncate">{agent.name}</span>
                  <span className="text-xs text-gray-400">({agent.category})</span>
                </div>
              </SelectItem>
            ))}
            <div className="text-xs text-gray-400 px-2 py-1 border-t border-gray-700 mt-1 mb-1">Your Custom Agents</div>
            {agents.filter(a => !a.marketplace).map(agent => (
              <SelectItem key={agent.id} value={agent.id} className="hover:bg-gray-700 focus:bg-gray-700">
                <div className="flex items-center space-x-2 py-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                  <span className="truncate">{agent.name}</span>
                  <span className="text-xs text-gray-400">(custom)</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedAgentData && (
          <div className="terminal-border rounded-lg p-4 bg-gray-900">
            <div className="flex items-start space-x-3">
              <Bot className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-white">{selectedAgentData.name}</h4>
                <p className="text-sm text-gray-400 mb-2">{selectedAgentData.description}</p>
                <div className="text-xs text-gray-500">
                  <span>Requires: {selectedAgentData.requiresAPI.join(', ')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* API Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">2. Select Your API</h3>
        <Select value={selectedAPI} onValueChange={setSelectedAPI}>
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-12">
            <SelectValue placeholder="Choose your API integration" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 text-white z-[60] max-h-60">
            {apis.map(api => (
              <SelectItem key={api.id} value={api.id} className="hover:bg-gray-700 focus:bg-gray-700">
                <div className="flex items-center space-x-2 py-1">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    api.status === 'active' ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <span className="truncate">{api.name}</span>
                  <span className="text-xs text-gray-400">({api.type})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedAPIData && (
          <div className="terminal-border rounded-lg p-4 bg-gray-900">
            <div className="flex items-start space-x-3">
              <Zap className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-white">{selectedAPIData.name}</h4>
                <p className="text-sm text-gray-400">
                  Type: {selectedAPIData.type} • Provider: {selectedAPIData.provider}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compatibility Check */}
      {selectedAgent && selectedAPI && (
        <div className={`terminal-border rounded-lg p-4 ${
          isCompatible ? 'bg-green-900/20 border-green-700' : 'bg-red-900/20 border-red-700'
        }`}>
          <div className="flex items-center space-x-2">
            {isCompatible ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            <span className="font-medium text-white">
              {isCompatible ? 'Compatible Connection' : 'Incompatible Types'}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {isCompatible 
              ? 'This AI agent can work with your selected API.'
              : `This agent requires ${selectedAgentData?.requiresAPI.join(', ')} but your API is type ${selectedAPIData?.type}.`
            }
          </p>
          {connectionExists && (
            <p className="text-sm text-yellow-400 mt-1">
              ⚠️ A connection between these already exists.
            </p>
          )}
        </div>
      )}

      {/* Connection Configuration */}
      {isCompatible && !connectionExists && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">3. Configure Connection</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Priority Level
              </label>
              <Select 
                value={connectionConfig.priority.toString()} 
                onValueChange={(value) => setConnectionConfig({
                  ...connectionConfig,
                  priority: parseInt(value)
                })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white z-[60]">
                  <SelectItem value="1" className="hover:bg-gray-700 focus:bg-gray-700">High Priority</SelectItem>
                  <SelectItem value="2" className="hover:bg-gray-700 focus:bg-gray-700">Medium Priority</SelectItem>
                  <SelectItem value="3" className="hover:bg-gray-700 focus:bg-gray-700">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Switch
                checked={connectionConfig.autoSync}
                onCheckedChange={(checked) => setConnectionConfig({
                  ...connectionConfig,
                  autoSync: checked
                })}
              />
              <label className="text-sm text-gray-300">Auto-sync data</label>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              API Permissions
            </label>
            <div className="space-y-2">
              {Object.entries(connectionConfig.permissions).map(([permission, enabled]) => (
                <div key={permission} className="flex items-center space-x-2">
                  <Switch
                    checked={enabled as boolean}
                    onCheckedChange={(checked) => updatePermissions(permission, checked)}
                  />
                  <label className="text-sm text-gray-300 capitalize">
                    {permission} access
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Configuration Notes (Optional)
            </label>
            <Textarea
              placeholder="Add any specific configuration notes or instructions..."
              value={connectionConfig.notes}
              onChange={(e) => setConnectionConfig({
                ...connectionConfig,
                notes: e.target.value
              })}
              className="bg-gray-800 border-gray-700 text-white"
              rows={3}
            />
          </div>
        </div>
      )}

      {/* Action Button */}
      {isCompatible && !connectionExists && (
        <div className="flex justify-end">
          <Button 
            onClick={handleConnect}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plug className="w-4 h-4 mr-2" />
            Connect Agent to API
          </Button>
        </div>
      )}

      {/* Info Box */}
      <div className="border border-gray-700 rounded-lg p-4 bg-gray-900/50">
        <div className="flex items-start space-x-3">
          <Settings className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-300 min-w-0">
            <p className="font-medium text-white mb-2">How Connections Work</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400 leading-relaxed">
              <li>AI agents use your API to get real-time data</li>
              <li>All costs are charged to your API account</li>
              <li>You control permissions and access levels</li>
              <li>Connections can be modified or removed anytime</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 