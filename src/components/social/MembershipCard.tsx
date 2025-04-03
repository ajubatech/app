import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Download, 
  Share2, 
  Crown, 
  Check,
  Calendar,
  Image,
  Palette,
  BarChart2,
  Link as LinkIcon
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface MembershipCardProps {
  onClose: () => void;
}

export default function MembershipCard({ onClose }: MembershipCardProps) {
  const { user } = useAuthStore();
  const [isDownloading, setIsDownloading] = useState(false);
  
  const handleDownload = () => {
    setIsDownloading(true);
    
    // Simulate download delay
    setTimeout(() => {
      setIsDownloading(false);
      // In a real implementation, this would trigger a download
      alert('Membership card downloaded!');
    }, 1500);
  };
  
  const handleShare = () => {
    // In a real implementation, this would open a share dialog
    alert('Share functionality would be implemented here');
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl p-6 max-w-md w-full"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Membership Card</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Membership Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            <span className="font-bold">ListHouze Pro+</span>
          </div>
          <span className="text-sm opacity-80">Social Media Dashboard</span>
        </div>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            {user?.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.full_name || 'User'} 
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <span className="text-white text-2xl font-bold">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg">{user?.full_name || 'User'}</h3>
            <p className="text-sm text-white/80">{user?.email}</p>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-white/80">Member Since</p>
            <p className="font-medium">March 2025</p>
          </div>
          <div>
            <p className="text-sm text-white/80">Membership ID</p>
            <p className="font-medium">LH-{user?.id?.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>
      </div>
      
      {/* Membership Benefits */}
      <div className="mb-6">
        <h3 className="font-medium mb-3">Pro+ Benefits</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span>Unlimited social media scheduling</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span>Access to premium templates</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span>Advanced analytics and reporting</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span>Multiple brand kit management</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <span>Team collaboration features</span>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isDownloading ? 'Downloading...' : (
            <>
              <Download className="w-5 h-5" />
              Download
            </>
          )}
        </button>
        <button
          onClick={handleShare}
          className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          <Share2 className="w-5 h-5" />
          Share
        </button>
      </div>
    </motion.div>
  );
}