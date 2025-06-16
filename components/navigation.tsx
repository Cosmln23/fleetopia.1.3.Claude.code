'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Bot, 
  Users, 
  ShoppingCart, 
  Truck,
  Zap,
  Activity,
  Settings,
  BarChart3,
  TestTube2,
  MessageSquare,
  Bell
} from 'lucide-react';
import { AuthButton } from './AuthButton';
import { Button } from './ui/button';
import { ChatPopover } from './chat-popover';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
    description: 'Transport Paradise Overview'
  },
  {
    name: 'AI Agents',
    href: '/ai-agents',
    icon: Bot,
    description: 'Self-Evolving AI Agents'
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
  {
    name: 'Simulator',
    href: '/admin/simulator',
    icon: TestTube2,
    description: 'Live test vehicle data and system reactions'
  }
];

export function Navigation() {
  const pathname = usePathname();

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
            <Button variant="ghost" size="icon" title="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <ChatPopover>
              <Button variant="ghost" size="icon" title="Chat">
                <MessageSquare className="h-5 w-5" />
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
