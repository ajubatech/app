import React, { useState } from 'react';
import { Check, X, Crown, Sparkles, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { Subscription } from '../types';
import { useStripeBilling, PlanId } from '../hooks/useStripeBilling';
import toast from 'react-hot-toast';

const plans: Subscription[] = [
  {
    id: 'free',
    type: 'free',
    price: 0,
    aiCredits: 10,
    features: {
      aiListings: true,
      visionAI: true,
      propertyLookup: false,
      carLookup: false,
      crm: false,
      teamMembers: false,
      businessProfile: false
    }
  },
  {
    id: 'pro_monthly',
    type: 'pro',
    price: 29.99,
    aiCredits: 999999, // Unlimited
    features: {
      aiListings: true,
      visionAI: true,
      propertyLookup: true,
      carLookup: true,
      crm: true,
      teamMembers: false,
      businessProfile: false
    }
  },
  {
    id: 'business_monthly',
    type: 'business',
    price: 49.99,
    aiCredits: 999999, // Unlimited
    features: {
      aiListings: true,
      visionAI: true,
      propertyLookup: true,
      carLookup: true,
      crm: true,
      teamMembers: true,
      businessProfile: true
    },
    teamMembers: 5
  }
];

interface SubscriptionPlansProps {
  onSelect: (plan: Subscription) => void;
  currentPlan?: string;
}

export default function SubscriptionPlans({ onSelect, currentPlan }: SubscriptionPlansProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { checkoutWithStripe, isLoading } = useStripeBilling();

  const handleSelectPlan = async (plan: Subscription) => {
    if (plan.id === 'free') {
      onSelect(plan);
      return;
    }

    try {
      const planId = `${plan.id.split('_')[0]}_${billingCycle}` as PlanId;
      await checkoutWithStripe(planId);
    } catch (error) {
      toast.error('Failed to process subscription');
    }
  };

  // Adjust prices for yearly billing (20% discount)
  const getAdjustedPrice = (price: number) => {
    if (billingCycle === 'yearly') {
      return (price * 12 * 0.8).toFixed(2); // 20% discount
    }
    return price.toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Billing Cycle Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-md ${
              billingCycle === 'monthly'
                ? 'bg-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-2 rounded-md ${
              billingCycle === 'yearly'
                ? 'bg-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Yearly
            <span className="ml-1 text-xs text-green-600 font-medium">Save 20%</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ scale: 1.02 }}
            className={`bg-white rounded-xl shadow-sm p-6 border-2 ${
              currentPlan === plan.type
                ? 'border-blue-500'
                : 'border-transparent hover:border-gray-200'
            }`}
          >
            {plan.type === 'pro' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
            )}

            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                {plan.type === 'free' ? (
                  <Sparkles className="w-5 h-5 text-gray-600" />
                ) : plan.type === 'pro' ? (
                  <Crown className="w-5 h-5 text-yellow-500" />
                ) : (
                  <CreditCard className="w-5 h-5 text-blue-600" />
                )}
                <h3 className="text-xl font-semibold capitalize">{plan.type}</h3>
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-bold">
                  ${billingCycle === 'yearly' ? (plan.price * 12 * 0.8).toFixed(2) : plan.price.toFixed(2)}
                </span>
                <span className="text-gray-600">
                  /{billingCycle === 'yearly' ? 'year' : 'month'}
                </span>
              </div>
              {billingCycle === 'yearly' && plan.price > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  Save ${(plan.price * 12 * 0.2).toFixed(2)} per year
                </p>
              )}
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-2 text-blue-600">
                <Check className="w-5 h-5" />
                <span>
                  {plan.aiCredits === 999999 ? 'Unlimited' : plan.aiCredits} AI Credits
                </span>
              </div>
              
              {Object.entries(plan.features).map(([feature, enabled]) => (
                <div
                  key={feature}
                  className={`flex items-center gap-2 ${
                    enabled ? 'text-gray-800' : 'text-gray-400'
                  }`}
                >
                  {enabled ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <X className="w-5 h-5" />
                  )}
                  <span>
                    {feature === 'aiListings' && 'AI Listing Generation'}
                    {feature === 'visionAI' && 'Vision AI Analysis'}
                    {feature === 'propertyLookup' && 'Property Info Lookup'}
                    {feature === 'carLookup' && 'Vehicle Registration Lookup'}
                    {feature === 'crm' && 'CRM Features'}
                    {feature === 'teamMembers' && `Team Members (${plan.teamMembers})`}
                    {feature === 'businessProfile' && 'Business Profile'}
                  </span>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectPlan(plan)}
              disabled={isLoading || currentPlan === plan.type}
              className={`w-full py-3 rounded-lg font-medium ${
                currentPlan === plan.type
                  ? 'bg-blue-600 text-white'
                  : plan.type === 'free'
                  ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : currentPlan === plan.type ? (
                'Current Plan'
              ) : plan.type === 'free' ? (
                'Downgrade to Free'
              ) : (
                `Get ${plan.type}`
              )}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}