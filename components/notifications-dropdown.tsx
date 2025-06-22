'use client';

import React, { useState } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';
import useMarketplaceStore, { SystemAlert } from '@/lib/stores/marketplace-store';
import { formatDistanceToNow } from 'date-fns';

interface NotificationDropdownProps {
  unreadCount: number;
}

export function NotificationDropdown({ unreadCount }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { systemAlerts, markAlertAsRead, setSystemAlerts } = useMarketplaceStore();

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'cargo': return '📦';
      case 'agent': return '🤖';
      case 'system': return '⚙️';
      case 'warning': return '⚠️';
      case 'error': return '🚨';
      default: return '📢';
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'cargo': return 'bg-blue-500/10 border-blue-500/20';
      case 'agent': return 'bg-purple-500/10 border-purple-500/20';
      case 'system': return 'bg-gray-500/10 border-gray-500/20';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'error': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-slate-500/10 border-slate-500/20';
    }
  };

  // Mark single notification as read
  const handleMarkAsRead = async (alertId: string) => {
    try {
      const response = await fetch('/api/dispatcher/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertIds: [alertId] })
      });

      if (response.ok) {
        markAlertAsRead(alertId);
        toast.success('✅ Notification marked as read');
      } else {
        throw new Error('Failed to mark as read');
      }
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  // Delete notification
  const handleDelete = async (alertId: string) => {
    try {
      const response = await fetch(`/api/dispatcher/alerts/${alertId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Remove from store
        const updatedAlerts = systemAlerts.filter(alert => alert.id !== alertId);
        setSystemAlerts(updatedAlerts);
        toast.success('🗑️ Notification deleted');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    const unreadIds = systemAlerts.filter(alert => !alert.read).map(alert => alert.id);
    
    if (unreadIds.length === 0) {
      toast.info('No unread notifications');
      return;
    }

    try {
      const response = await fetch('/api/dispatcher/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertIds: unreadIds })
      });

      if (response.ok) {
        // Mark all as read in store
        unreadIds.forEach(id => markAlertAsRead(id));
        toast.success(`✅ Marked ${unreadIds.length} notifications as read`);
      } else {
        throw new Error('Failed to mark all as read');
      }
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  // Clear all notifications
  const handleClearAll = async () => {
    try {
      const response = await fetch('/api/dispatcher/alerts/clear', {
        method: 'POST'
      });

      if (response.ok) {
        setSystemAlerts([]);
        toast.success('🗑️ All notifications cleared');
        setIsOpen(false);
      } else {
        throw new Error('Failed to clear all');
      }
    } catch (error) {
      toast.error('Failed to clear all notifications');
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
      
      <PopoverContent 
        className="w-80 bg-slate-900 border-slate-700 text-white p-0" 
        align="end"
        sideOffset={5}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-400" />
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center space-x-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-8 px-2 text-xs text-blue-400 hover:text-blue-300"
                title="Mark all as read"
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
            
            {systemAlerts.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-8 px-2 text-xs text-red-400 hover:text-red-300"
                title="Clear all"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-80">
          {systemAlerts.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No notifications</p>
              <p className="text-xs opacity-75">You're all caught up!</p>
            </div>
          ) : (
            <div className="p-2">
              {systemAlerts.map((alert, index) => (
                <div key={alert.id}>
                  <div className={`
                    p-3 rounded-lg mb-2 transition-all duration-200 hover:bg-slate-800/50 
                    ${!alert.read ? getNotificationColor(alert.type) : 'bg-slate-800/30'}
                    ${!alert.read ? 'border-l-4' : 'border-l-2 border-slate-600'}
                  `}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {/* Icon */}
                        <div className="text-lg mt-0.5">
                          {getNotificationIcon(alert.type)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!alert.read ? 'font-medium text-white' : 'text-slate-300'}`}>
                            {alert.message}
                          </p>
                          
                          <div className="flex items-center space-x-2 mt-1">
                            <Clock className="h-3 w-3 text-slate-500" />
                            <span className="text-xs text-slate-500">
                              {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                            </span>
                            
                            {alert.type && (
                              <>
                                <span className="text-slate-600">•</span>
                                <span className="text-xs text-slate-500 capitalize">
                                  {alert.type}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-1 ml-2">
                        {!alert.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(alert.id)}
                            className="h-7 w-7 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                            title="Mark as read"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(alert.id)}
                          className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          title="Delete"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {index < systemAlerts.length - 1 && (
                    <Separator className="bg-slate-700/50" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {systemAlerts.length > 0 && (
          <div className="p-3 border-t border-slate-700 bg-slate-800/50">
            <div className="text-center">
              <p className="text-xs text-slate-400">
                {systemAlerts.length} total notification{systemAlerts.length !== 1 ? 's' : ''}
                {unreadCount > 0 && ` • ${unreadCount} unread`}
              </p>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
} 