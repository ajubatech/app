import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Home, 
  Search, 
  MessageSquare, 
  Heart, 
  User,
  PlusCircle,
  Calendar
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function MobileNav() {
  const location = useLocation();
  const { user, userRole } = useAuthStore();
  
  // Only show for authenticated users
  if (!user) return null;
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40">
      <div className="flex justify-around items-center h-16">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive('/dashboard') ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-xs mt-1">Dashboard</span>
        </Link>
        
        <Link
          to="/explore"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive('/explore') ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-xs mt-1">Explore</span>
        </Link>
        
        {(userRole === 'lister' || userRole === 'business') && (
          <Link
            to="/create-listing"
            className="flex flex-col items-center justify-center w-full h-full relative"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center -mt-6 shadow-lg">
              <PlusCircle className="w-6 h-6 text-white" />
            </div>
          </Link>
        )}
        
        {(userRole === 'lister' || userRole === 'business') && (
          <Link
            to="/social"
            className={`flex flex-col items-center justify-center w-full h-full ${
              location.pathname.startsWith('/social') ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs mt-1">Social</span>
          </Link>
        )}
        
        <Link
          to="/messages"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive('/messages') ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-xs mt-1">Messages</span>
        </Link>
        
        <Link
          to="/saved"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive('/saved') ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-xs mt-1">Saved</span>
        </Link>
      </div>
    </div>
  );
}