'use client';

import React, { useEffect } from 'react';
import { Sidebar } from './sidebar';
import { useSidebar } from '@/hooks/use-sidebar';
import { motion } from 'framer-motion';

interface SidebarWrapperProps {
  children: React.ReactNode;
}

export function SidebarWrapper({ children }: SidebarWrapperProps) {
  const { isCollapsed, isMobile, isOpen, toggle, setMobile, setOpen } = useSidebar();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setMobile(mobile);
      
      // Auto-close sidebar on mobile when window is resized
      if (mobile && isOpen) {
        setOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setMobile, setOpen, isOpen]);

  // Close sidebar when clicking outside on mobile
  const handleBackdropClick = () => {
    if (isMobile && isOpen) {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar isCollapsed={isCollapsed} onToggle={toggle} />
      )}

      {/* Mobile Sidebar Backdrop */}
      {isMobile && isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={handleBackdropClick}
        />
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <motion.div
          initial={{ x: -250 }}
          animate={{ x: isOpen ? 0 : -250 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 z-40 md:hidden"
        >
          <Sidebar isCollapsed={false} onToggle={() => setOpen(false)} />
        </motion.div>
      )}

      {/* Main Content */}
      <motion.div
        animate={{
          marginLeft: isMobile ? 0 : (isCollapsed ? 80 : 250),
          transition: { duration: 0.3, ease: "easeInOut" }
        }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </div>
  );
}