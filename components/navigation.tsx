'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Home,
  ShoppingCart,
  Truck,
  Zap,
  Activity,
  MessageSquare,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotificationSystem } from '@/hooks/use-notification-system';
import { ChatPopover } from './chat-popover';
import { AuthButton } from './AuthButton';
import { NotificationDropdown } from './notifications-dropdown';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
    description: 'Transport Paradise Overview'
  },
  {
    name: 'Marketplace',
    href: '/marketplace',
    icon: ShoppingCart,
    description: 'AI Marketplace & Protocol'
  },
  {
    name: 'Fleet Management',
    href: '/fleet-management',
    icon: Truck,
    description: 'Modern Fleet Operations'
  },
  {
    name: 'API Integrations',
    href: '/api-integrations',
    icon: Zap,
    description: 'External API Extensions'
  },
  {
    name: 'Real-time & Analytics',
    href: '/real-time',
    icon: Activity,
    description: 'Live Monitoring, Data & Performance Insights'
  },
];

export function Navigation() {
  const pathname = usePathname();
  const { unreadAlertCount, unreadMessageCount } = useNotificationSystem();

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Fleetopia
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                  title={item.description}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Settings & Auth */}
          <div className="flex items-center space-x-2">
            <NotificationDropdown unreadCount={unreadAlertCount} />
            <ChatPopover>
              <Button variant="ghost" size="icon" title="Chat" className="relative">
                <MessageSquare className="h-5 w-5" />
                {unreadMessageCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {unreadMessageCount}
                  </span>
                )}
              </Button>
            </ChatPopover>
            <AuthButton />
            <Link
              href="/settings"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Settings"
            >
              <Settings className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t bg-background">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center space-x-1 overflow-x-auto">
            {navigation.slice(0, 6).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 min-w-fit',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="whitespace-nowrap">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
