'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Eye, EyeOff, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DynamicField {
  id: string;
  key: string;
  value: string;
  type: 'text' | 'password' | 'number' | 'url' | 'email';
  description?: string;
}

interface APIIntegrationFormProps {
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
}

export function APIIntegrationForm({ onSubmit, initialData }: APIIntegrationFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || '',
    provider: initialData?.provider || '',
    description: initialData?.description || '',
    documentation: initialData?.documentation || '',
  });

  // Dynamic configuration fields
  const [configFields, setConfigFields] = useState<DynamicField[]>(
    initialData?.configuration ? 
    Object.entries(initialData.configuration).map(([key, value], index) => ({
      id: `config-${index}`,
      key,
      value: value as string,
      type: 'text'
    })) : 
    [{ id: 'config-0', key: 'baseUrl', value: '', type: 'url' as const }]
  );

  // Dynamic credentials fields
  const [credentialFields, setCredentialFields] = useState<DynamicField[]>(
    initialData?.credentials ? 
    Object.entries(initialData.credentials).map(([key, value], index) => ({
      id: `cred-${index}`,
      key,
      value: value as string,
      type: key.toLowerCase().includes('password') || key.toLowerCase().includes('secret') || key.toLowerCase().includes('key') ? 'password' : 'text'
    })) : 
    [{ id: 'cred-0', key: 'apiKey', value: '', type: 'password' as const }]
  );

  // Dynamic endpoints
  const [endpoints, setEndpoints] = useState(
    initialData?.endpoints || [
      { id: 'endpoint-0', name: '', path: '', method: 'GET', description: '' }
    ]
  );

  // Dynamic headers
  const [headers, setHeaders] = useState<DynamicField[]>(
    initialData?.headers ? 
    Object.entries(initialData.headers).map(([key, value], index) => ({
      id: `header-${index}`,
      key,
      value: value as string,
      type: 'text'
    })) : 
    []
  );

  const addField = (type: 'config' | 'credential' | 'header') => {
    const newField: DynamicField = {
      id: `${type}-${Date.now()}`,
      key: '',
      value: '',
      type: 'text'
    };

    if (type === 'config') {
      setConfigFields([...configFields, newField]);
    } else if (type === 'credential') {
      setCredentialFields([...credentialFields, newField]);
    } else {
      setHeaders([...headers, newField]);
    }
  };

  const removeField = (id: string, type: 'config' | 'credential' | 'header') => {
    if (type === 'config') {
      setConfigFields(configFields.filter(f => f.id !== id));
    } else if (type === 'credential') {
      setCredentialFields(credentialFields.filter(f => f.id !== id));
    } else {
      setHeaders(headers.filter(f => f.id !== id));
    }
  };

  const updateField = (id: string, updates: Partial<DynamicField>, type: 'config' | 'credential' | 'header') => {
    if (type === 'config') {
      setConfigFields(configFields.map(f => f.id === id ? { ...f, ...updates } : f));
    } else if (type === 'credential') {
      setCredentialFields(credentialFields.map(f => f.id === id ? { ...f, ...updates } : f));
    } else {
      setHeaders(headers.map(f => f.id === id ? { ...f, ...updates } : f));
    }
  };

  const addEndpoint = () => {
    setEndpoints([...endpoints, {
      id: `endpoint-${Date.now()}`,
      name: '',
      path: '',
      method: 'GET',
      description: ''
    }]);
  };

  const removeEndpoint = (id: string) => {
    setEndpoints(endpoints.filter(e => e.id !== id));
  };

  const updateEndpoint = (id: string, field: string, value: string) => {
    setEndpoints(endpoints.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const handleSubmit = () => {
    // Convert dynamic fields to objects
    const configuration = configFields.reduce((acc, field) => {
      if (field.key && field.value) {
        acc[field.key] = field.value;
      }
      return acc;
    }, {} as any);

    const credentials = credentialFields.reduce((acc, field) => {
      if (field.key && field.value) {
        acc[field.key] = field.value;
      }
      return acc;
    }, {} as any);

    const headerObj = headers.reduce((acc, field) => {
      if (field.key && field.value) {
        acc[field.key] = field.value;
      }
      return acc;
    }, {} as any);

    const endpointsObj = endpoints.filter(e => e.name && e.path);

    const submitData = {
      ...formData,
      configuration,
      credentials,
      headers: Object.keys(headerObj).length > 0 ? headerObj : null,
      endpoints: endpointsObj
    };

    onSubmit(submitData);
  };

  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              API Name *
            </label>
            <Input
              placeholder="e.g., My Fuel API, Transport Service"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type
            </label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({...formData, type: value})}
            >
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select or type custom" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white z-50 max-h-[200px] overflow-y-auto">
                <SelectItem value="transport">Transport/Logistics</SelectItem>
                <SelectItem value="fuel">Fuel Services</SelectItem>
                <SelectItem value="weather">Weather</SelectItem>
                <SelectItem value="maps">Maps/Navigation</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="tracking">Tracking</SelectItem>
                <SelectItem value="payments">Payments</SelectItem>
                <SelectItem value="custom">Custom/Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Provider
            </label>
            <Input
              placeholder="e.g., OMV, Petrom, My Company"
              value={formData.provider}
              onChange={(e) => setFormData({...formData, provider: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Documentation URL
            </label>
            <Input
              type="url"
              placeholder="https://docs.yourapi.com"
              value={formData.documentation}
              onChange={(e) => setFormData({...formData, documentation: e.target.value})}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <Textarea
            placeholder="Describe what this API provides and how you plan to use it..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="bg-gray-800 border-gray-700 text-white"
            rows={3}
          />
        </div>
      </div>

      {/* Configuration Fields */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Configuration</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addField('config')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Field
          </Button>
        </div>
        
        <div className="space-y-3">
          {configFields.map((field) => (
            <div key={field.id} className="flex gap-2 items-start">
              <Input
                placeholder="Field name (e.g., baseUrl, timeout)"
                value={field.key}
                onChange={(e) => updateField(field.id, { key: e.target.value }, 'config')}
                className="bg-gray-800 border-gray-700 text-white flex-1"
              />
              <Input
                type={field.type}
                placeholder="Value"
                value={field.value}
                onChange={(e) => updateField(field.id, { value: e.target.value }, 'config')}
                className="bg-gray-800 border-gray-700 text-white flex-1"
              />
              <Select
                value={field.type}
                onValueChange={(value: any) => updateField(field.id, { type: value }, 'config')}
              >
                <SelectTrigger className="w-24 bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white z-50 max-h-[200px] overflow-y-auto">
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeField(field.id, 'config')}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Credentials */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Credentials</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addField('credential')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Credential
          </Button>
        </div>
        
        <div className="space-y-3">
          {credentialFields.map((field) => (
            <div key={field.id} className="flex gap-2 items-start">
              <Input
                placeholder="Credential name (e.g., apiKey, username)"
                value={field.key}
                onChange={(e) => updateField(field.id, { key: e.target.value }, 'credential')}
                className="bg-gray-800 border-gray-700 text-white flex-1"
              />
              <div className="relative flex-1">
                <Input
                  type={field.type}
                  placeholder="Value"
                  value={field.value}
                  onChange={(e) => updateField(field.id, { value: e.target.value }, 'credential')}
                  className="bg-gray-800 border-gray-700 text-white pr-10"
                />
                {field.type === 'password' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => updateField(field.id, { 
                      type: field.type === 'password' ? 'text' : 'password' 
                    }, 'credential')}
                  >
                    {field.type === 'password' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                )}
              </div>
              <Select
                value={field.type}
                onValueChange={(value: any) => updateField(field.id, { type: value }, 'credential')}
              >
                <SelectTrigger className="w-32 bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white z-50 max-h-[200px] overflow-y-auto">
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="password">Password</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeField(field.id, 'credential')}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Endpoints */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">API Endpoints</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEndpoint}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Endpoint
          </Button>
        </div>
        
        <div className="space-y-4">
          {endpoints.map((endpoint) => (
            <div key={endpoint.id} className="terminal-border rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  placeholder="Endpoint name"
                  value={endpoint.name}
                  onChange={(e) => updateEndpoint(endpoint.id, 'name', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <Input
                  placeholder="/api/v1/data"
                  value={endpoint.path}
                  onChange={(e) => updateEndpoint(endpoint.id, 'path', e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <div className="flex gap-2">
                  <Select
                    value={endpoint.method}
                    onValueChange={(value) => updateEndpoint(endpoint.id, 'method', value)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white z-50 max-h-[200px] overflow-y-auto">
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEndpoint(endpoint.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Input
                placeholder="Description of what this endpoint does"
                value={endpoint.description}
                onChange={(e) => updateEndpoint(endpoint.id, 'description', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Custom Headers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Custom Headers (Optional)</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addField('header')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Header
          </Button>
        </div>
        
        <div className="space-y-3">
          {headers.map((field) => (
            <div key={field.id} className="flex gap-2 items-start">
              <Input
                placeholder="Header name (e.g., X-Custom-Header)"
                value={field.key}
                onChange={(e) => updateField(field.id, { key: e.target.value }, 'header')}
                className="bg-gray-800 border-gray-700 text-white flex-1"
              />
              <Input
                placeholder="Header value"
                value={field.value}
                onChange={(e) => updateField(field.id, { value: e.target.value }, 'header')}
                className="bg-gray-800 border-gray-700 text-white flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeField(field.id, 'header')}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
          Save API Integration
        </Button>
      </div>

      {/* Info Box */}
      <div className="terminal-border rounded-lg p-4 bg-gray-900">
        <div className="flex items-start space-x-2">
          <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-300">
            <p className="font-medium text-white mb-1">Your API, Your Control</p>
            <p>
              You maintain full control over your API credentials and costs. 
              FleetMind only orchestrates the connections and optimizations - 
              all API calls are made directly from your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 