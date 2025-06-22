'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { DispatcherAnalysis, DispatcherSuggestion } from '@/lib/dispatcher-types';
import { toast } from 'sonner';
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
  | { type: 'SET_ANALYSIS'; payload: DispatcherAnalysis | null }
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
  const { user, isSignedIn } = useUser();


  const refreshAnalysis = useCallback(async () => {
    if (!isSignedIn || !user?.id || !state.isDispatcherActive) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Fetch analysis from API
      const response = await fetch('/api/dispatcher/analysis');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn('Dispatcher API failed:', errorData.details || 'No details available');
        // Set default empty analysis instead of error
        dispatch({ type: 'SET_ANALYSIS', payload: null });
        return;
      }
      
      const analysis = await response.json();
      dispatch({ type: 'SET_ANALYSIS', payload: analysis });

      // Only attempt to generate message if analysis was successful
      if (analysis) {
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
      }

    } catch (error) {
      console.warn('Network error in dispatcher:', error);
      // Set default state instead of error
      dispatch({
        type: 'SET_ANALYSIS',
        payload: null
      });
      dispatch({ type: 'SET_MESSAGE', payload: 'Dispatcher temporarily offline.' });
    }
  }, [user?.id, isSignedIn, state.isDispatcherActive]);

  const acceptSuggestion = useCallback(async (suggestionId: string): Promise<boolean> => {
    if (!isSignedIn || !user?.id) return false;

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
      
      // Remove the accepted suggestion from local state
      dispatch({ type: 'ACCEPT_SUGGESTION', payload: { suggestionId } });
      
      toast.success("✅ Suggestion Accepted: Task has been queued for execution");
      
      return true;
    } catch (error) {
      console.error('Error accepting suggestion:', error);
      return false;
    }
  }, [user?.id]);

  // DISABLED: Auto-refresh moved to centralized polling service
  useEffect(() => {
    if (!isSignedIn || !user?.id) return;

    // Initial load only - no more auto-refresh intervals
    refreshAnalysis();
    
    console.log('Dispatcher Context: Auto-refresh disabled - using centralized polling service');
  }, [user?.id, refreshAnalysis]);

  // Load alerts on mount
  useEffect(() => {
    const loadAlerts = async () => {
      if (!isSignedIn || !user?.id) return;
      
      // Load system alerts logic here if needed
    };
    
    loadAlerts();
  }, [user?.id]);

  // Initialize dispatcher on mount
  useEffect(() => {
    if (isSignedIn && user?.id && state.isDispatcherActive) {
      refreshAnalysis();
    }
  }, [isSignedIn, user?.id, state.isDispatcherActive, refreshAnalysis]);

  // Handle user changes
  useEffect(() => {
    if (!isSignedIn || !user?.id) {
      dispatch({ type: 'SET_ANALYSIS', payload: null });
      dispatch({ type: 'SET_MESSAGE', payload: 'Please sign in to access dispatcher.' });
      dispatch({ type: 'SET_ALERTS', payload: [] });
    }
  }, [isSignedIn, user?.id]);

  const toggleDispatcher = useCallback((active: boolean) => {
    dispatch({ type: 'TOGGLE_DISPATCHER', payload: active });
    if (active && isSignedIn && user?.id) {
      refreshAnalysis();
    }
  }, [isSignedIn, user?.id, refreshAnalysis]);

  const getTopSuggestions = (count: number = 3): DispatcherSuggestion[] => {
    return state.analysis?.suggestions?.slice(0, count) || [];
  };

  const markOpportunitiesSeen = useCallback(() => {
    dispatch({ type: 'MARK_OPPORTUNITIES_SEEN' });
  }, []);

  const toggleLiveNotifications = useCallback((enabled: boolean) => {
    dispatch({ type: 'TOGGLE_LIVE_NOTIFICATIONS', payload: enabled });
    
    if (enabled) {
      toast.success("🔔 Live Notifications Enabled - You'll receive real-time updates!");
    } else {
      toast.info("🔕 Live Notifications Disabled");
    }
      }, []);

  const value: DispatcherContextType = {
    state,
    dispatch,
    refreshAnalysis,
    acceptSuggestion,
    toggleDispatcher,
    getTopSuggestions,
    markOpportunitiesSeen,
    toggleLiveNotifications
  };

  return (
    <DispatcherContext.Provider value={value}>
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
