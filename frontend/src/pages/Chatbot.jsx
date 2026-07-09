import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Send, Bot, User, Loader2, Heart } from 'lucide-react';
import api from '../api';

function Chatbot() {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your AI Cardiologist. Ask me anything about your heart health, symptoms, medications, or ECG results." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const hasSentInitial = useRef(false);

  // Auto-send message if coming from Search screen — guard against React StrictMode double-fire
  useEffect(() => {
    const initialMsg = location.state?.initialMessage;
    if (initialMsg && !hasSentInitial.current) {
      hasSentInitial.current = true;
      sendMessage(initialMsg);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (overrideMsg) => {
    const text = overrideMsg || input;
    if (!text.trim()) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    if (!overrideMsg) setInput("");
    setLoading(true);

    try {
      const res = await api.post('/chat/ask', { message: text });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm temporarily unavailable. Please try again shortly." }]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "What is my cardiac risk?",
    "Explain Atrial Fibrillation",
    "Is my BP reading normal?",
    "What does my ECG show?",
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[var(--color-cardio-primary)] text-white px-4 py-5 flex items-center shadow-sm shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 active:scale-90 transition-transform">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3 ml-2">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <Heart size={18} className="text-white" fill="currentColor" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">AI Cardiologist</h1>
            <p className="text-white/70 text-xs">Powered by Groq LLaMA</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-white/80">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-[var(--color-cardio-primary)]' : 'bg-slate-200'}`}>
              {msg.role === 'user'
                ? <User size={16} className="text-white" />
                : <Bot size={16} className="text-slate-600" />}
            </div>
            <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-[var(--color-cardio-primary)] text-white rounded-tr-sm'
                : 'bg-white text-slate-800 border border-slate-100 shadow-sm rounded-tl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
              <Bot size={16} className="text-slate-600" />
            </div>
            <div className="bg-white border border-slate-100 shadow-sm px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts — show only at start */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto shrink-0">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => sendMessage(p)}
              className="shrink-0 bg-white border border-[var(--color-cardio-primary)] text-[var(--color-cardio-primary)] text-xs font-semibold px-3 py-2 rounded-full hover:bg-green-50 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="px-4 py-3 bg-white border-t border-slate-100 flex gap-2 items-center shrink-0">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-[var(--color-cardio-primary)]"
          placeholder="Ask about your heart health..."
          disabled={loading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="w-11 h-11 bg-[var(--color-cardio-primary)] text-white rounded-full flex items-center justify-center shadow-md disabled:opacity-40 active:scale-95 transition-transform"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
