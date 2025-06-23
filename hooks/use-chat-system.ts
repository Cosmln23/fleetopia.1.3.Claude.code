'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

const CHAT_POLLING_INTERVAL = 3000; // 3 secunde sincronizat cu notification system

export interface ChatConversation {
  id: string;
  cargoOfferId: string;
  cargoTitle: string;
  otherUserName: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  fromCountry: string;
  toCountry: string;
}

export function useChatSystem() {
  const { isSignedIn } = useUser();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  
  const fetchChatStats = useCallback(async () => {
    if (!isSignedIn) return;

    try {
      const response = await fetch('/api/chat/stats');
      if (!response.ok) {
        console.warn('Failed to fetch chat stats, server returned error.');
        return;
      }

      const data: { 
        conversations: ChatConversation[];
        totalUnreadCount: number;
      } = await response.json();
      
      setConversations(data.conversations || []);
      setTotalUnreadCount(data.totalUnreadCount || 0);

    } catch (error) {
      console.error('Error fetching chat stats:', error);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (isSignedIn) {
      const intervalId = setInterval(fetchChatStats, CHAT_POLLING_INTERVAL);
      fetchChatStats(); // Initial fetch
      return () => clearInterval(intervalId);
    }
  }, [isSignedIn, fetchChatStats]);

  // Funcție pentru a reseta contador când se deschide un chat
  const markConversationAsViewed = useCallback((cargoOfferId: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.cargoOfferId === cargoOfferId 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
    setTotalUnreadCount(prev => {
      const conv = conversations.find(c => c.cargoOfferId === cargoOfferId);
      return Math.max(0, prev - (conv?.unreadCount || 0));
    });
  }, [conversations]);

  return { 
    conversations,
    totalUnreadCount,
    markConversationAsViewed,
    refreshChats: fetchChatStats
  };
}