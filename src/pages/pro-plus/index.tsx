import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Settings, Calendar, History, Crown, ArrowRight, Check, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import SubscriptionPlans from '../../components/SubscriptionPlans';
import CreditPacksGrid from '../../components/CreditPacksGrid';
import { useAuthStore } from '../../store/authStore';
import { useStripeBilling } from '../../hooks/useStripeBilling';

export default function ProPlus() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { getSubscriptionStatus, createCustomerPortalSession } = useStripeBilling();
  const [activeTab, setActiveTab] = useState<'plans' | 'credits'>('plans');
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setIsLoading(true);
      const data = await getSubscriptionStatus();
      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageBilling = async () => {
    await createCustomerPortalSession();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white px-4 py-2 rounded-full mb-4">
            <Crown className="w-5 h-5" />
            <span className="font-medium">Pro+ Features</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Upgrade Your ListHouze Experience
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get unlimited AI credits, advanced features, and priority support
          </p>
        </div>

        {/* Current Subscription */}
        {subscription && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Current Subscription</h2>
                  <p className="text-gray-600">
                    {subscription.plan === 'free' 
                      ? 'Free Plan' 
                      : `${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan`}
                  </p>
                </div>
              </div>
              
              {subscription.plan !== 'free' && (
                <button
                  onClick={handleManageBilling}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Manage Billing
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 mb-1">AI Credits</p>
                <p className="text-2xl font-bold">
                  {subscription.credits.ai >= 999999 ? 'Unlimited' : subscription.credits.ai}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 mb-1">Listing Credits</p>
                <p className="text-2xl font-bold">
                  {subscription.credits.listing >= 999999 ? 'Unlimited' : subscription.credits.listing}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 mb-1">Next Renewal</p>
                <p className="text-2xl font-bold">
                  {subscription.subscription?.current_period_end 
                    ? new Date(subscription.subscription.current_period_end).toLocaleDateString() 
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeTab === 'plans'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Subscription Plans
          </button>
          <button
            onClick={() => setActiveTab('credits')}
            className={`px-6 py-3 rounded-lg font-medium ${
              activeTab === 'credits'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Buy Credits
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {activeTab === 'plans' ? (
            <>
              <h2 className="text-2xl font-semibold text-center mb-8">
                Choose Your Pro+ Plan
              </h2>
              <SubscriptionPlans 
                onSelect={() => {}} 
                currentPlan={user?.subscription_type}
              />
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-center mb-8">
                Purchase Additional Credits
              </h2>
              <CreditPacksGrid />
            </>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Call Agents</h3>
            <p className="text-gray-600 mb-4">
              24/7 automated call handling with natural language understanding
            </p>
            <ul className="space-y-2">
              {[
                'Handle incoming inquiries',
                'Answer common questions',
                'Route priority calls',
                'Multilingual support'
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Scheduling</h3>
            <p className="text-gray-600 mb-4">
              Automated appointment booking and calendar management
            </p>
            <ul className="space-y-2">
              {[
                'Book appointments 24/7',
                'Sync with your calendar',
                'Send reminders',
                'Handle rescheduling'
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <History className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Call Analytics</h3>
            <p className="text-gray-600 mb-4">
              Detailed insights and performance tracking
            </p>
            <ul className="space-y-2">
              {[
                'Call summaries',
                'Sentiment analysis',
                'Conversion tracking',
                'Performance reports'
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}