'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, Star, Download, Eye, Settings, Shield, Zap, 
  TrendingUp, Users, Clock, CheckCircle, AlertTriangle,
  Play, Pause, Trash2, Edit, ExternalLink, Brain,
  ChevronRight,
  Fuel
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface EnhancedAIAgent {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  capabilities: string[];
  marketplace: boolean;
  price?: number;
  rating: number;
  downloads: number;
  performance: {
    accuracy: number;
    speed: number;
    reliability: number;
    security: number;
  };
  status: 'active' | 'inactive' | 'pending';
  isTemplate: boolean;
  requiresAPI: string[];
  owner: {
    name: string;
    verified: boolean;
  };
  lastUpdated: Date;
  validationScore: number;
  connectedAPIs?: number;
  activeConnections?: number;
  comingSoon?: boolean;
}

interface AgentCardEnhancedProps {
  agent: EnhancedAIAgent;
  view: 'marketplace' | 'my-agents' | 'connected';
  onDownload?: (agentId: string) => void;
  onConnect?: (agentId: string) => void;
  onEdit?: (agentId: string) => void;
  onDelete?: (agentId: string) => void;
  onToggleStatus?: (agentId: string) => void;
  onViewDetails?: (agentId: string) => void;
}

export function AgentCardEnhanced({ 
  agent, 
  view, 
  onDownload, 
  onConnect, 
  onEdit, 
  onDelete,
  onToggleStatus,
  onViewDetails 
}: AgentCardEnhancedProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllCapabilities, setShowAllCapabilities] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'FREE';
    return `€${price}/month`;
  };

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="terminal-border rounded-lg p-6 bg-gray-900 hover:bg-gray-800 transition-colors relative"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-blue-400" />
              </div>
              <div className={`absolute -top-1 -right-1 w-3 h-3 ${getStatusColor(agent.status)} rounded-full border-2 border-gray-900`}></div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                {agent.owner.verified && (
                  <Tooltip>
                    <TooltipTrigger>
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                    </TooltipTrigger>
                    <TooltipContent>Verified Publisher</TooltipContent>
                  </Tooltip>
                )}
                {agent.isTemplate && (
                  <Badge variant="outline" className="text-xs">Template</Badge>
                )}
              </div>
              
              <p className="text-sm text-gray-400 mb-2">{agent.description}</p>
              
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>v{agent.version}</span>
                <span>by {agent.owner.name}</span>
                <span>{agent.category}</span>
              </div>
            </div>
          </div>

          {/* Price/Status */}
          <div className="text-right">
            <div className="text-lg font-semibold text-white mb-1">
              {formatPrice(agent.price)}
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-300">{agent.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-center">
          <div>
            <div className="text-sm font-medium text-white">{agent.downloads}</div>
            <div className="text-xs text-gray-400">Downloads</div>
          </div>
          <div>
            <div className={`text-sm font-medium ${getPerformanceColor(agent.validationScore)}`}>
              {agent.validationScore}%
            </div>
            <div className="text-xs text-gray-400">Score</div>
          </div>
          {view === 'connected' && (
            <>
              <div>
                <div className="text-sm font-medium text-white">{agent.connectedAPIs || 0}</div>
                <div className="text-xs text-gray-400">APIs</div>
              </div>
              <div>
                <div className="text-sm font-medium text-green-400">{agent.activeConnections || 0}</div>
                <div className="text-xs text-gray-400">Active</div>
              </div>
            </>
          )}
          {view !== 'connected' && (
            <>
              <div>
                <div className="text-sm font-medium text-white">{agent.performance.accuracy}%</div>
                <div className="text-xs text-gray-400">Accuracy</div>
              </div>
              <div>
                <div className="text-sm font-medium text-white">{agent.performance.security}%</div>
                <div className="text-xs text-gray-400">Security</div>
              </div>
            </>
          )}
        </div>

        {/* Capabilities */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {(showAllCapabilities ? agent.capabilities : agent.capabilities.slice(0, 3)).map((capability, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {capability}
              </Badge>
            ))}
            {agent.capabilities.length > 3 && (
              <Badge 
                variant="outline" 
                className="text-xs cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => setShowAllCapabilities(!showAllCapabilities)}
              >
                {showAllCapabilities ? 'Show less' : `+${agent.capabilities.length - 3} more`}
              </Badge>
            )}
          </div>
        </div>

        {/* Required APIs */}
        {agent.requiresAPI.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-gray-400 mb-2">Requires APIs:</div>
            <div className="flex flex-wrap gap-1">
              {agent.requiresAPI.map((api, index) => (
                <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-800 text-gray-300">
                  <Zap className="w-3 h-3 mr-1" />
                  {api}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expanded Details */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-700 pt-4 mt-4 space-y-3"
          >
            {/* Performance Metrics */}
            <div>
              <div className="text-sm font-medium text-white mb-2">Performance Metrics</div>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(agent.performance).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-xs text-gray-400 capitalize">{key}:</span>
                    <span className={`text-xs font-medium ${getPerformanceColor(value)}`}>
                      {value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Last Updated */}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Last updated: {agent.lastUpdated.toLocaleDateString()}</span>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{agent.lastUpdated.toLocaleTimeString()}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {isExpanded ? 'Less' : 'Details'}
          </Button>

          <div className="flex space-x-2">
            {view === 'marketplace' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails?.(agent.id)}
                  className={agent.id === '2' ? "bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-blue-500/30 hover:from-blue-600/30 hover:to-cyan-600/30" : ""}
                  title={agent.id === '2' ? "View FuelMaster AI Complete Systems" : "View details"}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                
                <Button
                  size="sm"
                  onClick={() => onDownload?.(agent.id)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {agent.price ? 'Buy' : 'Install'}
                </Button>
              </>
            )}

            {view === 'my-agents' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToggleStatus?.(agent.id)}
                >
                  {agent.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit?.(agent.id)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete?.(agent.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}

            {view === 'connected' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails?.(agent.id)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => onConnect?.(agent.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Connect API
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Warning/Alert Bar */}
        {agent.validationScore < 70 && (
          <div className="mt-3 p-2 bg-red-900/20 border border-red-700 rounded flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-xs text-red-300">
              Low validation score - review before production use
            </span>
          </div>
        )}

        {/* Coming Soon Overlay */}
        {agent.comingSoon && (
          <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-500/30">
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
              <p className="text-gray-400 text-sm">Agent under development</p>
              <Badge className="mt-2 bg-blue-500/20 text-blue-400 border-blue-500/30">Available Soon</Badge>
            </div>
          </div>
        )}
      </motion.div>
    </TooltipProvider>
  );
} 