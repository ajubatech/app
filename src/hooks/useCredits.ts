import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export function useCredits() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAICredits = async () => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      // Get user's current AI credits
      const { data, error } = await supabase
        .from('users')
        .select('ai_credits, subscription_type')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      // Check if user has unlimited credits (Pro+ plan)
      if (data.subscription_type === 'pro') {
        return true;
      }

      // Check if user has any credits left
      return data.ai_credits > 0;
    } catch (err) {
      console.error('Error checking AI credits:', err);
      setError('Failed to check AI credits');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const useAICredit = async () => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      // Get current credits
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('ai_credits, subscription_type')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      // Pro+ users have unlimited credits
      if (userData.subscription_type === 'pro') {
        return true;
      }

      // Check if user has credits
      if (userData.ai_credits <= 0) {
        toast.error('No AI credits remaining');
        return false;
      }

      // Decrement credits
      const { error: updateError } = await supabase
        .from('users')
        .update({ ai_credits: userData.ai_credits - 1 })
        .eq('id', user.id);

      if (updateError) throw updateError;

      return true;
    } catch (err) {
      console.error('Error using AI credit:', err);
      setError('Failed to use AI credit');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkListingQuota = async () => {
    if (!user) return false;

    try {
      setLoading(true);
      setError(null);

      // Get user's subscription type and listing count
      const [{ data: userData }, { count: listingCount }] = await Promise.all([
        supabase
          .from('users')
          .select('subscription_type')
          .eq('id', user.id)
          .single(),
        supabase
          .from('listings')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .gte('created_at', new Date(new Date().setDate(1)).toISOString())
      ]);

      if (!userData) throw new Error('User not found');

      // Check quota based on subscription
      switch (userData.subscription_type) {
        case 'pro':
          return true; // Unlimited
        case 'basic':
          return (listingCount || 0) < 20;
        default:
          return (listingCount || 0) < 5;
      }
    } catch (err) {
      console.error('Error checking listing quota:', err);
      setError('Failed to check listing quota');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    checkAICredits,
    useAICredit,
    checkListingQuota,
    loading,
    error
  };
}