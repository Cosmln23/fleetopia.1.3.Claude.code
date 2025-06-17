'use client';

import { useCallback, useMemo } from 'react';
import { useDispatcherContext } from '@/contexts/dispatcher-context';
import { DispatcherSuggestion } from '@/lib/dispatcher-types';

export interface DispatcherStats {
  profitToday: number;
  averageProfitPerSuggestion: number;
  highPrioritySuggestions: number;
  efficiencyScore: number;
}

export interface DispatcherHookReturn {
  // State
  analysis: ReturnType<typeof useDispatcherContext>['state']['analysis'];
  isLoading: boolean;
  error: string | null;
  isActive: boolean;
  lastUpdated: Date | null;
  personalizedMessage: string;

  // Actions
  refresh: () => Promise<void>;
  toggle: (active: boolean) => void;
  acceptSuggestion: (suggestionId: string) => Promise<boolean>;

  // Computed values
  topSuggestions: DispatcherSuggestion[];
  stats: DispatcherStats;
  hasAlerts: boolean;
  alertCount: number;
  
  // Helper methods
  getSuggestionById: (id: string) => DispatcherSuggestion | undefined;
  filterSuggestionsByPriority: (priority: 'high' | 'medium' | 'low') => DispatcherSuggestion[];
  getFormattedProfit: (profit: number) => string;
  getStatusMessage: () => string;
}

export function useDispatcher(): DispatcherHookReturn {
  const { state, refreshAnalysis, acceptSuggestion, toggleDispatcher } = useDispatcherContext();

  // Computed values
  const topSuggestions = useMemo(() => {
    if (!state.analysis) return [];
    return state.analysis.suggestions.slice(0, 3);
  }, [state.analysis]);

  const stats = useMemo((): DispatcherStats => {
    if (!state.analysis) {
      return {
        profitToday: 0,
        averageProfitPerSuggestion: 0,
        highPrioritySuggestions: 0,
        efficiencyScore: 0
      };
    }

    const { suggestions, todayProfit, availableVehicles, newOffers } = state.analysis;
    const highPriority = suggestions.filter(s => s.priority === 'high').length;
    const avgProfit = suggestions.length > 0 
      ? suggestions.reduce((acc, s) => acc + s.estimatedProfit, 0) / suggestions.length 
      : 0;
    
    // Calculate efficiency score (0-100) based on real metrics
    const efficiency = Math.min(100, Math.max(0, 
      (suggestions.length * 15) + // 15 points per suggestion
      (highPriority * 20) + // 20 extra points per high priority
      (availableVehicles > 0 ? 30 : 0) + // 30 points for having available vehicles
      (newOffers * 5) // 5 points per new opportunity
    ));

    return {
      profitToday: todayProfit,
      averageProfitPerSuggestion: Math.round(avgProfit),
      highPrioritySuggestions: highPriority,
      efficiencyScore: Math.round(efficiency)
    };
  }, [state.analysis]);

  const hasAlerts = useMemo(() => {
    return state.analysis ? state.analysis.alerts.length > 0 : false;
  }, [state.analysis]);

  const alertCount = useMemo(() => {
    return state.analysis?.alerts.length || 0;
  }, [state.analysis]);

  // Helper methods
  const getSuggestionById = useCallback((id: string): DispatcherSuggestion | undefined => {
    return state.analysis?.suggestions.find(s => s.id === id);
  }, [state.analysis]);

  const filterSuggestionsByPriority = useCallback((priority: 'high' | 'medium' | 'low'): DispatcherSuggestion[] => {
    if (!state.analysis) return [];
    return state.analysis.suggestions.filter(s => s.priority === priority);
  }, [state.analysis]);

  const getFormattedProfit = useCallback((profit: number): string => {
    if (profit >= 1000) {
      return `€${(profit / 1000).toFixed(1)}k`;
    }
    return `€${profit}`;
  }, []);

  const getStatusMessage = useCallback((): string => {
    if (!state.isDispatcherActive) {
      return 'Dispatcher is offline';
    }
    
    if (state.isLoading) {
      return 'Analyzing opportunities...';
    }
    
    if (state.error) {
      return 'Error loading data';
    }
    
    if (!state.analysis) {
      return 'No data available';
    }

    const { availableVehicles, newOffers, suggestions } = state.analysis;
    
    if (availableVehicles === 0) {
      return 'All vehicles are busy';
    }
    
    if (suggestions.length === 0) {
      return 'No suitable opportunities found';
    }
    
    return `${suggestions.length} opportunities found`;
  }, [state]);

  // Actions with error handling
  const refresh = useCallback(async () => {
    try {
      await refreshAnalysis();
    } catch (error) {
      console.error('Failed to refresh dispatcher:', error);
    }
  }, [refreshAnalysis]);

  const toggle = useCallback((active: boolean) => {
    toggleDispatcher(active);
  }, [toggleDispatcher]);

  const acceptSuggestionWithFeedback = useCallback(async (suggestionId: string): Promise<boolean> => {
    try {
      return await acceptSuggestion(suggestionId);
    } catch (error) {
      console.error('Failed to accept suggestion:', error);
      return false;
    }
  }, [acceptSuggestion]);

  return {
    // State
    analysis: state.analysis,
    isLoading: state.isLoading,
    error: state.error,
    isActive: state.isDispatcherActive,
    lastUpdated: state.lastUpdated,
    personalizedMessage: state.personalizedMessage,

    // Actions
    refresh,
    toggle,
    acceptSuggestion: acceptSuggestionWithFeedback,

    // Computed values
    topSuggestions,
    stats,
    hasAlerts,
    alertCount,

    // Helper methods
    getSuggestionById,
    filterSuggestionsByPriority,
    getFormattedProfit,
    getStatusMessage
  };
}

// Additional specialized hooks
export function useDispatcherSuggestions(priority?: 'high' | 'medium' | 'low') {
  const { analysis } = useDispatcherContext();
  
  return useMemo(() => {
    if (!analysis) return [];
    return priority 
      ? analysis.suggestions.filter(s => s.priority === priority)
      : analysis.suggestions;
  }, [analysis, priority]);
}

export function useDispatcherAlerts() {
  const { analysis } = useDispatcherContext();
  
  return useMemo(() => {
    return analysis?.alerts || [];
  }, [analysis]);
}

export function useDispatcherMetrics() {
  const { stats, analysis } = useDispatcher();
  
  return useMemo(() => {
    if (!analysis) return null;
    
    return {
      ...stats,
      vehicleUtilization: analysis.availableVehicles > 0 
        ? ((analysis.availableVehicles - analysis.suggestions.length) / analysis.availableVehicles) * 100
        : 0,
      marketOpportunities: analysis.newOffers,
      responseTime: '< 30s', // Static for now
      successRate: '85%' // Static for now
    };
  }, [stats, analysis]);
}