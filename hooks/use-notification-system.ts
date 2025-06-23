'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

const POLLING_INTERVAL = 30000; // 30 secunde - reduce auto-refresh pentru UX mai bun

export interface Notification {
    id: string;
    type: 'alert'; // DOAR alerte sistem (cargo, oferte, plăți)
    text: string;
    relatedId: string;
    createdAt: Date;
    read: boolean;
}

export function useNotificationSystem() {
  const { isSignedIn } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const fetchNotifications = useCallback(async () => {
    if (!isSignedIn) return;

    try {
      const response = await fetch('/api/notifications');
      if (!response.ok) {
        // Silently fail on server error
        console.warn('Failed to fetch notifications, server returned error.');
        return;
      }

      const data: { notifications: Notification[] } = await response.json();
      
      setNotifications(data.notifications || []);
      setUnreadCount(data.notifications?.filter(n => !n.read).length || 0);

    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (isSignedIn) {
      const intervalId = setInterval(fetchNotifications, POLLING_INTERVAL);
      fetchNotifications(); // Initial fetch
      return () => clearInterval(intervalId);
    }
  }, [isSignedIn, fetchNotifications]);
  
  const markAsRead = async (notificationId: string, type: 'alert') => {
    // Optimistically update the UI by removing the notification from the list
    const originalNotifications = notifications;
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    setUnreadCount(prev => Math.max(0, prev - 1));

    // DOAR pentru alerte sistem (nu mai avem mesaje aici)
    const endpoint = `/api/dispatcher/alerts/${notificationId}`;
    const options: RequestInit = {
      method: 'DELETE'
    };

    try {
        const response = await fetch(endpoint, options);
        if (!response.ok) {
          // If the API call fails, revert the optimistic update
          console.error(`Failed to mark alert as read, response not OK.`);
          setNotifications(originalNotifications);
          // Re-fetch to get the true state
          fetchNotifications();
        }
        // On success, we don't need to do anything since the UI was already updated.
        // Maybe a re-fetch to ensure consistency? For now, we'll trust the optimistic update.

    } catch (error) {
        console.error(`Failed to mark alert as read:`, error);
        // Revert optimistic update on failure
        setNotifications(originalNotifications);
        fetchNotifications();
    }
  };

  return { 
    notifications,
    unreadCount,
    markAsRead
  };
} 