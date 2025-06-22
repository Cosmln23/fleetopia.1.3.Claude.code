'use client';
import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useChat } from '@/contexts/chat-provider';
import { MessageSquare, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export function ChatPopover({ children }: { children: React.ReactNode }) {
  const { openChats, closeChat, openChat } = useChat();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative">
          {children}
          {openChats.length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0"
            >
              {openChats.length}
            </Badge>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-slate-900 border-slate-700 text-white">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Active Chats</h4>
            <p className="text-sm text-muted-foreground">
              You have {openChats.length} active conversation(s).
            </p>
          </div>
          <div className="grid gap-2">
            {openChats.length === 0 ? (
              <p className="text-sm text-center text-slate-400 py-4">No active chats</p>
            ) : (
              openChats.map(offer => (
                <div key={offer.id} className="grid grid-cols-[1fr_auto] items-center gap-2">
                  <span className="text-sm font-medium truncate" title={offer.title}>
                    {offer.title}
                  </span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => closeChat(offer.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 
