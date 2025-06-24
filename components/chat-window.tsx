'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { CargoOffer, ChatMessage as PrismaChatMessage, User } from '@prisma/client';
import { useChat } from '@/contexts/chat-provider';
import { useChatSystem } from '@/hooks/use-chat-system';

type MessageWithSender = PrismaChatMessage & {
  sender: Partial<User>;
};

interface ChatWindowProps {
  offer: CargoOffer;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ offer }) => {
  const { user, isSignedIn } = useUser();
  const { refreshInstant, markConversationAsViewed } = useChatSystem();

  const { closeChat } = useChat();
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shouldScrollOnUpdate, setShouldScrollOnUpdate] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate country codes from country names
  const getCountryCode = (country: string): string => {
    const countryMap: { [key: string]: string } = {
      'Romania': 'RO',
      'Belgium': 'BE',
      'Germany': 'DE',
      'France': 'FR',
      'Italy': 'IT',
      'Spain': 'ES',
      'Netherlands': 'NL',
      'Poland': 'PL',
      'Hungary': 'HU',
      'Bulgaria': 'BG',
      'Czech Republic': 'CZ',
      'Slovakia': 'SK',
      'Austria': 'AT',
      'Denmark': 'DK',
      'Sweden': 'SE',
      'Finland': 'FI',
      'Norway': 'NO',
      'United Kingdom': 'UK',
      'Ireland': 'IE',
      'Portugal': 'PT',
      'Slovenia': 'SI',
      'Croatia': 'HR',
      'Serbia': 'RS',
      'Bosnia and Herzegovina': 'BA',
      'Montenegro': 'ME',
      'Macedonia': 'MK',
      'Albania': 'AL',
      'Greece': 'GR',
      'Turkey': 'TR',
      'Ukraine': 'UA',
      'Moldova': 'MD',
      'Lithuania': 'LT',
      'Latvia': 'LV',
      'Estonia': 'EE'
    };
    return countryMap[country] || country.substring(0, 2).toUpperCase();
  };

  const getChatTitle = () => {
    const fromCode = getCountryCode(offer.fromCountry);
    const toCode = getCountryCode(offer.toCountry);
    return `${offer.title} ${fromCode}-${toCode}`;
  };

  const scrollToBottom = (immediate = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: immediate ? 'instant' : 'smooth' 
      });
    }
  };

  const fetchMessages = async () => {
    try {
      const url = new URL(`/api/marketplace/cargo/${offer.id}/chat`, window.location.origin);
      url.searchParams.append('timestamp', new Date().getTime().toString());

      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        // Auto-scroll to bottom after loading messages (immediate)
        setTimeout(() => scrollToBottom(true), 50);
      } else {
        toast.error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      toast.error('Failed to load chat messages');
    }
  };

  useEffect(() => {
    // Fetch messages only when the component mounts (chat window is opened)
    fetchMessages();
    // Mark the conversation as read
    markConversationAsViewed(offer.id);
    // Scroll to bottom when chat opens (immediate)
    setTimeout(() => scrollToBottom(true), 100);

    // Set up polling pentru mesaje noi la fiecare 3 secunde
    // Doar dacă user-ul nu scrie (nu vrem să întrerupem typing-ul)
    const messagePolling = setInterval(() => {
      // Nu face polling dacă user-ul scrie în acest moment
      if (!isLoading && document.activeElement?.tagName !== 'INPUT') {
        fetchMessages();
      }
    }, 3000);

    // Cleanup interval când componenta se unmount-ează
    return () => {
      clearInterval(messagePolling);
    };
  }, [offer.id]);

  // Scroll to bottom when messages change (doar când flag-ul e true)
  useEffect(() => {
    if (shouldScrollOnUpdate) {
      scrollToBottom();
      setShouldScrollOnUpdate(false); // Reset flag după scroll
    }
  }, [messages, shouldScrollOnUpdate]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/marketplace/cargo/${offer.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });

      if (response.ok) {
        const sentMessage = await response.json();
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
        // Force scroll to bottom after sending (când trimiți tu)
        setShouldScrollOnUpdate(true);
        setTimeout(scrollToBottom, 100);
        // REFRESH INSTANT AL CHAT DROPDOWN-ULUI
        refreshInstant();
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSignedIn || !user) return null;

  return (
    <Card className="w-80 h-96 flex flex-col bg-slate-900 border-slate-700 text-white">
      <CardHeader className="flex flex-row items-center justify-between p-2 border-b border-slate-700">
        <CardTitle className="text-sm font-semibold truncate">{getChatTitle()}</CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => closeChat(offer.id)}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className="h-72 p-2" ref={scrollAreaRef}>
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2 ${
                  msg.senderId === user?.id ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.senderId !== user?.id && (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={msg.sender.image || ''} />
                    <AvatarFallback>{msg.sender.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] p-2 rounded-lg ${
                    msg.senderId === user?.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  <p className="text-xs">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-2 border-t border-slate-700">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type..."
                            className="h-8"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" className="h-8 w-8" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}; 
