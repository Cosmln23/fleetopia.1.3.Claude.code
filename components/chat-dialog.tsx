'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { CargoOffer, ChatMessage as PrismaChatMessage, User } from '@prisma/client';

// We need to include the sender details in our message type
type MessageWithSender = PrismaChatMessage & {
  sender: Partial<User>;
};

interface ChatDialogProps {
  offer: CargoOffer;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatDialog: React.FC<ChatDialogProps> = ({ offer, isOpen, onClose }) => {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!offer.id) return;
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
    if (isOpen) {
      fetchMessages();
      // Poll for new messages every 5 seconds
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !offer.id) return;

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

  if (!session || !session.user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chat for: {offer.title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow p-4 border rounded-md" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  msg.senderId === session.user.id ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.senderId !== session.user.id && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.sender.image || ''} />
                    <AvatarFallback>{msg.sender.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-xs md:max-w-md p-3 rounded-lg ${
                    msg.senderId === session.user.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1 text-right">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                 {msg.senderId === session.user.id && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image || ''} />
                    <AvatarFallback>{session.user.name?.charAt(0).toUpperCase() || 'Me'}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter>
          <form onSubmit={handleSendMessage} className="flex w-full gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 
