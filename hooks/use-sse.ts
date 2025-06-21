'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface PollingEventHandler {
  [event: string]: (data: any) => void;
}

// Replace SSE with polling for better Vercel compatibility
export function useSSE(url: string, eventHandlers: PollingEventHandler) {
  const { user, isSignedIn } = useUser();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef(false);
  const [isConnected, setIsConnected] = useState(false);
  const lastDataRef = useRef<any>(null);
  const [cargoCount, setCargoCount] = useState(0);
  const consecutiveErrorsRef = useRef(0);

  const poll = useCallback(async () => {
    if (!isSignedIn || !user?.id || isUnmountedRef.current) {
      setIsConnected(false);
      return;
    }

    try {
      console.log('Polling dispatcher events...');
      const response = await fetch(url);
      
      if (!response.ok) {
        consecutiveErrorsRef.current++;
        console.error('Polling failed:', response.status);
        setIsConnected(false);
        return;
      }

      const data = await response.json();
      consecutiveErrorsRef.current = 0; // Reset error counter on success
      setIsConnected(true);
      
      // Update cargo count for smart polling
      if (data.data?.cargoCount !== undefined) {
        setCargoCount(data.data.cargoCount);
      }

      // Simulate SSE connected event on first successful poll
      if (!lastDataRef.current && eventHandlers['connected']) {
        eventHandlers['connected']({ 
          message: `Dispatcher notifications connected (${data.data?.cargoCount || 0} cargo available)`,
          timestamp: new Date().toISOString()
        });
      }

      // Check for new alerts
      if (data.data?.alerts && Array.isArray(data.data.alerts)) {
        const newAlerts = data.data.alerts.filter((alert: any) => {
          const lastAlerts = lastDataRef.current?.data?.alerts || [];
          return !lastAlerts.find((la: any) => la.id === alert.id);
        });

        // Trigger alert handlers for new alerts
        newAlerts.forEach((alert: any) => {
          if (eventHandlers['new-alert']) {
            eventHandlers['new-alert'](alert);
          }
        });
      }

      // Check for new cargo (only if cargo exists)
      if (data.data?.recentCargo && Array.isArray(data.data.recentCargo) && data.data.recentCargo.length > 0) {
        const newCargo = data.data.recentCargo.filter((cargo: any) => {
          const lastCargo = lastDataRef.current?.data?.recentCargo || [];
          return !lastCargo.find((lc: any) => lc.id === cargo.id);
        });

        // Trigger cargo handlers for new cargo
        newCargo.forEach((cargo: any) => {
          if (eventHandlers['new-cargo']) {
            eventHandlers['new-cargo'](cargo);
          }
        });
      }

      lastDataRef.current = data;

    } catch (error) {
      consecutiveErrorsRef.current++;
      console.error('Polling error:', error);
      setIsConnected(false);
      
      // If too many consecutive errors, slow down polling
      if (consecutiveErrorsRef.current >= 3) {
        console.warn('Multiple polling errors detected, will slow down polling');
      }
    }
  }, [url, eventHandlers, isSignedIn, user?.id]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
    }

    // Poll immediately
    poll();

    // Smart polling interval based on cargo availability and error state
    const getPollingInterval = () => {
      if (consecutiveErrorsRef.current >= 3) {
        return 30000; // Slow down to 30s if errors
      }
      if (cargoCount === 0) {
        return 20000; // Poll every 20s when no cargo (slower)
      }
      return 10000; // Normal polling every 10s when cargo exists
    };

    // Dynamic interval polling
    const scheduleNextPoll = () => {
      const interval = getPollingInterval();
      intervalRef.current = setTimeout(() => {
        poll().then(() => {
          if (!isUnmountedRef.current) {
            scheduleNextPoll();
          }
        });
      }, interval);
    };

    scheduleNextPoll();
  }, [poll]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    setIsConnected(false);
    lastDataRef.current = null;
    consecutiveErrorsRef.current = 0;
  }, []);

  useEffect(() => {
    isUnmountedRef.current = false;

    if (isSignedIn && user?.id && typeof window !== 'undefined') {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      isUnmountedRef.current = true;
      stopPolling();
    };
  }, [startPolling, stopPolling, isSignedIn, user?.id]);

  return {
    isConnected,
    reconnect: startPolling,
    disconnect: stopPolling
  };
}
