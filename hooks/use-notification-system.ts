'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import useMarketplaceStore from '@/lib/stores/marketplace-store';

const NOTIFICATION_SOUND_URL = '/sounds/notification.mp3';
const POLLING_INTERVAL = 3000; // 3 seconds

interface NotificationData {
  unreadMessages: number;
  newAlerts: number;
}

export function useNotificationSystem() {
  const { isSignedIn } = useUser();
  const { systemAlerts } = useMarketplaceStore();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // We can only create the Audio object on the client side.
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
        // Silently fail, do not bother user with errors for a background task
        console.warn('Failed to fetch notifications');
        return;
      }

      const data: NotificationData = await response.json();

      // Check for new messages
      if (data.unreadMessages > unreadMessages) {
        toast.info('You have a new message!');
        playNotificationSound();
      }
      setUnreadMessages(data.unreadMessages);

      // Check for new system alerts from the zustand store
      const unreadAlertsCount = systemAlerts.filter(a => !a.read).length;
      const prevUnreadAlertsCount = totalNotifications - unreadMessages;

      if (unreadAlertsCount > prevUnreadAlertsCount) {
        toast.warning('New system alert received.');
        playNotificationSound();
      }

    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [isSignedIn, unreadMessages, systemAlerts, playNotificationSound, totalNotifications]);

  useEffect(() => {
    const unreadAlertsCount = systemAlerts.filter(a => !a.read).length;
    setTotalNotifications(unreadMessages + unreadAlertsCount);
  }, [unreadMessages, systemAlerts]);

  useEffect(() => {
    if (isSignedIn) {
      const intervalId = setInterval(fetchNotifications, POLLING_INTERVAL);
      // initial fetch
      fetchNotifications(); 
      return () => clearInterval(intervalId);
    }
  }, [isSignedIn, fetchNotifications]);

  return { totalNotifications, unreadMessages };
} 