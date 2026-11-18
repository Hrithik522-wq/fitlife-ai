import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Sparkles, User, Dumbbell, ShieldAlert, 
  RotateCcw, Compass, Apple, Zap, MessageSquare 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export function AICoachView() {
  const { user } = useAuth();
  const { error } = useNotification();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${user?.name?.split(' ')[0] || 'Friend'}! I am **FitLife Coach**, your AI certified fitness trainer and nutrition specialist. 

I'm loaded with your profile data:
* **Goal:** ${user?.fitnessGoal || 'Body Recomposition'}
* **Level:** ${user?.fitnessLevel || 'Intermediate'}
* **Diet:** ${user?.dietaryPreference || 'Vegetarian'}
* **Equipment:** ${Array.isArray(user?.equipment) ? user?.equipment.join(', ') : 'Home equipment'}

How can I empower your training or nutrition today? You can choose a quick topic below or type any question!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "Generate a 4-day workout plan for my goal",
    "What exercises can I substitute for barbell bench press?",
    "High-protein vegetarian meal plan with Indian foods",
    "Explain proper barbell squat form and breathing cue",
    "How to recover faster from sore legs and fatigue?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    const userMsg = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.ai.chat(textToSend, messages);
      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      error(err.message, 'Chat Error');
      const errorAiMsg = {
        id: `err_${Date.now()}`,
        sender: 'ai',
        text: "I encountered a minor network issue. Please ensure your device is connected and try asking again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorAiMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Reset this conversation?')) {
      setMessages([
        {
          id: 'reset',
          sender: 'ai',
          text: `Conversation refreshed. What would you like to focus on next, ${user?.name?.split(' ')[0]}?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col rounded-3xl bg-navy-850 border border-slate-700/80 overflow-hidden shadow-2xl animate-in fade-in">
      
      {/* Top Header */}
      <div className="p-4 sm:p-5 bg-navy-900 border-b border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-neon to-emerald-400 p-0.5 shadow-neon-sm">
              <div className="w-full h-full bg-navy-900 rounded-[14px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-brand-neon" />
              </div>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-brand-neon border-2 border-navy-900 rounded-full animate-pulse" />
          </div>

          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              FitLife AI Trainer
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-brand-neon/20 text-brand-neon border border-brand-neon/30">
                CSCS Mentor
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Evidence-based exercise science • Nutritional guidance • Adaptive progression
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
          title="Clear Conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {msg.sender === 'ai' ? (
              <div className="w-8 h-8 rounded-xl bg-brand-neon/20 border border-brand-neon/40 text-brand-neon flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            ) : (
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt="User"
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-700"
              />
            )}

            <div
              className={`max-w-[85%] sm:max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-brand-neon text-navy-950 font-medium rounded-tr-none shadow-neon-sm'
                  : 'bg-navy-900 border border-slate-700/80 text-slate-200 rounded-tl-none whitespace-pre-wrap'
              }`}
            >
              <div className="prose prose-invert prose-xs max-w-none">
                {msg.text}
              </div>
              <span
                className={`text-[9px] block text-right mt-1.5 ${
                  msg.sender === 'user' ? 'text-navy-950/70 font-bold' : 'text-slate-500'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-neon/20 border border-brand-neon/40 text-brand-neon flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-navy-900 border border-slate-700 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-neon animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-brand-neon animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-brand-neon animate-bounce [animation-delay:0.4s]" />
              <span className="text-slate-300 ml-1">Analyzing biomechanics & nutrition databases...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-4 py-2 bg-navy-900 border-t border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-brand-neon" />
          Suggestions:
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-navy-800 hover:bg-navy-750 border border-slate-700 hover:border-brand-neon/50 text-slate-300 hover:text-white whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 sm:p-4 bg-navy-900 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask FitLife Coach about workouts, exercises, Indian nutrition, recovery..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-navy-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-neon"
        />

        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2.5 rounded-xl bg-brand-neon hover:bg-brand-hover disabled:opacity-40 text-navy-950 font-bold transition-all shadow-neon-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
