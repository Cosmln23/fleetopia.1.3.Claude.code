'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

interface SSEEventHandler {
  [event: string]: (data: any) => void;
}

export function useSSE(url: string, eventHandlers: SSEEventHandler) {
  const { user, isSignedIn } = useUser();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef(false);
  const maxRetries = 5;
  const retryCountRef = useRef(0);

  const connect = useCallback(() => {
    // Don't connect if component is unmounted or conditions not met
    if (!isSignedIn || !user?.id || typeof window === 'undefined' || isUnmountedRef.current) {
      return;
    }

    try {
      // Close existing connection properly
      if (eventSourceRef.current) {
        eventSourceRef.current.onopen = null;
        eventSourceRef.current.onerror = null;
        eventSourceRef.current.onmessage = null;
        eventSourceRef.current.close();
      }

      // Create new EventSource
      eventSourceRef.current = new EventSource(url);

      // Handle connection events
      eventSourceRef.current.onopen = () => {
        console.log('SSE connected');
        retryCountRef.current = 0; // Reset retry count on successful connection
      };

      eventSourceRef.current.onerror = (error) => {
        console.error('SSE error:', error);
        
        // Only attempt reconnection if component is still mounted
        if (!isUnmountedRef.current && 
            typeof window !== 'undefined' && 
            eventSourceRef.current?.readyState === (EventSource ? EventSource.CLOSED : 2) && 
            retryCountRef.current < maxRetries) {
          
          // Exponential backoff: 1s, 2s, 4s, 8s, 16s
          const delay = Math.pow(2, retryCountRef.current) * 1000;
          retryCountRef.current++;
          
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${retryCountRef.current}/${maxRetries})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            // Double-check component is still mounted before reconnecting
            if (!isUnmountedRef.current) {
              connect();
            }
          }, delay);
        }
      };

      // Set up event handlers
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        eventSourceRef.current?.addEventListener(event, (e: any) => {
          // Only handle events if component is still mounted
          if (!isUnmountedRef.current) {
            try {
              const data = JSON.parse(e.data);
              handler(data);
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError);
            }
          }
        });
      });

    } catch (error) {
      console.error('Error creating SSE connection:', error);
    }
  }, [url, eventHandlers, isSignedIn, user?.id]);

  const disconnect = useCallback(() => {
    // Mark as unmounted to prevent reconnection attempts
    isUnmountedRef.current = true;
    
    // Clear any pending reconnection timeouts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Close EventSource connection properly
    if (eventSourceRef.current) {
      // Remove all event listeners before closing
      eventSourceRef.current.onopen = null;
      eventSourceRef.current.onerror = null;
      eventSourceRef.current.onmessage = null;
      
      // Close connection
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    // Reset retry count
    retryCountRef.current = 0;
  }, []);

  useEffect(() => {
    // Reset unmounted flag when effect runs
    isUnmountedRef.current = false;
    
    if (isSignedIn && user?.id && typeof window !== 'undefined') {
      connect();
    }

    // Cleanup on dependency change or unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect, isSignedIn, user?.id]);

  return {
    isConnected: typeof window !== 'undefined' && eventSourceRef.current?.readyState === 1,
    reconnect: connect,
    disconnect
  };
}
