'use client';

import { useNotificationSystem } from '@/hooks/use-notification-system';
import { ReactNode } from 'react';

// This component's only purpose is to activate the notification system hook globally.
export function NotificationProvider({ children }: { children: ReactNode }) {
  useNotificationSystem();
  return <>{children}</>;
} 