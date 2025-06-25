'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, User, Mail, Send, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendNotificationDialog } from './send-notification-dialog';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'error';
  message: string;
  timestamp: Date;
}

export default function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      message: "🚛 AI Dispatcher Online! I'm monitoring your fleet operations in real-time. I can match cargo with available vehicles, estimate pricing, suggest optimal routes, and identify profitable opportunities. Let me know your timeframe and I'll analyze the best dispatch options for you!",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [emailBody, setEmailBody] = useState('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          // Send previous messages for context, excluding the last user message which is the current one
          history: messages.map(m => ({ type: m.type, message: m.message })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to get response from the AI.');
      }

      const data = await response.json();
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        message: data.reply,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error('Chat Error', { description: errorMessage });
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'error',
        message: `I encountered an error: ${errorMessage}. Please check the server configuration.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOpenEmailDialog = (message: string) => {
    setEmailBody(message);
    setIsDialogOpen(true);
  };

  const scrollToBottom = () => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      <Card className="bg-[--card] h-full wave-hover">
        <CardContent className="p-6 h-full flex flex-col relative z-10">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Bot className="w-5 h-5 mr-2 text-blue-400" />
            🤖 AI Dispatcher
          </h3>

          <div className="flex-1 overflow-y-auto mb-4 space-y-3 max-h-64">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className={`flex items-start space-x-2 ${
                    msg.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  { (msg.type === 'ai' || msg.type === 'error') && (
                    <Bot className={`w-5 h-5 ${msg.type === 'error' ? 'text-red-500' : 'text-blue-400'} mt-1 flex-shrink-0`} />
                  )}
                  <div
                    className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
                      msg.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : msg.type === 'error' 
                        ? 'bg-red-900/50 text-red-200'
                        : 'bg-slate-700 text-gray-300'
                    }`}
                  >
                    {msg.message}
                  </div>
                  {msg.type === 'ai' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white"
                      onClick={() => handleOpenEmailDialog(msg.message)}
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                  )}
                  {msg.type === 'user' && (
                    <User className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div
                className="flex items-start space-x-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Bot className="w-5 h-5 text-blue-400 mt-1" />
                <div className="bg-slate-700 text-gray-300 px-3 py-2 rounded-lg text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          <div className="flex space-x-2">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask AI Dispatcher..."
              className="flex-1 px-3 py-2 rounded-lg text-white placeholder-gray-400 focus:outline-none text-sm"
              disabled={isTyping}
            />
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white px-2"
                onClick={() => handleOpenEmailDialog(inputMessage)}
                disabled={!inputMessage.trim()}
              >
                <Mail className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <SendNotificationDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialBody={emailBody}
      />
    </>
  );
}