import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ListPlus, Clock, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

interface CreditUsageWidgetProps {
  className?: string;
  showUpgradeButton?: boolean;
}

export default function CreditUsageWidget({ className = '', showUpgradeButton = true }: CreditUsageWidgetProps) {
  const { user } = useAuthStore();
  const [listingCount, setListingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadListingCount();
    }
  }, [user]);

  const loadListingCount = async () => {
    try {
      setIsLoading(true);
      
      // Get count of user's listings created this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { count, error } = await supabase
        .from('listings')
        .select('*', { count: 'exact' })
        .eq('user_id', user?.id)
        .gte('created_at', startOfMonth.toISOString());
        
      if (error) throw error;
      setListingCount(count || 0);
    } catch (error) {
      console.error('Error loading listing count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate days until reset (resets on the 1st of each month)
  const daysUntilReset = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const diffTime = Math.abs(nextMonth.getTime() - today.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get limits based on subscription type
  const getLimits = () => {
    switch (user?.subscription_type) {
      case 'pro':
        return { ai: 999999, manual: 999999 }; // Unlimited
      case 'business':
        return { ai: 999999, manual: 999999 }; // Unlimited
      case 'basic':
        return { ai: 20, manual: 20 };
      default:
        return { ai: 10, manual: 5 };
    }
  };

  const limits = getLimits();
  const isUnlimitedAI = limits.ai >= 999999;
  const isUnlimitedListings = limits.manual >= 999999;

  return (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Usage & Credits</h2>
        {showUpgradeButton && (
          <Link
            to="/pro-plus"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Upgrade Plan
          </Link>
        )}
      </div>

      <div className="space-y-6">
        {/* AI Credits */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="font-medium">AI Credits</span>
            </div>
            <span className="text-sm text-gray-600">
              {isUnlimitedAI ? (
                <span className="text-green-600 font-medium">Unlimited</span>
              ) : (
                `${user?.ai_credits || 0} / ${limits.ai} remaining`
              )}
            </span>
          </div>
          {!isUnlimitedAI && (
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, ((user?.ai_credits || 0) / limits.ai) * 100)}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
              />
            </div>
          )}
        </div>

        {/* Manual Listings */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ListPlus className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Manual Listings</span>
            </div>
            <span className="text-sm text-gray-600">
              {isUnlimitedListings ? (
                <span className="text-green-600 font-medium">Unlimited</span>
              ) : (
                `${listingCount} / ${limits.manual} used this month`
              )}
            </span>
          </div>
          {!isUnlimitedListings && (
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (listingCount / limits.manual) * 100)}%` }}
                className="h-full bg-blue-500"
              />
            </div>
          )}
        </div>

        {/* Reset Timer */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Clock className="w-5 h-5 text-gray-600" />
          <div>
            <p className="text-sm text-gray-600">Credits reset in</p>
            <p className="font-medium">{daysUntilReset()} days</p>
          </div>
        </div>

        {/* Pro+ Features */}
        {(!user?.subscription_type || user?.subscription_type === 'free' || user?.subscription_type === 'basic') && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">Pro+ Features</span>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Unlimited AI credits
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Unlimited manual listings
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Priority support
              </li>
              {user?.subscription_type !== 'basic' && (
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Advanced AI features
                </li>
              )}
            </ul>
            
            {showUpgradeButton && (
              <Link
                to="/pro-plus"
                className="mt-4 block w-full text-center bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white py-2 rounded-lg font-medium hover:opacity-90"
              >
                Upgrade Now
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}