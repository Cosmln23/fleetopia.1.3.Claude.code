'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  const previousUnreadConversationIds = useRef<string[]>([]);

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

      // --- Handle message notifications ---
      const newConversationIds = data.unreadConversationIds.filter(
        id => !previousUnreadConversationIds.current.includes(id)
      );

      if (newConversationIds.length > 0) {
        toast.info(`You have new messages in ${newConversationIds.length} conversation(s)!`);
        playNotificationSound();
      }
      
      setUnreadMessageCount(data.unreadMessageCount);
      setUnreadConversationIds(data.unreadConversationIds);
      previousUnreadConversationIds.current = data.unreadConversationIds;
      
      // --- Handle alert notifications (currently disabled in API) ---
      if (data.unreadAlertCount > unreadAlertCount) {
        toast.warning('New system alert received.');
        playNotificationSound();
      }
      setUnreadAlertCount(data.unreadAlertCount);

    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [isSignedIn, unreadAlertCount, playNotificationSound]);

  useEffect(() => {
    if (isSignedIn) {
      const intervalId = setInterval(fetchNotifications, POLLING_INTERVAL);
      fetchNotifications(); // Initial fetch
      return () => clearInterval(intervalId);
    }
  }, [isSignedIn, fetchNotifications]);
  
  const markConversationAsRead = async (conversationId: string) => {
    // Optimistically update the UI
    setUnreadConversationIds(prev => prev.filter(id => id !== conversationId));
    // Refetch to get the accurate new count
    await fetchNotifications();

    try {
        await fetch(`/api/chat/mark-as-read`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversationId })
        });
        // Final confirmation fetch
        await fetchNotifications();
    } catch (error) {
        console.error("Failed to mark conversation as read:", error);
    }
  };

  return { 
    unreadMessageCount,
    unreadConversationIds,
    unreadAlertCount,
    markConversationAsRead
  };
} 