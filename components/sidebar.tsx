'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  ShoppingCart,
  ClipboardList,
  Map,
  Brain,
  Network,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: Home,
    color: 'bg-slate-500'
  },
  {
    title: 'Fleet Management',
    href: '/fleet-management',
    icon: Truck,
    color: 'bg-blue-500'
  },
  {
    title: 'Marketplace',
    href: '/marketplace',
    icon: ShoppingCart,
    color: 'bg-green-500'
  },
  {
    title: 'Dispatch Center',
    href: '/dispatch',
    icon: ClipboardList,
    color: 'bg-orange-500'
  },
  {
    title: 'Free Maps',
    href: '/free-maps',
    icon: Map,
    color: 'bg-cyan-500'
  },
  {
    title: 'ML Route Optimizer',
    href: '/ml-route-optimizer',
    icon: Brain,
    color: 'bg-pink-500'
  },
  {
    title: 'API Integrations',
    href: '/api-integrations',
    icon: Network,
    color: 'bg-indigo-500'
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    color: 'bg-gray-500'
  }
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <motion.div
      initial={false}
      animate={{ 
        width: isCollapsed ? 80 : 250,
        transition: { duration: 0.3, ease: "easeInOut" }
      }}
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-slate-800/50 border-r border-slate-700 backdrop-blur-md z-40"
    >
      <div className="flex flex-col h-full">
        {/* Collapse Toggle */}
        <div className="flex items-center justify-end p-4 border-b border-slate-700">
          <button
            onClick={onToggle}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'flex items-center rounded-lg transition-all duration-200 group',
                    isCollapsed ? 'px-3 py-3 justify-center' : 'px-3 py-3',
                    isActive
                      ? 'bg-slate-700/70 text-white border-l-2 border-blue-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  )}
                >
                  <div
                    className={cn(
                      'p-2 rounded-lg transition-all duration-300',
                      isActive ? item.color : 'bg-slate-700',
                      'group-hover:scale-110'
                    )}
                  >
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="ml-3 font-medium text-sm"
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-slate-500 text-center"
              >
                Fleetopia v1.3
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}