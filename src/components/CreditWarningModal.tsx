import React from 'react';
import { motion } from 'framer-motion';
import { X, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CreditWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'ai' | 'manual';
}

export default function CreditWarningModal({ isOpen, onClose, type }: CreditWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <Crown className="w-5 h-5 text-yellow-600" />
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h2 className="text-xl font-bold mb-2">
          {type === 'ai' 
            ? "You've used all your AI credits"
            : "You've reached your listing limit"
          }
        </h2>
        
        <p className="text-gray-600 mb-6">
          {type === 'ai'
            ? "Upgrade to Pro+ for unlimited AI-powered listing creation and optimization."
            : "Upgrade to Pro+ for unlimited listings and advanced features."
          }
        </p>

        <div className="space-y-4">
          <Link
            to="/pro-plus"
            className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold text-center hover:from-blue-700 hover:to-purple-700"
          >
            Upgrade to Pro+
          </Link>
          
          {type === 'ai' && (
            <button
              onClick={onClose}
              className="block w-full border border-gray-300 py-3 rounded-xl font-semibold text-center hover:bg-gray-50"
            >
              Continue without AI
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}