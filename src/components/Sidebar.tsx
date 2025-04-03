import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, PlusCircle, Film, 
  MessageSquare, Sparkles, ChevronDown, Settings,
  DollarSign, Crown, Home, Package, Car, Wrench,
  Search, Heart, Bell, User, Calendar
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Sidebar() {
  const location = useLocation();
  const { userRole, user } = useAuthStore();
  const [expandedSection, setExpandedSection] = React.useState<string | null>('crm');

  const isActive = (path: string) => location.pathname === path;
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Only show sidebar if user is logged in
  if (!user) return null;

  return (
    <div className="w-64 bg-white border-r h-screen sticky top-0 overflow-y-auto hidden md:block">
      <div className="p-4">
        {/* User Profile */}
        <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            {user?.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.full_name || 'User'} 
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user?.full_name || 'User'}</p>
            <p className="text-xs text-gray-500 capitalize">{userRole || 'User'}</p>
          </div>
        </div>

        <div className="space-y-1">
          <Link
            to="/dashboard"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              isActive('/dashboard') 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/explore"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              isActive('/explore') 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Search className="w-5 h-5" />
            <span>Explore</span>
          </Link>

          {/* Conditional navigation based on user role */}
          {(userRole === 'lister' || userRole === 'business') && (
            <>
              <Link
                to="/create-listing"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  isActive('/create-listing')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <PlusCircle className="w-5 h-5" />
                <span>Create Listing</span>
              </Link>

              <Link
                to="/reels"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  isActive('/reels')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Film className="w-5 h-5" />
                <span>Reels</span>
              </Link>
              
              <Link
                to="/crm/invoices"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  isActive('/crm/invoices')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <DollarSign className="w-5 h-5" />
                <span>Invoices</span>
              </Link>
              
              <Link
                to="/social"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  location.pathname.startsWith('/social')
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Social Media</span>
              </Link>
            </>
          )}

          {userRole === 'business' && (
            <Link
              to="/business-profile"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                isActive('/business-profile')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Building2 className="w-5 h-5" />
              <span>Business Profile</span>
            </Link>
          )}

          {/* Common navigation for all users */}
          <Link
            to="/messages"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              isActive('/messages')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Messages</span>
          </Link>

          <Link
            to="/saved"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              isActive('/saved')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Heart className="w-5 h-5" />
            <span>Saved</span>
          </Link>

          <Link
            to="/notifications"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              isActive('/notifications')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </Link>

          <Link
            to="/chat-with-ai"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              isActive('/chat-with-ai')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>Chat with AI</span>
          </Link>

          <Link
            to="/ai/earn-money"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              isActive('/ai/earn-money')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span>AI Income Coach</span>
          </Link>

          <Link
            to="/pro-plus"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              isActive('/pro-plus')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Crown className="w-5 h-5" />
            <span>Pro+ Features</span>
          </Link>

          <Link
            to="/settings"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              isActive('/settings')
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </div>

        {/* Categories Section */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
            Categories
          </h3>
          <div className="space-y-1">
            <Link
              to="/real-estate/category/all"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                location.pathname.includes('/real-estate')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Home className="w-5 h-5" />
              <span>Real Estate</span>
            </Link>
            
            <Link
              to="/products/category/all"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                location.pathname.includes('/products')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Package className="w-5 h-5" />
              <span>Products</span>
            </Link>
            
            <Link
              to="/services/category/all"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                location.pathname.includes('/services')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Wrench className="w-5 h-5" />
              <span>Services</span>
            </Link>
            
            <Link
              to="/automotive/category/all"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                location.pathname.includes('/automotive')
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Car className="w-5 h-5" />
              <span>Automotive</span>
            </Link>
          </div>
        </div>
        
        {/* Social Media Dashboard Section */}
        {(userRole === 'lister' || userRole === 'business') && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
              Social Media
            </h3>
            <div className="space-y-1">
              <Link
                to="/social"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  location.pathname === '/social'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                to="/social/templates"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  location.pathname === '/social/templates'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Image className="w-5 h-5" />
                <span>Templates</span>
              </Link>
              
              <Link
                to="/social/brand-kits"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  location.pathname === '/social/brand-kits'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Palette className="w-5 h-5" />
                <span>Brand Kits</span>
              </Link>
              
              <Link
                to="/social/calendar"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  location.pathname === '/social/calendar'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Calendar</span>
              </Link>
              
              <Link
                to="/social/analytics"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  location.pathname === '/social/analytics'
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BarChart2 className="w-5 h-5" />
                <span>Analytics</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}