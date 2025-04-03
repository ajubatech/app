import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Clock, Download, ExternalLink } from 'lucide-react';
import { useStripeBilling } from '../hooks/useStripeBilling';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function BillingSection() {
  const { user } = useAuthStore();
  const { getSubscriptionStatus, createCustomerPortalSession, cancelSubscription } = useStripeBilling();
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

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

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your current billing period.')) {
      return;
    }

    try {
      setIsCancelling(true);
      const success = await cancelSubscription();
      if (success) {
        toast.success('Subscription cancelled successfully');
        loadSubscriptionData();
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-24 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Billing</h2>
        <p className="text-gray-600 mb-4">No subscription data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Billing</h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleManageBilling}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <CreditCard className="w-5 h-5" />
          Manage Billing
        </motion.button>
      </div>

      <div className="space-y-6">
        {/* Current Plan */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">Current Plan</p>
              <p className="text-xl font-bold capitalize">
                {subscription.plan === 'free' 
                  ? 'Free Plan' 
                  : `${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan`}
              </p>
            </div>
            {subscription.subscription && (
              <div className="text-right">
                <p className="text-gray-600 mb-1">Price</p>
                <p className="text-xl font-bold">
                  ${subscription.subscription.plan.amount} / {subscription.subscription.plan.interval}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Next Billing */}
        {subscription.subscription && (
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg text-blue-800">
            <Clock className="w-5 h-5" />
            <div>
              <p className="font-medium">Next billing date</p>
              <p className="text-sm">
                {new Date(subscription.subscription.current_period_end).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* Payment Methods */}
        <div>
          <h3 className="text-lg font-medium mb-4">Payment Methods</h3>
          <button
            onClick={handleManageBilling}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <ExternalLink className="w-5 h-5" />
            Manage Payment Methods
          </button>
        </div>

        {/* Invoices */}
        <div>
          <h3 className="text-lg font-medium mb-4">Invoices</h3>
          <button
            onClick={handleManageBilling}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Download className="w-5 h-5" />
            View Invoices
          </button>
        </div>

        {/* Cancel Subscription */}
        {subscription.plan !== 'free' && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Cancel Subscription</h3>
            <p className="text-gray-600 mb-4">
              You can cancel your subscription at any time. You'll continue to have access until the end of your current billing period.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCancelSubscription}
              disabled={isCancelling || subscription.subscription?.cancel_at_period_end}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              {isCancelling ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                  Processing...
                </span>
              ) : subscription.subscription?.cancel_at_period_end ? (
                'Subscription will end on renewal date'
              ) : (
                'Cancel Subscription'
              )}
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}