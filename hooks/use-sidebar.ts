'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isCollapsed: boolean;
  isMobile: boolean;
  isOpen: boolean;
  toggle: () => void;
  collapse: () => void;
  expand: () => void;
  setMobile: (mobile: boolean) => void;
  setOpen: (open: boolean) => void;
}

export const useSidebar = create<SidebarState>()(
  persist(
    (set, get) => ({
      isCollapsed: false,
      isMobile: false,
      isOpen: true,
      toggle: () => set({ isCollapsed: !get().isCollapsed }),
      collapse: () => set({ isCollapsed: true }),
      expand: () => set({ isCollapsed: false }),
      setMobile: (mobile: boolean) => set({ isMobile: mobile }),
      setOpen: (open: boolean) => set({ isOpen: open }),
    }),
    {
      name: 'sidebar-storage',
      partialize: (state) => ({ 
        isCollapsed: state.isCollapsed 
      }),
    }
  )
);