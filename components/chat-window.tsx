'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, X } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { CargoOffer, ChatMessage as PrismaChatMessage, User } from '@prisma/client';
import { useChat } from '@/contexts/chat-provider';

type MessageWithSender = PrismaChatMessage & {
  sender: Partial<User>;
};

interface ChatWindowProps {
  offer: CargoOffer;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ offer }) => {
  const { data: session } = useSession();
  const { toast } = useToast();
  const { closeChat } = useChat();
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/marketplace/cargo/${offer.id}/chat`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        toast({ title: 'Error', description: 'Failed to fetch messages.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An error occurred while fetching messages.', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [offer.id]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

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
      } else {
        toast({ title: 'Error', description: 'Failed to send message.', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An error occurred while sending the message.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user) return null;

  return (
    <Card className="w-80 h-96 flex flex-col bg-slate-900 border-slate-700 text-white">
      <CardHeader className="flex flex-row items-center justify-between p-2 border-b border-slate-700">
        <CardTitle className="text-sm font-semibold truncate">{offer.title}</CardTitle>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => closeChat(offer.id)}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <ScrollArea className="h-full p-2" ref={scrollAreaRef}>
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2 ${
                  msg.senderId === session.user.id ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.senderId !== session.user.id && (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={msg.sender.image || ''} />
                    <AvatarFallback>{msg.sender.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] p-2 rounded-lg ${
                    msg.senderId === session.user.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  <p className="text-xs">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-2 border-t border-slate-700">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type..."
            className="h-8 bg-slate-800 border-slate-600"
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