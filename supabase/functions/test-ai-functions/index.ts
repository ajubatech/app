import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function testGenerateListing() {
  const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-listing-ai`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
    },
    body: JSON.stringify({
      prompt: "Luxury waterfront apartment in Sydney",
      category: "real_estate"
    })
  });

  return await response.json();
}

async function testImageInsight() {
  const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/image-insight`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
    },
    body: JSON.stringify({
      imageUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80"
    })
  });

  return await response.json();
}

async function testIncomeCoach() {
  const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-income-coach`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
    },
    body: JSON.stringify({
      user_input: "I need part-time income and I have a driver's license",
      profile: {
        location: "Melbourne",
        skills: ["driving", "delivery", "gardening"]
      }
    })
  });

  return await response.json();
}

async function testSocialPost() {
  const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-social-post`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
    },
    body: JSON.stringify({
      listing: {
        category: "automotive",
        title: "2022 Tesla Model 3 Long Range",
        description: "Pristine condition, fully loaded Tesla Model 3 with autopilot",
        price: 65000,
        features: ["Autopilot", "Premium Interior", "20\" Sport Wheels"]
      }
    })
  });

  return await response.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Run all tests
    const results = {
      generateListing: await testGenerateListing(),
      imageInsight: await testImageInsight(),
      incomeCoach: await testIncomeCoach(),
      socialPost: await testSocialPost()
    };

    // Log test results
    await supabaseClient
      .from('ai_test_logs')
      .insert({
        test_results: results,
        status: 'success'
      });

    return new Response(
      JSON.stringify({
        success: true,
        results
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    // Log error
    await supabaseClient
      .from('ai_test_logs')
      .insert({
        error: error.message,
        status: 'error'
      });

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});