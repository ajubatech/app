import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'ai' }[]>([
    { text: "Hi! I'm ListAI, your personal marketplace assistant. How can I help you today?", sender: 'ai' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: message, sender: 'user' }]);
    const userMessage = message;
    setMessage('');
    
    // Show typing indicator
    setIsTyping(true);

    try {
      // Try to get AI response from edge function
      try {
        const { data, error } = await supabase.functions.invoke('ai-onboarding', {
          body: { 
            message: userMessage,
            isNewUser: false
          }
        });

        if (error) throw error;

        // Add AI response after a short delay to simulate typing
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            text: data.response || "I'll help you with that!", 
            sender: 'ai' 
          }]);
          setIsTyping(false);
        }, 1000);
      } catch (error) {
        console.error('Error getting AI response:', error);
        
        // Fallback response if edge function fails
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            text: "I'll help you with that! What specifically would you like to know about our marketplace?", 
            sender: 'ai' 
          }]);
          setIsTyping(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Error in chat flow:', error);
      setMessages(prev => [...prev, { 
        text: "I'm having trouble processing your request right now. Please try again later.", 
        sender: 'ai' 
      }]);
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl mb-4 w-[380px] overflow-hidden border"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-medium">ListAI Assistant</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
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
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl p-3 max-w-[80%]">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="border-t p-4">
              <div className="relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
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
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white p-4 rounded-full shadow-lg flex items-center gap-2"
      >
        <Sparkles className="w-5 h-5" />
        {!isOpen && <span className="font-medium">Ask ListAI</span>}
        {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
      </motion.button>
    </div>
  );
}