import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User } from 'lucide-react';
import { api } from '../../lib/axios';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
}

export const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'assistant', text: 'Hello Visionary! I am your AI Workspace Assistant. Ask me anything about your tasks, finances, or notes.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const newMessages: Message[] = [...messages, { sender: 'user', text: query }];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/ai/chat', { message: query });
      setMessages([...newMessages, { sender: 'assistant', text: data.data?.reply || 'Done!' }]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { sender: 'assistant', text: 'Sorry, I encountered an issue connecting to workspace context.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-3.5 rounded-full bg-gradient-to-r from-accent via-indigo-500 to-purple-600 text-white shadow-xl hover:scale-105 transition cursor-pointer flex items-center gap-2"
        >
          <Sparkles size={20} className="animate-pulse text-amber-300" />
          <span className="text-xs font-bold hidden sm:inline">Ask AI Assistant</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] sm:w-[400px] h-[520px] bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-left animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-3.5 border-b border-border/40 bg-secondary/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-accent/20 text-accent">
                <Bot size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">AI Workspace Assistant</h4>
                <p className="text-[10px] text-emerald-400 font-medium">● Connected • Gemini 2.5 Flash</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2 text-xs ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={12} />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-secondary/70 border border-border/40 text-foreground rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>
                {m.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <User size={12} />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 text-xs justify-start">
                <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0">
                  <Bot size={12} />
                </div>
                <div className="p-3 rounded-2xl bg-secondary/70 border border-border/40 text-foreground rounded-tl-none flex items-center gap-1.5">
                  <Sparkles size={12} className="animate-spin text-amber-400" />
                  <span className="text-[11px] text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-1.5 flex gap-1.5 overflow-x-auto border-t border-border/30 bg-secondary/20">
            {['Pending Tasks', 'Financial Summary', 'Productivity Tips'].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="px-2.5 py-1 rounded-full bg-card border border-border/50 text-[10px] font-medium text-muted-foreground hover:text-foreground hover:border-accent/40 whitespace-nowrap transition cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-border/40 bg-card flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your workspace..."
              className="flex-1 bg-secondary/50 border border-border/40 rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-accent"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
