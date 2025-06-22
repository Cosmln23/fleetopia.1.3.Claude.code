'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Bot,
  TrendingUp,
  Truck,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Euro,
  MapPin,
  Zap,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  MessageSquare,
  BarChart3,
  Settings,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useDispatcher, useDispatcherMetrics } from '@/hooks/use-dispatcher';
import { useDispatcherContext } from '@/contexts/dispatcher-context';
import { toast } from 'sonner';

interface DispatcherPanelProps {
  className?: string;
  compact?: boolean;
}

const DispatcherPanel = React.memo(function DispatcherPanel({ className = '', compact = false }: DispatcherPanelProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // ALWAYS call hooks in the same order - before any returns
  const {
    analysis,
    isLoading,
    error,
    isActive,
    personalizedMessage,
    topSuggestions,
    stats,
    hasAlerts,
    alertCount,
    refresh,
    toggle,
    acceptSuggestion,
    getFormattedProfit,
    getStatusMessage
  } = useDispatcher();

  const metrics = useDispatcherMetrics();

  const { state: dispatcherState, markOpportunitiesSeen, toggleLiveNotifications } = useDispatcherContext();

  // Always define all hooks at the top level - before any early returns
  const handleToggleLiveNotifications = () => {
    const newState = !dispatcherState.liveNotificationsEnabled;
    toggleLiveNotifications(newState);
    
    if (newState) {
      toast.success("🔔 Live notifications enabled");
    } else {
      toast.info("🔕 Live notifications disabled");
    }
  };

  const handleAcceptSuggestion = async (suggestionId: string) => {
    try {
      const success = await acceptSuggestion(suggestionId);
      if (success) {
        toast.success("✅ Suggestion accepted and queued for execution");
      } else {
        toast.error("Failed to accept suggestion");
      }
    } catch (error) {
      toast.error("Error accepting suggestion");
    }
  };

  const getPriorityColor = useCallback((priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  }, []);

  const getPriorityIcon = useCallback((priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  }, []);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // DISABLED: Auto-refresh moved to centralized polling service
  useEffect(() => {
    // Initial fetch only - no more auto-refresh intervals
    refresh();
    
    console.log('Dispatcher Panel: Auto-refresh disabled - using centralized polling service');
  }, [refresh]);

  // Don't render until mounted to prevent hydration issues
  if (!isMounted) {
    return (
      <Card className="border-2 border-blue-200 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Bot className="h-6 w-6 text-gray-400" />
            <div>
              <CardTitle className="text-lg">Fleet Dispatcher AI</CardTitle>
              <CardDescription>Loading...</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className={`${className}`}>
      <Card className="border-2 border-blue-200 shadow-lg bg-gray-900">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className={`h-6 w-6 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
              <div>
                <CardTitle className="text-lg text-gray-100">Fleet Dispatcher AI</CardTitle>
                <CardDescription className="text-gray-300">{getStatusMessage()}</CardDescription>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {dispatcherState.hasNewOpportunities && (
                <Badge 
                  variant="default" 
                  className="animate-pulse bg-green-500 hover:bg-green-600 cursor-pointer"
                  onClick={() => markOpportunitiesSeen()}
                >
                  🔥 NEW
                </Badge>
              )}
              
              {hasAlerts && (
                <Badge variant="destructive" className="animate-pulse">
                  {alertCount} alert{alertCount !== 1 ? 's' : ''}
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={refresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-300">Dispatcher Active:</span>
                <Switch checked={isActive} onCheckedChange={toggle} />
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-300">Live Alerts:</span>
                <Switch 
                  checked={dispatcherState.liveNotificationsEnabled} 
                  onCheckedChange={handleToggleLiveNotifications} 
                />
              </div>
            </div>
            
            {metrics && (
              <div className="text-sm text-gray-300">
                Efficiency: {metrics.efficiencyScore}%
              </div>
            )}
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-4">
          {/* Personalized Message */}
          {isActive && personalizedMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 p-3 rounded-lg border border-blue-200"
            >
              <div className="flex items-start space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-800 leading-relaxed">
                  {personalizedMessage}
                </p>
              </div>
            </motion.div>
          )}

          {/* Quick Stats */}
          {isActive && analysis && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-900/30 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Euro className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Today's Profit</span>
                </div>
                <p className="text-lg font-bold text-green-700">
                  {getFormattedProfit(stats.profitToday)}
                </p>
              </div>
              
              <div className="bg-blue-900/30 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Vehicles</span>
                </div>
                <p className="text-lg font-bold text-blue-700">
                  {analysis.availableVehicles} available
                </p>
              </div>
            </div>
          )}

          {/* Alerts */}
          {hasAlerts && isActive && (
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span>View {alertCount} Alert{alertCount !== 1 ? 's' : ''}</span>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-2 mt-2">
                {analysis?.alerts.map((alert, index) => (
                  <div key={index} className="bg-orange-900/30 p-2 rounded border border-orange-400/30">
                    <p className="text-sm text-orange-200">{alert}</p>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Top Suggestions */}
          {isExpanded && isActive && topSuggestions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Top Opportunities</span>
                </h4>
                
                <Dialog open={showDetails} onOpenChange={setShowDetails}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Dispatcher Analytics</DialogTitle>
                      <DialogDescription>
                        Detailed analysis and metrics for your fleet operations
                      </DialogDescription>
                    </DialogHeader>
                    
                    {metrics && (
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Performance Metrics</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex justify-between">
                              <span>Efficiency Score:</span>
                              <span className="font-bold">{metrics.efficiencyScore}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Vehicle Utilization:</span>
                              <span className="font-bold">{metrics.vehicleUtilization.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Market Opportunities:</span>
                              <span className="font-bold">{metrics.marketOpportunities}</span>
                            </div>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Financial Overview</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex justify-between">
                              <span>Today's Profit:</span>
                              <span className="font-bold text-green-600">
                                {getFormattedProfit(stats.profitToday)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Avg per Suggestion:</span>
                              <span className="font-bold">
                                {getFormattedProfit(stats.averageProfitPerSuggestion)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>High Priority:</span>
                              <span className="font-bold text-red-600">
                                {stats.highPrioritySuggestions}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-2">
                {topSuggestions.map((suggestion) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border border-gray-600 rounded-lg p-3 bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge 
                          className={`${getPriorityColor(suggestion.priority)} text-white`}
                        >
                          {getPriorityIcon(suggestion.priority)}
                          {suggestion.priority}
                        </Badge>
                        <span className="font-medium text-green-400">
                          {getFormattedProfit(suggestion.estimatedProfit)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-400">
                        {suggestion.confidence}% confidence
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <h4 className="font-medium text-gray-100">{suggestion.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                        <div className="flex items-center space-x-1">
                          <Truck className="h-3 w-3" />
                          <span>{suggestion.vehicleName} ({suggestion.vehicleLicensePlate})</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{suggestion.estimatedDistance}km</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{suggestion.estimatedDuration}h</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-400 mb-3">
                      {suggestion.reasoning}
                    </p>
                    
                    <Button 
                      onClick={() => handleAcceptSuggestion(suggestion.id)}
                      className="w-full"
                      size="sm"
                    >
                      Accept Opportunity
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {isActive && topSuggestions.length === 0 && !isLoading && (
            <div className="text-center py-6 text-gray-400">
              <Package className="h-12 w-12 mx-auto mb-2 text-gray-500" />
              <p className="text-sm">No opportunities available right now</p>
              <p className="text-xs text-gray-500 mt-1">Check back in a few minutes</p>
            </div>
          )}

          {/* Offline State */}
          {!isActive && (
            <div className="text-center py-6 text-gray-400">
              <Bot className="h-12 w-12 mx-auto mb-2 text-gray-500" />
              <p className="text-sm">Dispatcher is offline</p>
              <p className="text-xs text-gray-500 mt-1">Enable to start receiving suggestions</p>
            </div>
          )}
        </CardContent>
        )}
      </Card>
    </div>
  );
});

// Compact version for smaller spaces - memoized
const CompactDispatcherPanel = React.memo(function CompactDispatcherPanel({ className = '' }: { className?: string }) {
  return <DispatcherPanel className={className} compact={true} />;
});

// Quick stats only version - memoized
const DispatcherStats = React.memo(function DispatcherStats({ className = '' }: { className?: string }) {
  const { stats, analysis, getFormattedProfit } = useDispatcher();
  
  if (!analysis) return null;

  return (
    <div className={`flex space-x-4 ${className}`}>
      <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
        <Euro className="h-4 w-4 text-green-600" />
        <span className="font-medium text-green-700">
          {getFormattedProfit(stats.profitToday)}
        </span>
      </div>
      
      <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
        <Truck className="h-4 w-4 text-blue-600" />
        <span className="font-medium text-blue-700">
          {analysis.availableVehicles} vehicles
        </span>
      </div>
      
      <div className="flex items-center space-x-2 bg-purple-50 px-3 py-2 rounded-lg">
        <Package className="h-4 w-4 text-purple-600" />
        <span className="font-medium text-purple-700">
          {analysis.suggestions.length} opportunities
        </span>
      </div>
    </div>
  );
});

export { DispatcherPanel, CompactDispatcherPanel, DispatcherStats };
