'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, User, Mail, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendNotificationDialog } from './send-notification-dialog';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

export default function AIChatDemo() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      message: 'Hello! I\'m your AI Dispatcher Assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const demoResponses = [
    'I understand. Checking optimal route for this mission...',
    'Found 3 available vehicles in the specified area.',
    'I recommend vehicle GR-1245 for this task.',
    'Calculating estimated delivery time...',
    'Full functionality will be available soon!'
  ];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [emailBody, setEmailBody] = useState('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        message: demoResponses[Math.floor(Math.random() * demoResponses.length)],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
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
            💬 AI Assistant (Demo)
          </h3>

          {/* Chat Messages */}
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
                  {msg.type === 'ai' && (
                    <Bot className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                  )}
                  <div
                    className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
                      msg.type === 'user'
                        ? 'bg-blue-600 text-white'
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
          </div>

          {/* Input Area */}
          <div className="flex space-x-2">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask AI Dispatcher..."
              className="flex-1 px-3 py-2 rounded-lg text-white placeholder-gray-400 focus:outline-none text-sm"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Demo Notice */}
          <div className="mt-2 text-xs text-gray-500 text-center">
            🚧 Demo functionality - full implementation in development
          </div>
        </CardContent>
      </Card>

      {/* Dialog instance */}
      <SendNotificationDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialBody={emailBody}
      />
    </>
  );
}