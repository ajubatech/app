import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  Image, 
  Palette, 
  BarChart2, 
  Link as LinkIcon, 
  Settings,
  ChevronRight,
  ChevronLeft,
  Home
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

export default function SocialSidebar() {
  const location = useLocation();
  const { user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;
  
  const menuItems = [
    { 
      path: '/social', 
      icon: <Home className="w-5 h-5" />, 
      label: 'Dashboard',
      exact: true
    },
    { 
      path: '/social/templates', 
      icon: <Image className="w-5 h-5" />, 
      label: 'Templates'
    },
    { 
      path: '/social/brand-kits', 
      icon: <Palette className="w-5 h-5" />, 
      label: 'Brand Kits'
    },
    { 
      path: '/social/calendar', 
      icon: <Calendar className="w-5 h-5" />, 
      label: 'Calendar'
    },
    { 
      path: '/social/analytics', 
      icon: <BarChart2 className="w-5 h-5" />, 
      label: 'Analytics'
    },
    { 
      path: '/social/integrations', 
      icon: <LinkIcon className="w-5 h-5" />, 
      label: 'Integrations'
    },
    { 
      path: '/social/settings', 
      icon: <Settings className="w-5 h-5" />, 
      label: 'Settings'
    }
  ];
  
  return (
    <div className={`bg-white border-r shadow-sm relative transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} hidden md:block`}>
      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 bg-white border rounded-full p-1 shadow-sm z-10"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>
      
      {/* User Profile */}
      <div className={`p-4 border-b ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            {user?.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.full_name || 'User'} 
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-blue-600 font-semibold">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              {user?.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.full_name || 'User'} 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-blue-600 font-semibold">
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="font-medium truncate">{user?.full_name || 'User'}</p>
              <p className="text-xs text-gray-600 truncate">{user?.email}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Menu Items */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const active = item.exact 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Pro Badge */}
      {!collapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg">
            <p className="font-medium text-sm">ListHouze Pro+</p>
            <p className="text-xs text-white/80">Social Media Dashboard</p>
          </div>
        </div>
      )}
    </div>
  );
}