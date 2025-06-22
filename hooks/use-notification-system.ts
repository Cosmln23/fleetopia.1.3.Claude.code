'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

const NOTIFICATION_SOUND_URL = '/sounds/notification.mp3';
const POLLING_INTERVAL = 3000; // 3 seconds

interface NotificationData {
  unreadMessageCount: number;
  unreadConversationIds: string[];
  unreadAlertCount: number;
}

export function useNotificationSystem() {
  const { isSignedIn } = useUser();
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  // State for messages
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadConversationIds, setUnreadConversationIds] = useState<string[]>([]);
  
  // State for alerts
  const [unreadAlertCount, setUnreadAlertCount] = useState(0);

  useEffect(() => {
    const notificationAudio = new Audio(NOTIFICATION_SOUND_URL);
    notificationAudio.preload = 'auto';
    setAudio(notificationAudio);
  }, []);

  const playNotificationSound = useCallback(() => {
    audio?.play().catch(err => console.error("Failed to play notification sound:", err));
  }, [audio]);

  const fetchNotifications = useCallback(async () => {
    if (!isSignedIn) return;

    try {
      const response = await fetch('/api/notifications');
      if (!response.ok) {
        console.warn('Failed to fetch notifications');
        return;
      }

      const data: NotificationData = await response.json();

      // Check for new messages
      if (data.unreadMessageCount > unreadMessageCount) {
        toast.info('You have a new message!');
        playNotificationSound();
      }
      setUnreadMessageCount(data.unreadMessageCount);
      setUnreadConversationIds(data.unreadConversationIds);
      
      // Check for new system alerts
      if (data.unreadAlertCount > unreadAlertCount) {
        toast.warning('New system alert received.');
        playNotificationSound();
      }
      setUnreadAlertCount(data.unreadAlertCount);

    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [isSignedIn, unreadMessageCount, unreadAlertCount, playNotificationSound]);

  useEffect(() => {
    if (isSignedIn) {
      const intervalId = setInterval(fetchNotifications, POLLING_INTERVAL);
      fetchNotifications(); // Initial fetch
      return () => clearInterval(intervalId);
    }
  }, [isSignedIn, fetchNotifications]);
  
  const markConversationAsRead = async (conversationId: string) => {
    // Optimistically update the UI
    setUnreadMessageCount(prev => Math.max(0, prev - 1));
    setUnreadConversationIds(prev => prev.filter(id => id !== conversationId));

    try {
        await fetch(`/api/chat/mark-as-read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationId })
        });
        // Optionally, re-fetch to confirm, but optimistic is usually enough for UI
        await fetchNotifications();
    } catch (error) {
        console.error("Failed to mark conversation as read:", error);
        // Revert optimistic update on failure if needed
    }
  };

  return { 
    unreadMessageCount,
    unreadConversationIds,
    unreadAlertCount,
    markConversationAsRead
  };
} 