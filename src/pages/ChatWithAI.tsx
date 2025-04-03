import React, { useState } from 'react';
import { Sparkles, Send, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChatWithAI() {
  const [message, setMessage] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Chat with ListAI</h1>
            <p className="text-gray-600">Get help with your listings and marketplace activities</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border min-h-[600px] flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 p-6 space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="bg-gray-100 rounded-lg p-4 inline-block">
                  Hi! I'm your ListAI assistant. How can I help you today?
                </p>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full pr-24 pl-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white px-4 py-1.5 rounded-lg hover:opacity-90"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Quick Actions:</p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 flex items-center gap-1">
                  Generate Description
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 flex items-center gap-1">
                  Optimize Pricing
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 flex items-center gap-1">
                  Market Analysis
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}