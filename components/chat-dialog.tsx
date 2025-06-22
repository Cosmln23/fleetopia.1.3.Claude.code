'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { CargoOffer, ChatMessage as PrismaChatMessage, User } from '@prisma/client';

// We need to include the sender details in our message type
type MessageWithSender = PrismaChatMessage & {
  sender: Partial<User>;
};

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: {
    name: string | null;
    image: string | null;
  } | null;
}

interface ChatDialogProps {
  cargoOfferId: string;
}

export function ChatDialog({ cargoOfferId }: ChatDialogProps) {
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (cargoOfferId) {
      fetchMessages();
    }
  }, [cargoOfferId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/marketplace/cargo/${cargoOfferId}/chat`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        toast.error('Failed to fetch messages.');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('An error occurred while fetching messages.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !user) return;

    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      content: newMessage,
      createdAt: new Date().toISOString(),
      senderId: user.id,
      sender: {
        name: user.firstName,
        image: user.imageUrl,
      },
    };

    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    try {
      const response = await fetch(`/api/marketplace/cargo/${cargoOfferId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });

      if (!response.ok) {
        setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id)); // Revert optimistic update
        toast.error('Failed to send message.');
      } else {
        // Option 1: Re-fetch all messages to get the real one
        fetchMessages();
        // Option 2: Replace optimistic message with real one from response
        // const savedMessage = await response.json();
        // setMessages(prev => prev.map(m => m.id === optimisticMessage.id ? savedMessage : m));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id)); // Revert optimistic update
      toast.error('An error occurred while sending the message.');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Chat</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chat for Cargo Offer</DialogTitle>
          <DialogDescription>
            Discuss details with the other party.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <p>Loading chat...</p>
            </div>
          ) : (
            <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${
                      msg.senderId === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.senderId !== user?.id && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={msg.sender?.image || ''} />
                        <AvatarFallback>{msg.sender?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        msg.senderId === user?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {msg.senderId === user?.id && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.imageUrl || ''} />
                        <AvatarFallback>{user?.firstName?.charAt(0).toUpperCase() || 'M'}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          </div>
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || newMessage.trim() === ''}>
              Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
