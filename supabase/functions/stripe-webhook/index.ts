import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import Stripe from 'npm:stripe@14.17.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  try {
    const body = await req.text();
    const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object;
        await handleInvoicePaid(invoice);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});

async function handleCheckoutCompleted(session) {
  const { metadata } = session;
  const userId = metadata.user_id;
  const productId = metadata.product_id;
  const productType = metadata.product_type;

  // Update payment log
  await supabaseClient
    .from('payment_logs')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('session_id', session.id);

  if (productType === 'one_time') {
    // Handle one-time credit purchase
    if (productId.startsWith('ai_credits_')) {
      const credits = parseInt(productId.split('_')[2]);
      await addAICredits(userId, credits);
    } else if (productId.startsWith('listing_credits_')) {
      const credits = parseInt(productId.split('_')[2]);
      await addListingCredits(userId, credits);
    }
  } else if (productType === 'subscription') {
    // Handle subscription
    // The subscription details will be processed in the invoice.paid event
    // Just update the user's subscription status for now
    const planType = productId.split('_')[0]; // pro, business, real_estate
    
    await supabaseClient
      .from('users')
      .update({
        subscription_type: planType
      })
      .eq('id', userId);
      
    // Create or update subscription record
    await supabaseClient
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        stripe_subscription_id: session.subscription,
        plan_id: productId,
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Placeholder, will be updated in invoice.paid
        cancel_at_period_end: false
      });
  }

  // Send confirmation email
  await supabaseClient.functions.invoke('send-email', {
    body: {
      to: session.customer_details.email,
      template: 'payment_success',
      data: {
        productName: productId,
        amount: (session.amount_total / 100).toFixed(2),
        currency: session.currency.toUpperCase()
      }
    }
  });
}

async function handleInvoicePaid(invoice) {
  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const customerId = invoice.customer;
  
  // Get user ID from customer
  const { data: customerData } = await supabaseClient
    .from('stripe_customers')
    .select('user_id')
    .eq('customer_id', customerId)
    .single();
    
  if (!customerData) {
    console.error(`No user found for Stripe customer: ${customerId}`);
    return;
  }
  
  const userId = customerData.user_id;
  
  // Update subscription record
  await supabaseClient
    .from('user_subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end
    })
    .eq('stripe_subscription_id', subscription.id);
    
  // Update user's subscription type based on the plan
  const planId = subscription.items.data[0].plan.product;
  const { data: productData } = await stripe.products.retrieve(planId);
  const planType = productData.metadata.plan_type || 'pro'; // Default to pro if not specified
  
  await supabaseClient
    .from('users')
    .update({
      subscription_type: planType
    })
    .eq('id', userId);
    
  // Reset AI credits based on plan
  let aiCredits = 10; // Default
  
  if (planType === 'pro' || planType === 'business' || planType === 'real_estate') {
    aiCredits = 999999; // Unlimited for paid plans
  } else if (planType === 'basic') {
    aiCredits = 50;
  }
  
  await supabaseClient
    .from('users')
    .update({
      ai_credits: aiCredits
    })
    .eq('id', userId);
}

async function handleSubscriptionUpdated(subscription) {
  // Get customer ID
  const customerId = subscription.customer;
  
  // Get user ID from customer
  const { data: customerData } = await supabaseClient
    .from('stripe_customers')
    .select('user_id')
    .eq('customer_id', customerId)
    .single();
    
  if (!customerData) {
    console.error(`No user found for Stripe customer: ${customerId}`);
    return;
  }
  
  const userId = customerData.user_id;
  
  // Update subscription record
  await supabaseClient
    .from('user_subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handleSubscriptionDeleted(subscription) {
  // Get customer ID
  const customerId = subscription.customer;
  
  // Get user ID from customer
  const { data: customerData } = await supabaseClient
    .from('stripe_customers')
    .select('user_id')
    .eq('customer_id', customerId)
    .single();
    
  if (!customerData) {
    console.error(`No user found for Stripe customer: ${customerId}`);
    return;
  }
  
  const userId = customerData.user_id;
  
  // Update subscription record
  await supabaseClient
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);
    
  // Reset user to free plan
  await supabaseClient
    .from('users')
    .update({
      subscription_type: 'free',
      ai_credits: 10 // Reset to free tier credits
    })
    .eq('id', userId);
}

async function addAICredits(userId, credits) {
  // Get current credits
  const { data, error } = await supabaseClient
    .from('users')
    .select('ai_credits')
    .eq('id', userId)
    .single();
    
  if (error) {
    console.error(`Error getting user credits: ${error.message}`);
    return;
  }
  
  // Add credits
  await supabaseClient
    .from('users')
    .update({
      ai_credits: data.ai_credits + credits
    })
    .eq('id', userId);
    
  // Log credit addition
  await supabaseClient
    .from('credit_transactions')
    .insert({
      user_id: userId,
      credit_type: 'ai',
      amount: credits,
      source: 'purchase'
    });
}

async function addListingCredits(userId, credits) {
  // Get current credits
  const { data, error } = await supabaseClient
    .from('users')
    .select('listing_credits')
    .eq('id', userId)
    .single();
    
  if (error) {
    // If listing_credits column doesn't exist, we need to add it
    if (error.code === 'PGRST116') {
      // Add listing_credits column if it doesn't exist
      await supabaseClient.rpc('add_listing_credits_column');
      
      // Set initial credits
      await supabaseClient
        .from('users')
        .update({
          listing_credits: credits
        })
        .eq('id', userId);
    } else {
      console.error(`Error getting user listing credits: ${error.message}`);
      return;
    }
  } else {
    // Add credits
    await supabaseClient
      .from('users')
      .update({
        listing_credits: (data.listing_credits || 0) + credits
      })
      .eq('id', userId);
  }
    
  // Log credit addition
  await supabaseClient
    .from('credit_transactions')
    .insert({
      user_id: userId,
      credit_type: 'listing',
      amount: credits,
      source: 'purchase'
    });
}