'use client';

import React from 'react';
import { useChat } from '@/contexts/chat-provider';
import { ChatWindow } from './chat-window';

export function ChatManager() {
  const { openChats } = useChat();

  if (openChats.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-0 flex items-end space-x-4 p-4 z-50">
      {openChats.map((offer) => (
        <ChatWindow key={offer.id} offer={offer} />
      ))}
    </div>
  );
} 