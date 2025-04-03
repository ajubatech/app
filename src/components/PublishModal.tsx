import React from 'react';
import { motion } from 'framer-motion';
import { X, Share2, Instagram, Facebook, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCreateReel?: () => void;
  listingTitle: string;
}

export default function PublishModal({
  isOpen,
  onClose,
  onConfirm,
  onCreateReel,
  listingTitle
}: PublishModalProps) {
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
          <h2 className="text-xl font-semibold">Ready to Publish?</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Your listing "{listingTitle}" will be visible to all users after publishing.
        </p>

        <div className="space-y-4 mb-6">
          <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input type="checkbox" className="rounded text-blue-600" defaultChecked />
            <div>
              <p className="font-medium">Create Social Posts</p>
              <p className="text-sm text-gray-600">
                Auto-generate posts for Instagram, Facebook, and Twitter
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input type="checkbox" className="rounded text-blue-600" defaultChecked />
            <div>
              <p className="font-medium">Boost with AI</p>
              <p className="text-sm text-gray-600">
                Apply AI-powered highlight template
              </p>
            </div>
          </label>
          
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <input type="checkbox" className="rounded text-blue-600" defaultChecked required />
            <div>
              <p className="font-medium">Accept Terms & Policies</p>
              <p className="text-sm text-gray-600">
                I confirm this listing complies with the <Link to="/legal/terms" className="text-blue-600 hover:underline" target="_blank">Terms</Link> and <Link to="/legal/acceptable-use" className="text-blue-600 hover:underline" target="_blank">Acceptable Use Policy</Link>
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConfirm}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
          >
            Publish Now
          </motion.button>

          {onCreateReel && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCreateReel}
              className="flex-1 border border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50"
            >
              Create Reel
            </motion.button>
          )}
        </div>

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-gray-600 mb-3">Share after publishing:</p>
          <div className="flex gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Instagram className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Facebook className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Twitter className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}