'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, User, Mail, Send, AlertTriangle, Maximize2, Minimize2 } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      message: "🚛 AI Dispatcher ready! Ask me about vehicles, cargo matching, or routes.",
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
      const container = endOfMessagesRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timer);
  }, [messages]);

  useEffect(() => {
    if (!isTyping) {
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [isTyping]);

  return (
    <>
      <Card className="bg-[--card] wave-hover w-full">
        <CardContent className="p-6 flex flex-col relative z-10 w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <Bot className="w-5 h-5 mr-2 text-blue-400" />
              🤖 AI Dispatcher
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                className="text-blue-400 border-blue-400 hover:bg-blue-400/10 hover:text-blue-300"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <>
                    <Minimize2 className="w-4 h-4 mr-1" />
                    Minimize
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4 mr-1" />
                    Expand Chat
                  </>
                )}
              </Button>
            </div>
          </div>

          {isExpanded && (
            <div className="w-full space-y-4">
              <div className="w-full overflow-y-auto bg-slate-800/50 rounded-lg p-4 space-y-3" style={{ height: '400px', maxHeight: '400px' }}>
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start space-x-2 ${
                        msg.type === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      { (msg.type === 'ai' || msg.type === 'error') && (
                        <Bot className={`w-5 h-5 ${msg.type === 'error' ? 'text-red-500' : 'text-blue-400'} mt-1 flex-shrink-0`} />
                      )}
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-lg text-sm break-words ${
                          msg.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : msg.type === 'error' 
                            ? 'bg-red-900/50 text-red-200'
                            : 'bg-slate-700 text-gray-300'
                        }`}
                      >
                        {msg.message}
                      </div>
                      {msg.type === 'user' && (
                        <User className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
                
                {isTyping && (
                  <div className="flex items-start space-x-2">
                    <Bot className="w-5 h-5 text-blue-400 mt-1" />
                    <div className="bg-slate-700 text-gray-300 px-3 py-2 rounded-lg text-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={endOfMessagesRef} />
              </div>

              <div className="w-full flex space-x-2">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask AI Dispatcher..."
                  className="flex-1 px-3 py-2 rounded-lg text-white placeholder-gray-400 focus:outline-none text-sm bg-slate-800/50 border-slate-600 focus:border-blue-400"
                  disabled={isTyping}
                  rows={2}
                />
                <div className="flex flex-col space-y-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-white px-2"
                    onClick={() => handleOpenEmailDialog(messages.filter(m => m.type === 'ai').pop()?.message || '')}
                    disabled={messages.filter(m => m.type === 'ai').length === 0}
                    title="Send last AI response via email"
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
            </div>
          )}

          {!isExpanded && (
            <div className="w-full text-center py-8 text-gray-400">
              <Bot className="w-12 h-12 mx-auto mb-3 text-blue-400/50" />
              <p className="text-sm">Click "Expand Chat" to start conversation with AI Dispatcher</p>
            </div>
          )}
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