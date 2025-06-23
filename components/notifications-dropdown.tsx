'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, MessageSquare, AlertTriangle, Trash2, CheckCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { useNotificationSystem, Notification } from '@/hooks/use-notification-system';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotificationSystem();
  
  const handleNotificationClick = (notification: Notification) => {
    // Here you can add logic to navigate to the related content,
    // for example, open a chat window.
    // For now, it will just mark it as read.
    if (!notification.read) {
        markAsRead(notification.id, notification.type);
    }
  };

  const handleClear = (e: React.MouseEvent, notification: Notification) => {
    e.stopPropagation(); // Prevent the click from triggering handleNotificationClick
    markAsRead(notification.id, notification.type);
  }

  const getNotificationIcon = (type: 'message' | 'alert') => {
    switch (type) {
      case 'message': return <MessageSquare className="h-5 w-5 text-blue-400" />;
      case 'alert': return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          title="Notifications"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 md:w-96 p-0" align="end">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-semibold text-lg">Notifications</h3>
            {/* The mark all as read button is removed for simplicity for now */}
          </div>
          
          <ScrollArea className="h-96">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    'flex items-start p-3 space-x-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors cursor-pointer',
                    notification.read ? 'opacity-60' : 'bg-primary/5'
                  )}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{notification.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => handleClear(e, notification)}
                        title="Mark as read"
                      >
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h4 className="font-semibold">No notifications</h4>
                <p className="text-sm text-muted-foreground">You are all caught up!</p>
              </div>
            )}
          </ScrollArea>
      </PopoverContent>
    </Popover>
  );
} 