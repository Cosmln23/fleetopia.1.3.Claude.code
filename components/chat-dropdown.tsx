'use client';

import { useState } from 'react';
import { MessageSquare, User, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatSystem } from '@/hooks/use-chat-system';
import { useChat } from '@/contexts/chat-provider';
import { formatDistanceToNow } from 'date-fns';

export function ChatDropdown() {
  const { conversations, totalUnreadCount } = useChatSystem();
  const { openChat } = useChat();
  const [isOpen, setIsOpen] = useState(false);

  const handleConversationClick = async (conversation: any) => {
    try {
      // Creează un obiect cargo offer pentru chat folosind datele din conversație
      const cargoOffer = {
        id: conversation.cargoOfferId,
        title: conversation.cargoTitle,
        fromCountry: conversation.fromCountry,
        toCountry: conversation.toCountry,
        // Adaugă date minime necesare pentru chat
        weight: 0,
        price: 0,
        status: 'OPEN',
        urgency: 'medium',
        cargoType: 'General',
        createdAt: new Date(),
        userId: conversation.otherUserId || 'unknown'
      };
      
      openChat(cargoOffer);
      setIsOpen(false);
      
      // Marchează conversația ca vizualizată
      // markConversationAsViewed(conversation.cargoOfferId);
    } catch (error) {
      console.error('Error opening chat:', error);
    }
  };

  const handleViewAllConversations = () => {
    // Navighează către pagina de marketplace unde sunt toate conversațiile
    setIsOpen(false);
    window.location.href = '/marketplace';
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          title="Messages"
        >
          <MessageSquare className="h-5 w-5" />
          {totalUnreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold animate-pulse"
            >
              {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 bg-slate-900 border-slate-700 text-white"
        sideOffset={5}
      >
        <DropdownMenuLabel className="text-blue-400 font-semibold">
          💬 Chat Messages ({totalUnreadCount} unread)
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-700" />
        
        {conversations.length === 0 ? (
          <DropdownMenuItem disabled className="text-slate-400 text-center py-4">
            <div className="flex flex-col items-center space-y-2 w-full">
              <MessageSquare className="h-8 w-8 text-slate-500" />
              <span>No conversations yet</span>
              <span className="text-xs">Start chatting with cargo offers!</span>
            </div>
          </DropdownMenuItem>
        ) : (
          <ScrollArea className="h-80">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="p-3 cursor-pointer hover:bg-slate-800 border-b border-slate-700/50 last:border-b-0"
                onClick={() => handleConversationClick(conversation)}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className="flex-shrink-0 mt-1">
                    <User className="h-8 w-8 text-blue-400 bg-slate-800 rounded-full p-1" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-white truncate">
                        {conversation.otherUserName}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-blue-300 mb-1 font-medium">
                      📦 {conversation.cargoTitle}
                    </p>
                    
                    <p className="text-xs text-slate-400 mb-1">
                      🚛 {conversation.fromCountry} → {conversation.toCountry}
                    </p>
                    
                    <p className="text-sm text-slate-300 truncate mb-1">
                      {conversation.lastMessage}
                    </p>
                    
                    <div className="flex items-center text-xs text-slate-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>
                        {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        )}
        
        {conversations.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem 
              className="text-center py-2 text-blue-400 hover:bg-slate-800 cursor-pointer"
              onClick={handleViewAllConversations}
            >
              <span className="text-sm">View all conversations</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}