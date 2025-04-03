import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowRight, Bell, Calendar, Home, Package, Wrench, Car, Heart, MessageSquare, Clock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import CreditUsageWidget from '../components/CreditUsageWidget';
import BuyerDashboard from '../components/dashboards/BuyerDashboard';
import ListerDashboard from '../components/dashboards/ListerDashboard';
import BusinessDashboard from '../components/dashboards/BusinessDashboard';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user, userRole } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotifications();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const renderDashboard = () => {
    switch (userRole) {
      case 'buyer':
        return <BuyerDashboard />;
      case 'lister':
        return <ListerDashboard />;
      case 'business':
        return <BusinessDashboard />;
      default:
        return <BuyerDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.full_name || 'there'}!</h1>
              <p className="text-blue-100">
                {userRole === 'buyer' && 'Find your perfect property or product today.'}
                {userRole === 'lister' && 'Manage your listings and connect with potential buyers.'}
                {userRole === 'business' && 'Grow your business with our powerful tools and insights.'}
              </p>
            </div>
            <div className="flex gap-3">
              {userRole === 'buyer' && (
                <Link
                  to="/explore"
                  className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50"
                >
                  <Search className="w-5 h-5" />
                  <span>Explore</span>
                </Link>
              )}
              {(userRole === 'lister' || userRole === 'business') && (
                <Link
                  to="/create-listing"
                  className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Listing</span>
                </Link>
              )}
              {(userRole === 'lister' || userRole === 'business') && (
                <Link
                  to="/reels"
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-400"
                >
                  <Film className="w-5 h-5" />
                  <span>Create Reel</span>
                </Link>
              )}
              {userRole === 'business' && (
                <Link
                  to="/business-profile"
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-400"
                >
                  <Building2 className="w-5 h-5" />
                  <span>Business Profile</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Role-Based Dashboard */}
        {renderDashboard()}

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickActionCard
                icon={<Home className="w-6 h-6 text-blue-600" />}
                title="Real Estate"
                description="Browse properties"
                link="/real-estate/category/all"
              />
              <QuickActionCard
                icon={<Package className="w-6 h-6 text-green-600" />}
                title="Products"
                description="Shop items"
                link="/products/category/all"
              />
              <QuickActionCard
                icon={<Wrench className="w-6 h-6 text-purple-600" />}
                title="Services"
                description="Find services"
                link="/services/category/all"
              />
              <QuickActionCard
                icon={<Car className="w-6 h-6 text-red-600" />}
                title="Automotive"
                description="Explore vehicles"
                link="/automotive/category/all"
              />
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <Bell className="w-5 h-5 text-gray-400" />
            </div>
            
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">{notification.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>No new notifications</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}

function QuickActionCard({ icon, title, description, link }: QuickActionCardProps) {
  return (
    <Link to={link}>
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-3">{icon}</div>
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </motion.div>
    </Link>
  );
}

// Import these at the top of the file
import { Search, Film, Building2, LayoutDashboard } from 'lucide-react';