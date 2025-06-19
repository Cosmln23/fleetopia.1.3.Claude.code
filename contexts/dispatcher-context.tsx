'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode, useState } from 'react';
import { useSession } from 'next-auth/react';
import { DispatcherAnalysis, DispatcherSuggestion } from '@/lib/dispatcher-types';
import { useSSE } from '@/hooks/use-sse';
import { useToast } from '@/components/ui/use-toast';
import { SystemAlert } from '@prisma/client';

interface DispatcherState {
  analysis: DispatcherAnalysis | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isDispatcherActive: boolean;
  personalizedMessage: string;
  hasNewOpportunities: boolean;
  liveNotificationsEnabled: boolean;
  alerts: SystemAlert[];
}

type DispatcherAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ANALYSIS'; payload: DispatcherAnalysis }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'TOGGLE_DISPATCHER'; payload: boolean }
  | { type: 'SET_MESSAGE'; payload: string }
  | { type: 'ACCEPT_SUGGESTION'; payload: { suggestionId: string } }
  | { type: 'REFRESH_DATA' }
  | { type: 'NEW_OPPORTUNITY'; payload?: any }
  | { type: 'MARK_OPPORTUNITIES_SEEN' }
  | { type: 'TOGGLE_LIVE_NOTIFICATIONS'; payload: boolean }
  | { type: 'SET_ALERTS'; payload: SystemAlert[] };

const initialState: DispatcherState = {
  analysis: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
  isDispatcherActive: true,
  personalizedMessage: 'Initializing AI dispatcher...',
  hasNewOpportunities: false,
  liveNotificationsEnabled: true,
  alerts: []
};

function dispatcherReducer(state: DispatcherState, action: DispatcherAction): DispatcherState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ANALYSIS':
      return {
        ...state,
        analysis: action.payload,
        isLoading: false,
        error: null,
        lastUpdated: new Date()
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    
    case 'TOGGLE_DISPATCHER':
      return {
        ...state,
        isDispatcherActive: action.payload
      };
    
    case 'SET_MESSAGE':
      return {
        ...state,
        personalizedMessage: action.payload
      };
    
    case 'ACCEPT_SUGGESTION':
      // Remove accepted suggestion from analysis
      if (state.analysis) {
        const updatedSuggestions = state.analysis.suggestions.filter(
          s => s.id !== action.payload.suggestionId
        );
        return {
          ...state,
          analysis: {
            ...state.analysis,
            suggestions: updatedSuggestions
          }
        };
      }
      return state;
    
    case 'REFRESH_DATA':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case 'NEW_OPPORTUNITY':
      return {
        ...state,
        hasNewOpportunities: true
      };
    
    case 'MARK_OPPORTUNITIES_SEEN':
      return {
        ...state,
        hasNewOpportunities: false
      };
    
    case 'TOGGLE_LIVE_NOTIFICATIONS':
      return {
        ...state,
        liveNotificationsEnabled: action.payload
      };
    
    case 'SET_ALERTS':
      return {
        ...state,
        alerts: action.payload
      };
    
    default:
      return state;
  }
}

interface DispatcherContextType {
  state: DispatcherState;
  dispatch: React.Dispatch<DispatcherAction>;
  refreshAnalysis: () => Promise<void>;
  acceptSuggestion: (suggestionId: string) => Promise<boolean>;
  toggleDispatcher: (active: boolean) => void;
  getTopSuggestions: (count?: number) => DispatcherSuggestion[];
  markOpportunitiesSeen: () => void;
  toggleLiveNotifications: (enabled: boolean) => void;
}

const DispatcherContext = createContext<DispatcherContextType | undefined>(undefined);

interface DispatcherProviderProps {
  children: ReactNode;
}

export function DispatcherProvider({ children }: DispatcherProviderProps) {
  const [state, dispatch] = useReducer(dispatcherReducer, initialState);
  const { data: session } = useSession();
  const { toast } = useToast();

  // Real-time notifications via SSE
  const sseEventHandlers = {
    'new-cargo': (data: any) => {
      if (state.liveNotificationsEnabled && state.isDispatcherActive) {
        dispatch({ type: 'NEW_OPPORTUNITY' });
        
        toast({
          title: "🚨 New Opportunity!",
          description: `${data.title} (${data.fromCountry} → ${data.toCountry}) - €${data.price}`,
          className: "bg-blue-500 text-white",
        });
        
        // Auto-refresh analysis to include new cargo
        setTimeout(() => refreshAnalysis(), 1000);
      }
    },
    'connected': (data: any) => {
      console.log('Dispatcher notifications connected:', data.message);
    },
    'ping': () => {
      // Keep-alive, no action needed
    }
  };

  useSSE('/api/dispatcher/events', sseEventHandlers);

  const refreshAnalysis = useCallback(async () => {
    if (!session?.user?.id || !state.isDispatcherActive) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Fetch analysis from API
      const response = await fetch('/api/dispatcher/analysis');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn('Dispatcher API failed:', errorData.details || 'No details available');
        // Set default empty analysis instead of error
        dispatch({ type: 'SET_ANALYSIS', payload: {
          availableVehicles: 0,
          newOffers: 0,
          todayProfit: 0,
          suggestions: [],
          alerts: ['Dispatcher data not available. Add vehicles to activate.']
        }});
        return;
      }
      
      const analysis = await response.json();
      dispatch({ type: 'SET_ANALYSIS', payload: analysis });

      // Generate personalized message - skip if first call fails
      try {
        const messageResponse = await fetch('/api/dispatcher/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analysis })
        });
        
        if (messageResponse.ok) {
          const { message } = await messageResponse.json();
          dispatch({ type: 'SET_MESSAGE', payload: message });
        } else {
          dispatch({ type: 'SET_MESSAGE', payload: 'Dispatcher ready for analysis.' });
        }
      } catch (msgError) {
        dispatch({ type: 'SET_MESSAGE', payload: 'Dispatcher ready for analysis.' });
      }

    } catch (error) {
      console.warn('Network error in dispatcher:', error);
      // Set default state instead of error
      dispatch({ type: 'SET_ANALYSIS', payload: {
        availableVehicles: 0,
        newOffers: 0,
        todayProfit: 0,
        suggestions: [],
        alerts: ['Dispatcher offline. Check connection.']
      }});
      dispatch({ type: 'SET_MESSAGE', payload: 'Dispatcher temporarily offline.' });
    }
  }, [session?.user?.id, state.isDispatcherActive]);

  const acceptSuggestion = useCallback(async (suggestionId: string): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      const response = await fetch('/api/dispatcher/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestionId })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error('Accept suggestion failed:', result.error);
        return false;
      }
      
      if (result.success) {
        dispatch({ type: 'ACCEPT_SUGGESTION', payload: { suggestionId } });
        // Refresh data after accepting suggestion to show updated vehicle/cargo states
        setTimeout(refreshAnalysis, 1000);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error accepting suggestion:', error);
      return false;
    }
  }, [session?.user?.id, refreshAnalysis]);

  const toggleDispatcher = useCallback((active: boolean) => {
    dispatch({ type: 'TOGGLE_DISPATCHER', payload: active });
    if (active) {
      refreshAnalysis();
    }
  }, [refreshAnalysis]);

  const getTopSuggestions = (count: number = 3): DispatcherSuggestion[] => {
    if (!state.analysis) return [];
    return state.analysis.suggestions.slice(0, count);
  };

  const markOpportunitiesSeen = useCallback(() => {
    dispatch({ type: 'MARK_OPPORTUNITIES_SEEN' });
  }, []);

  const toggleLiveNotifications = useCallback((enabled: boolean) => {
    dispatch({ type: 'TOGGLE_LIVE_NOTIFICATIONS', payload: enabled });
  }, []);

  const fetchAlerts = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch('/api/dispatcher/alerts');
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      
      const alerts = await response.json();
      dispatch({ type: 'SET_ALERTS', payload: alerts });
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    }
  }, [session]);

  // Auto-refresh dispatcher data
  useEffect(() => {
    if (session?.user?.id && state.isDispatcherActive) {
      refreshAnalysis();
    }
  }, [session?.user?.id, state.isDispatcherActive, refreshAnalysis]);

  // Handle session changes
  useEffect(() => {
    if (!session?.user?.id) {
      dispatch({ type: 'SET_ANALYSIS', payload: {
        availableVehicles: 0,
        newOffers: 0,
        todayProfit: 0,
        suggestions: [],
        alerts: ['Please log in to access dispatcher features']
      }});
      dispatch({ type: 'SET_MESSAGE', payload: 'Please log in to activate AI dispatcher' });
    }
  }, [session]);

  // Prevent hydration issues - only run on client
  const [isClient, setIsClient] = React.useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const contextValue: DispatcherContextType = {
    state,
    dispatch,
    refreshAnalysis,
    acceptSuggestion,
    toggleDispatcher,
    getTopSuggestions,
    markOpportunitiesSeen,
    toggleLiveNotifications
  };

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <DispatcherContext.Provider value={{
        state: initialState,
        dispatch: () => {},
        refreshAnalysis: async () => {},
        acceptSuggestion: async () => false,
        toggleDispatcher: () => {},
        getTopSuggestions: () => [],
        markOpportunitiesSeen: () => {},
        toggleLiveNotifications: () => {}
      }}>
        {children}
      </DispatcherContext.Provider>
    );
  }

  return (
    <DispatcherContext.Provider value={contextValue}>
      {children}
    </DispatcherContext.Provider>
  );
}

export function useDispatcherContext() {
  const context = useContext(DispatcherContext);
  if (context === undefined) {
    throw new Error('useDispatcherContext must be used within a DispatcherProvider');
  }
  return context;
}