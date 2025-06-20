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

  const poll = useCallback(async () => {
    if (!isSignedIn || !user?.id || isUnmountedRef.current) {
      setIsConnected(false);
      return;
    }

    try {
      console.log('Polling dispatcher events...');
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('Polling failed:', response.status);
        setIsConnected(false);
        return;
      }

      const data = await response.json();
      setIsConnected(true);

      // Simulate SSE connected event on first successful poll
      if (!lastDataRef.current && eventHandlers['connected']) {
        eventHandlers['connected']({ 
          message: 'Dispatcher notifications connected',
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

      // Check for new cargo
      if (data.data?.recentCargo && Array.isArray(data.data.recentCargo)) {
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
      console.error('Polling error:', error);
      setIsConnected(false);
    }
  }, [url, eventHandlers, isSignedIn, user?.id]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Poll immediately
    poll();

    // Then poll every 10 seconds
    intervalRef.current = setInterval(poll, 10000);
  }, [poll]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsConnected(false);
    lastDataRef.current = null;
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
