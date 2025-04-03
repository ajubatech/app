import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

export default function EarnWithListAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'ai' }[]>([
    {
      text: "Hi! I'm your AI Income Coach. I can help you find earning opportunities and suggest ways to increase your income. What would you like to know?",
      sender: 'ai'
    }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: message, sender: 'user' }]);
    const userMessage = message;
    setMessage('');

    try {
      // Get AI response
      const { data, error } = await supabase.functions.invoke('ai-income-coach', {
        body: { message: userMessage }
      });

      if (error) throw error;

      // Add AI response
      setMessages(prev => [...prev, { text: data.response, sender: 'ai' }]);

      // Save recommendation if applicable
      if (data.recommendation) {
        await supabase
          .from('ai_recommendations')
          .insert({
            type: data.recommendation.type,
            content: data.recommendation.content
          });
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error('Failed to get response');
    }
  };

  return (
    <motion.div
      initial={false}
      animate={isOpen ? 'open' : 'closed'}
      className="fixed bottom-4 right-4 z-50"
    >
      <motion.div
        variants={{
          open: { opacity: 1, y: 0, display: 'block' },
          closed: { opacity: 0, y: 20, display: 'none' }
        }}
        className="bg-white rounded-2xl shadow-xl mb-4 w-[380px] overflow-hidden border"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-medium">Income Coach</span>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[400px] overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3 ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t p-4">
          <div className="relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about earning opportunities..."
              className="w-full pl-4 pr-12 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </motion.div>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white p-4 rounded-full shadow-lg flex items-center gap-2"
      >
        <Sparkles className="w-5 h-5" />
        {!isOpen && <span className="font-medium">Need Help Earning?</span>}
        {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
      </motion.button>
    </motion.div>
  );
}