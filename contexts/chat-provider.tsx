'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CargoOffer } from '@prisma/client';

interface ChatContextType {
  openChats: CargoOffer[];
  openChat: (offer: CargoOffer) => void;
  closeChat: (offerId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const [openChats, setOpenChats] = useState<CargoOffer[]>([]);

  const openChat = (offer: CargoOffer) => {
    setOpenChats((prevChats) => {
      if (prevChats.find((c) => c.id === offer.id)) {
        return prevChats; // Do not open if already open
      }
      return [...prevChats, offer];
    });
  };

  const closeChat = (offerId: string) => {
    setOpenChats((prevChats) => prevChats.filter((c) => c.id !== offerId));
  };

  const value = {
    openChats,
    openChat,
    closeChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
} 