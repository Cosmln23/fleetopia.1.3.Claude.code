'use client';
import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CargoOffer as PrismaCargoOffer } from '@prisma/client';
import { useChat } from '@/contexts/chat-provider';
import { useSession } from 'next-auth/react';
import { ScrollArea } from './ui/scroll-area';
import { MessageSquare } from 'lucide-react';

type CargoOffer = PrismaCargoOffer & {
    acceptedByUserId?: string | null;
}

export function ChatPopover({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [conversations, setConversations] = useState<CargoOffer[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const { openChat } = useChat();

    useEffect(() => {
        if (isOpen && session?.user?.id) {
            fetch('/api/marketplace/cargo?listType=conversations')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setConversations(data)
                    }
                }).catch(err => console.error("Failed to fetch conversations", err));
        }
    }, [isOpen, session]);

    const handleOpenConversation = (conv: CargoOffer) => {
        openChat(conv);
        setIsOpen(false); 
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent className="w-80 bg-slate-900 border-slate-700 text-white">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Conversations</h4>
                        <p className="text-sm text-muted-foreground">
                            Click a conversation to open the chat.
                        </p>
                    </div>
                    <ScrollArea className="h-64">
                        <div className="grid gap-2">
                            {conversations.length > 0 ? conversations.map(conv => (
                                <div key={conv.id} onClick={() => handleOpenConversation(conv)} className="cursor-pointer p-2 hover:bg-slate-800 rounded-md flex items-center gap-3">
                                    <div className="p-2 bg-slate-800 rounded-full">
                                      <MessageSquare className="h-4 w-4 text-blue-400"/>
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-semibold text-sm truncate">{conv.title}</p>
                                      <p className="text-xs text-slate-400">Click to chat</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-muted-foreground p-4 text-center">No active conversations.</p>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </PopoverContent>
        </Popover>
    )
} 