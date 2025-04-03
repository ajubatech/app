import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import Stripe from 'npm:stripe@14.17.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Initialize Stripe
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get user's subscription from Supabase
    const { data: subscriptionData, error: subscriptionError } = await supabaseClient
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      throw subscriptionError;
    }

    // If no active subscription found
    if (!subscriptionData) {
      return new Response(
        JSON.stringify({
          active: false,
          plan: 'free',
          credits: {
            ai: 10,
            listing: 5
          },
          renewal: null
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionData.stripe_subscription_id);

    // Get user's credits
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('ai_credits, listing_credits, subscription_type')
      .eq('id', userId)
      .single();

    if (userError) {
      throw userError;
    }

    return new Response(
      JSON.stringify({
        active: subscription.status === 'active',
        plan: userData.subscription_type,
        credits: {
          ai: userData.ai_credits || 10,
          listing: userData.listing_credits || 5
        },
        subscription: {
          id: subscription.id,
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          plan: {
            id: subscriptionData.plan_id,
            amount: subscription.items.data[0].price.unit_amount / 100,
            currency: subscription.items.data[0].price.currency,
            interval: subscription.items.data[0].price.recurring.interval
          }
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});