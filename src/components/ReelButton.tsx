import React from 'react';
import { motion } from 'framer-motion';
import { Film, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface ReelButtonProps {
  listingId: string;
  className?: string;
  buttonText?: string;
}

export default function ReelButton({ 
  listingId, 
  className = '', 
  buttonText = 'Create Reel'
}: ReelButtonProps) {
  const { user, userRole } = useAuthStore();
  
  const handleClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      toast.error('Please sign in to create reels');
      return;
    }
    
    if (userRole !== 'lister' && userRole !== 'business') {
      e.preventDefault();
      toast.error('Only listers and businesses can create reels');
      return;
    }
  };
  
  // Only show for lister or business users
  if (userRole !== 'lister' && userRole !== 'business') {
    return null;
  }
  
  return (
    <Link to={`/reels?listingId=${listingId}`}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 ${className}`}
      >
        <Film className="w-5 h-5" />
        {buttonText}
      </motion.button>
    </Link>
  );
}