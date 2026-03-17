"use client";

import { useState, useRef, useEffect } from 'react';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Sparkles, Loader2, Bot, User } from 'lucide-react';
import { assistantChat } from '@/ai/flows/assistant-chat-flow';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function ChatPage() {
  const { user } = useUser();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hi! I\'m NutriFridge AI. Ask me anything about your fridge, recipes, or nutrition goals!' }
  ]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await assistantChat({ 
        message: userMessage, 
        history: history 
      });
      
      setMessages(prev => [...prev, { role: 'model', text: response.text }]);
      setHistory(response.history);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-muted/30">
      <header className="bg-white px-6 py-4 border-b flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-bold text-lg">AI Assistant</h1>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Online</span>
          </div>
        </div>
      </header>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6 max-w-md mx-auto">
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={cn(
                "flex gap-3",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <Avatar className={cn(
                "w-8 h-8 shrink-0",
                msg.role === 'user' ? "bg-primary" : "bg-accent"
              )}>
                <AvatarFallback className="text-white">
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
              <div className={cn(
                "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                msg.role === 'user' 
                  ? "bg-primary text-white rounded-tr-none" 
                  : "bg-white text-foreground rounded-tl-none border border-border/50"
              )}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 bg-accent">
                <AvatarFallback><Bot className="w-4 h-4 text-white" /></AvatarFallback>
              </Avatar>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-border/50 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="p-4 bg-white border-t safe-area-bottom shrink-0 mb-20">
        <div className="max-w-md mx-auto relative">
          <Input 
            placeholder="Ask a question..." 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="rounded-full h-14 pl-6 pr-14 bg-muted/50 border-none focus-visible:ring-primary"
          />
          <Button 
            size="icon" 
            className="absolute right-2 top-2 rounded-full w-10 h-10 shadow-lg"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
