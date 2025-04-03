import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export type PlanId = 
  | 'pro_monthly' 
  | 'pro_yearly' 
  | 'business_monthly' 
  | 'business_yearly' 
  | 'real_estate_monthly' 
  | 'real_estate_yearly';

export type CreditPackId = 
  | 'ai_credits_5' 
  | 'ai_credits_10' 
  | 'ai_credits_20' 
  | 'ai_credits_50' 
  | 'listing_credits_5' 
  | 'listing_credits_10' 
  | 'listing_credits_20';

export function useStripeBilling() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkoutWithStripe = async (productId: PlanId | CreditPackId) => {
    if (!user) {
      toast.error('Please sign in to continue');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          productId,
          userId: user.id,
          email: user.email,
          returnUrl: window.location.origin + '/dashboard'
        }
      });

      if (error) throw error;

      // Redirect to Stripe Checkout
      window.location.href = data.url;
      return data;
    } catch (err: any) {
      console.error('Error creating checkout session:', err);
      setError(err.message || 'Failed to create checkout session');
      toast.error('Failed to process payment');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getSubscriptionStatus = async () => {
    if (!user) return null;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('get-subscription-status', {
        body: { userId: user.id }
      });

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error getting subscription status:', err);
      setError(err.message || 'Failed to get subscription status');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async () => {
    if (!user) return false;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('cancel-subscription', {
        body: { userId: user.id }
      });

      if (error) throw error;
      
      toast.success('Subscription cancelled successfully');
      return true;
    } catch (err: any) {
      console.error('Error cancelling subscription:', err);
      setError(err.message || 'Failed to cancel subscription');
      toast.error('Failed to cancel subscription');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const createCustomerPortalSession = async () => {
    if (!user) return null;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('create-customer-portal-session', {
        body: { 
          userId: user.id,
          returnUrl: window.location.origin + '/dashboard'
        }
      });

      if (error) throw error;

      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
      return data;
    } catch (err: any) {
      console.error('Error creating customer portal session:', err);
      setError(err.message || 'Failed to create customer portal session');
      toast.error('Failed to access billing portal');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    checkoutWithStripe,
    getSubscriptionStatus,
    cancelSubscription,
    createCustomerPortalSession,
    isLoading,
    error
  };
}