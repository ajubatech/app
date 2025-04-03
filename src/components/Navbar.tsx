import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home, Search, PlusCircle, User, ShoppingBag, Building2, 
  Car, Wrench, ChevronDown, Settings, LogOut, Bell, Map,
  Menu, X, Heart, MessageSquare, Film, Sparkles,
  LayoutDashboard, Calendar, Image, Palette, BarChart2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, userRole, signOut } = useAuthStore();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMouseEnter = (menu: string) => {
    setActiveMenu(menu);
  };

  const handleMouseLeave = () => {
    setActiveMenu(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">ListHouze</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(item.name)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    to={item.path}
                    className="flex items-center gap-1 py-2 text-gray-600 hover:text-gray-900"
                  >
                    {item.icon}
                    <span>{item.name}</span>
                    {item.submenu && <ChevronDown className="w-4 h-4" />}
                  </Link>

                  <AnimatePresence>
                    {activeMenu === item.name && item.submenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 w-64 bg-white rounded-lg shadow-lg py-2 mt-1 z-50"
                      >
                        {item.submenu.map((subitem) => (
                          <Link
                            key={subitem.name}
                            to={subitem.path}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50"
                          >
                            {subitem.icon}
                            <div>
                              <p className="font-medium">{subitem.name}</p>
                              <p className="text-sm text-gray-500">{subitem.description}</p>
                            </div>
                          </Link>
                        ))}
                        <Link
                          to={item.path}
                          className="flex items-center justify-between px-4 py-2 mt-2 border-t text-blue-600 hover:bg-blue-50"
                        >
                          <span>View All {item.name}</span>
                          <ChevronDown className="w-4 h-4" />
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              
              <Link
                to="/explore"
                className="flex items-center gap-1 py-2 text-gray-600 hover:text-gray-900"
              >
                <Map className="w-5 h-5" />
                <span>Explore</span>
              </Link>
              
              {(userRole === 'lister' || userRole === 'business') && (
                <Link
                  to="/social"
                  className="flex items-center gap-1 py-2 text-gray-600 hover:text-gray-900"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Social</span>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Button */}
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Search className="w-6 h-6 text-gray-600" />
            </button>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 hover:bg-gray-100 rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
            
            {user ? (
              <>
                {/* Create Listing Button (for lister and business) */}
                {(userRole === 'lister' || userRole === 'business') && (
                  <Link 
                    to="/create-listing"
                    className="hidden md:flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>Create Listing</span>
                  </Link>
                )}

                {/* Notifications */}
                <Link to="/notifications" className="p-2 hover:bg-gray-100 rounded-full relative">
                  <Bell className="w-6 h-6 text-gray-600" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                </Link>

                {/* User Profile */}
                <div
                  className="relative"
                  onMouseEnter={() => handleMouseEnter('profile')}
                  onMouseLeave={handleMouseLeave}
                >
                  <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-full">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {activeMenu === 'profile' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full right-0 w-64 bg-white rounded-lg shadow-lg py-2 mt-1 z-50"
                      >
                        <div className="px-4 py-3 border-b">
                          <p className="font-medium">{user.full_name || user.email}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <div className="mt-2 flex items-center">
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full capitalize">
                              {userRole || 'User'}
                            </span>
                            {user.subscription_type && user.subscription_type !== 'free' && (
                              <span className="ml-2 text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full capitalize">
                                {user.subscription_type}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="py-1">
                          <Link
                            to="/dashboard"
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            <span>Dashboard</span>
                          </Link>
                          <Link
                            to="/profile"
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50"
                          >
                            <User className="w-4 h-4" />
                            <span>Profile</span>
                          </Link>
                          <Link
                            to="/saved"
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50"
                          >
                            <Heart className="w-4 h-4" />
                            <span>Saved Items</span>
                          </Link>
                          <Link
                            to="/messages"
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>Messages</span>
                          </Link>
                          {(userRole === 'lister' || userRole === 'business') && (
                            <Link
                              to="/reels"
                              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50"
                            >
                              <Film className="w-4 h-4" />
                              <span>My Reels</span>
                            </Link>
                          )}
                          <Link
                            to="/chat-with-ai"
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Chat with AI</span>
                          </Link>
                          {(userRole === 'lister' || userRole === 'business') && (
                            <Link
                              to="/social"
                              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50"
                            >
                              <Calendar className="w-4 h-4" />
                              <span>Social Media</span>
                            </Link>
                          )}
                        </div>
                        
                        <div className="py-1 border-t">
                          <Link
                            to="/settings"
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white px-6 py-2 rounded-full hover:opacity-90"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t overflow-hidden"
          >
            <div className="px-4 py-2 space-y-1">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                to="/explore"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Map className="w-5 h-5" />
                <span>Explore</span>
              </Link>
              
              {(userRole === 'lister' || userRole === 'business') && (
                <>
                  <Link
                    to="/create-listing"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>Create Listing</span>
                  </Link>
                  
                  <Link
                    to="/reels"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Film className="w-5 h-5" />
                    <span>Reels</span>
                  </Link>
                  
                  <Link
                    to="/social"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Social Media</span>
                  </Link>
                </>
              )}
              
              {userRole === 'business' && (
                <Link
                  to="/business-profile"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Building2 className="w-5 h-5" />
                  <span>Business Profile</span>
                </Link>
              )}
              
              <Link
                to="/messages"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <MessageSquare className="w-5 h-5" />
                <span>Messages</span>
              </Link>
              
              <Link
                to="/saved"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart className="w-5 h-5" />
                <span>Saved</span>
              </Link>
              
              <Link
                to="/chat-with-ai"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Sparkles className="w-5 h-5" />
                <span>Chat with AI</span>
              </Link>
              
              <Link
                to="/settings"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
              
              {user && (
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

const navItems = [
  {
    name: 'Products',
    path: '/products',
    icon: <ShoppingBag className="w-5 h-5" />,
    submenu: [
      {
        name: 'Fashion',
        path: '/products/category/fashion',
        icon: <ShoppingBag className="w-4 h-4" />,
        description: 'Clothing, shoes, and accessories'
      },
      {
        name: 'Electronics',
        path: '/products/category/electronics',
        icon: <ShoppingBag className="w-4 h-4" />,
        description: 'Phones, laptops, and gadgets'
      },
      {
        name: 'Home & Garden',
        path: '/products/category/home-garden',
        icon: <ShoppingBag className="w-4 h-4" />,
        description: 'Furniture, decor, and outdoor'
      },
      {
        name: 'Food & Drink',
        path: '/products/category/food-drink',
        icon: <ShoppingBag className="w-4 h-4" />,
        description: 'Local food and beverages'
      }
    ]
  },
  {
    name: 'Real Estate',
    path: '/real-estate/category/all',
    icon: <Building2 className="w-5 h-5" />,
    submenu: [
      {
        name: 'For Sale',
        path: '/real-estate/category/for-sale',
        icon: <Building2 className="w-4 h-4" />,
        description: 'Houses and apartments for sale'
      },
      {
        name: 'For Rent',
        path: '/real-estate/category/for-rent',
        icon: <Building2 className="w-4 h-4" />,
        description: 'Rental properties'
      },
      {
        name: 'Commercial',
        path: '/real-estate/category/commercial',
        icon: <Building2 className="w-4 h-4" />,
        description: 'Office and retail spaces'
      },
      {
        name: 'Land',
        path: '/real-estate/category/land',
        icon: <Building2 className="w-4 h-4" />,
        description: 'Vacant land and sections'
      }
    ]
  },
  {
    name: 'Automotive',
    path: '/automotive',
    icon: <Car className="w-5 h-5" />,
    submenu: [
      {
        name: 'Vehicles',
        path: '/automotive/category/vehicles',
        icon: <Car className="w-4 h-4" />,
        description: 'Cars, bikes, and boats'
      },
      {
        name: 'Parts',
        path: '/automotive/category/parts',
        icon: <Car className="w-4 h-4" />,
        description: 'Auto parts and accessories'
      },
      {
        name: 'Repairs',
        path: '/automotive/category/repairs',
        icon: <Car className="w-4 h-4" />,
        description: 'Mechanics and services'
      }
    ]
  },
  {
    name: 'Services',
    path: '/services',
    icon: <Wrench className="w-5 h-5" />,
    submenu: [
      {
        name: 'Home Services',
        path: '/services/category/home',
        icon: <Wrench className="w-4 h-4" />,
        description: 'Cleaning, repairs, and maintenance'
      },
      {
        name: 'Creative',
        path: '/services/category/creative',
        icon: <Wrench className="w-4 h-4" />,
        description: 'Design, writing, and media'
      },
      {
        name: 'Personal Care',
        path: '/services/category/personal-care',
        icon: <Wrench className="w-4 h-4" />,
        description: 'Beauty and wellness'
      },
      {
        name: 'Health',
        path: '/services/category/health',
        icon: <Wrench className="w-4 h-4" />,
        description: 'Medical and fitness'
      },
      {
        name: 'Education',
        path: '/services/category/education',
        icon: <Wrench className="w-4 h-4" />,
        description: 'Tutoring and courses'
      }
    ]
  }
];