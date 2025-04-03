import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, ChevronUp, ChevronDown, Home, Package, Car, Wrench, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface SmartPrompt {
  id: string;
  text: string;
  icon: React.ReactNode;
  action: () => void;
}

export default function ListAIOnboardingWidget() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'ai' }[]>([
    { 
      text: "👋 Hi, I'm ListAI! Need help creating your first listing?", 
      sender: 'ai' 
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);

  // Check if user has seen the intro
  useEffect(() => {
    const introSeen = localStorage.getItem('listai_intro_seen');
    if (introSeen) {
      setHasSeenIntro(true);
    }
  }, []);

  // Auto-open for new users after a delay
  useEffect(() => {
    if (!hasSeenIntro) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem('listai_intro_seen', 'true');
        setHasSeenIntro(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [hasSeenIntro]);

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
      // Simulate AI response (fallback if edge function fails)
      const fallbackResponse = "I'll help you with that! To create a listing, go to the 'Create Listing' button in the top navigation or dashboard. You can choose the type of listing and follow the guided process.";
      
      // Try to get AI response from edge function
      try {
        const { data, error } = await supabase.functions.invoke('ai-onboarding', {
          body: { 
            message: userMessage,
            userId: user?.id,
            isNewUser: !hasSeenIntro
          }
        });

        if (error) throw error;

        // Add AI response after a short delay to simulate typing
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            text: data.response || fallbackResponse, 
            sender: 'ai' 
          }]);
          setIsTyping(false);
        }, 1000);
      } catch (error) {
        console.error('Error getting AI response:', error);
        
        // Use fallback response if edge function fails
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            text: fallbackResponse, 
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

  const handleSmartPrompt = async (prompt: SmartPrompt) => {
    // Add user message
    setMessages(prev => [...prev, { text: prompt.text, sender: 'user' }]);
    
    // Show typing indicator
    setIsTyping(true);

    // Execute the action after a short delay
    setTimeout(() => {
      prompt.action();
      setIsTyping(false);
    }, 500);
  };

  const smartPrompts: SmartPrompt[] = [
    {
      id: 'property',
      text: "I want to rent out a property",
      icon: <Home className="w-4 h-4" />,
      action: () => {
        setMessages(prev => [...prev, { 
          text: "Great! I'll help you list your property. Let me guide you through the process.", 
          sender: 'ai' 
        }]);
        setTimeout(() => navigate('/listings/new/real-estate'), 1500);
      }
    },
    {
      id: 'product',
      text: "I want to list a product",
      icon: <Package className="w-4 h-4" />,
      action: () => {
        setMessages(prev => [...prev, { 
          text: "Perfect! Let's create a product listing together. I'll help you make it stand out.", 
          sender: 'ai' 
        }]);
        setTimeout(() => navigate('/listings/new/product'), 1500);
      }
    },
    {
      id: 'car',
      text: "I want to sell my car",
      icon: <Car className="w-4 h-4" />,
      action: () => {
        setMessages(prev => [...prev, { 
          text: "Selling your car? I'll help you create an attractive listing with all the important details.", 
          sender: 'ai' 
        }]);
        setTimeout(() => navigate('/listings/new/automotive'), 1500);
      }
    },
    {
      id: 'service',
      text: "I want to offer a service",
      icon: <Wrench className="w-4 h-4" />,
      action: () => {
        setMessages(prev => [...prev, { 
          text: "Service listings are a great way to showcase your skills. Let's create one that highlights your expertise!", 
          sender: 'ai' 
        }]);
        setTimeout(() => navigate('/listings/new/service'), 1500);
      }
    },
    {
      id: 'money',
      text: "Help me make extra money",
      icon: <DollarSign className="w-4 h-4" />,
      action: () => {
        setMessages(prev => [...prev, { 
          text: "I'd be happy to help you find ways to earn extra income! Let me show you some options based on your skills and interests.", 
          sender: 'ai' 
        }]);
        setTimeout(() => navigate('/ai/earn-money'), 1500);
      }
    }
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50" id="listai-widget">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-xl mb-4 w-[350px] overflow-hidden border"
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
            <div className="h-[320px] overflow-y-auto p-4 space-y-4">
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

            {/* Smart Prompts */}
            <div className="px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Quick Actions:</p>
              <div className="flex flex-wrap gap-2">
                {smartPrompts.map((prompt) => (
                  <button
                    key={prompt.id}
                    onClick={() => handleSmartPrompt(prompt)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
                  >
                    {prompt.icon}
                    <span>{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="border-t p-4">
              <div className="relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask me anything..."
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
        id="listai-widget-button"
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