import React from 'react';
import { Search, Plus, Phone, Camera as VideoCamera } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Messages() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Messages</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <button
                key={i}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-full" />
                <div className="flex-1 text-left">
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-gray-600 truncate">
                    Hey, I'm interested in your listing...
                  </p>
                </div>
                <span className="text-xs text-gray-500">2h ago</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div>
                <p className="font-medium">John Doe</p>
                <p className="text-sm text-gray-600">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <VideoCamera className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4">
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="bg-gray-100 rounded-lg p-3 max-w-md">
                <p>Hey, I'm interested in your listing. Is it still available?</p>
                <span className="text-xs text-gray-500 mt-1">2:30 PM</span>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <div className="bg-blue-600 text-white rounded-lg p-3 max-w-md">
                <p>Yes, it's still available! Would you like to schedule a viewing?</p>
                <span className="text-xs text-blue-200 mt-1">2:32 PM</span>
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="bg-white border-t p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Type a message..."
              className="w-full pr-20 pl-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700"
            >
              Send
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}