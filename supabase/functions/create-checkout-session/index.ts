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

// Product configuration
const PRODUCTS = {
  // Subscription plans
  pro_monthly: {
    price_id: 'price_1OqXYZABCDEFGHIJKLMNOPQR', // Replace with actual Stripe price ID
    type: 'subscription',
    name: 'Pro+ Monthly',
    description: 'Unlimited AI credits and listings',
    features: ['Unlimited AI credits', 'Unlimited listings', 'Priority support'],
    price: 29.99,
    currency: 'NZD',
    interval: 'month'
  },
  pro_yearly: {
    price_id: 'price_1OqXYZABCDEFGHIJKLMNOPQS', // Replace with actual Stripe price ID
    type: 'subscription',
    name: 'Pro+ Yearly',
    description: 'Unlimited AI credits and listings (save 16%)',
    features: ['Unlimited AI credits', 'Unlimited listings', 'Priority support'],
    price: 299.99,
    currency: 'NZD',
    interval: 'year'
  },
  business_monthly: {
    price_id: 'price_1OqXYZABCDEFGHIJKLMNOPQT', // Replace with actual Stripe price ID
    type: 'subscription',
    name: 'Business Monthly',
    description: 'For teams and businesses',
    features: ['Unlimited AI credits', 'Unlimited listings', '5 team members', 'Business profile'],
    price: 49.99,
    currency: 'NZD',
    interval: 'month'
  },
  business_yearly: {
    price_id: 'price_1OqXYZABCDEFGHIJKLMNOPQU', // Replace with actual Stripe price ID
    type: 'subscription',
    name: 'Business Yearly',
    description: 'For teams and businesses (save 16%)',
    features: ['Unlimited AI credits', 'Unlimited listings', '5 team members', 'Business profile'],
    price: 499.99,
    currency: 'NZD',
    interval: 'year'
  },
  real_estate_monthly: {
    price_id: 'price_1OqXYZABCDEFGHIJKLMNOPQV', // Replace with actual Stripe price ID
    type: 'subscription',
    name: 'Real Estate Monthly',
    description: 'Specialized for real estate professionals',
    features: ['Unlimited AI credits', 'Unlimited listings', 'Property lookup', 'CRM features'],
    price: 59.99,
    currency: 'NZD',
    interval: 'month'
  },
  real_estate_yearly: {
    price_id: 'price_1OqXYZABCDEFGHIJKLMNOPQW', // Replace with actual Stripe price ID
    type: 'subscription',
    name: 'Real Estate Yearly',
    description: 'Specialized for real estate professionals (save 16%)',
    features: ['Unlimited AI credits', 'Unlimited listings', 'Property lookup', 'CRM features'],
    price: 599.99,
    currency: 'NZD',
    interval: 'year'
  },
  
  // One-time credit packs
  ai_credits_5: {
    price_id: 'price_1OqXYZABCDEFGHIJKLMNOPQX', // Replace with actual Stripe price ID
    type: 'one_time',
    name: '5 AI Credits',
    description: '5 AI credits for generating listings',
    price: 4.99,
    currency: 'NZD',
    credits: 5
  },
  ai_credits_10: {
    price_id: 'price_1OqXYZABCDEFGHIJKLMNOPQY', // Replace with actual Stripe price ID
    type: 'one_time',
    name: '10 AI Credits',
    description: '10 AI credits for generating listings',
    price: 8.99,
    currency: 'NZD',
    credits: 10
  },
  ai_credits_20: {
    price_id: 'price_1OqXYZABCDEFGHIJKLMNOPQZ', // Replace with actual Stripe price ID
    type: 'one_time',
    name: '20 AI Credits',
    description: '20 AI credits for generating listings',
    price: 15.99,
    currency: 'NZD',
    credits: 20
  },
  ai_credits_50: {
    price_id: 'price_1OqXYZABCDEFGHIJKLMNOPR0', // Replace with actual Stripe price ID
    type: 'one_time',
    name: '50 AI Credits',
    description: '50 AI credits for generating listings',
    price: 34.99,
    currency: 'NZD',
    credits: 50
  },
  listing_credits_5: {
    price_id: 'price_1OqXYZABCDEFGHIJKLMNOPR1', // Replace with actual Stripe price ID
    type: 'one_time',
    name: '5 Listing Credits',
    description: '5 credits for creating listings',
    price: 9.99,
    currency: 'NZD',
    credits: 5
  },
  listing_credits_10: {
    price_id: 'price_1OqXYZABCDEFGHIJKLMNOPR2', // Replace with actual Stripe price ID
    type: 'one_time',
    name: '10 Listing Credits',
    description: '10 credits for creating listings',
    price: 17.99,
    currency: 'NZD',
    credits: 10
  },
  listing_credits_20: {
    price_id: 'price_1OqXYZABCDEFGHIJKLMNOPR3', // Replace with actual Stripe price ID
    type: 'one_time',
    name: '20 Listing Credits',
    description: '20 credits for creating listings',
    price: 29.99,
    currency: 'NZD',
    credits: 20
  }
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productId, userId, email, returnUrl } = await req.json();

    if (!productId || !userId || !email) {
      throw new Error('Missing required parameters');
    }

    const product = PRODUCTS[productId];
    if (!product) {
      throw new Error('Invalid product ID');
    }

    // Get or create Stripe customer
    let customerId;
    const { data: customerData } = await supabaseClient
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', userId)
      .single();

    if (customerData?.customer_id) {
      customerId = customerData.customer_id;
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email,
        metadata: {
          user_id: userId
        }
      });
      
      // Save customer ID
      await supabaseClient
        .from('stripe_customers')
        .insert({
          user_id: userId,
          customer_id: customer.id,
          email
        });
      
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: product.price_id,
          quantity: 1,
        },
      ],
      mode: product.type === 'subscription' ? 'subscription' : 'payment',
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?canceled=true`,
      metadata: {
        user_id: userId,
        product_id: productId,
        product_type: product.type
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      currency: product.currency || 'NZD',
    });

    // Log checkout attempt
    await supabaseClient
      .from('payment_logs')
      .insert({
        user_id: userId,
        session_id: session.id,
        product_id: productId,
        amount: product.price,
        currency: product.currency || 'NZD',
        status: 'created'
      });

    return new Response(
      JSON.stringify({ url: session.url }),
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