import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { Configuration, OpenAIApi } from 'npm:openai@4.24.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Initialize OpenAI
const openai = new OpenAIApi(new Configuration({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
}));

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, isNewUser } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    // Get user data if userId is provided
    let userData = null;
    if (userId) {
      const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error) {
        userData = data;
      }
    }

    // Create system prompt based on user data
    let systemPrompt = `You are ListAI, a helpful assistant for the ListHouze marketplace platform. 
    Your goal is to help users create listings, find items, and navigate the platform.
    
    Be friendly, concise, and helpful. Focus on guiding users to the right actions.`;

    if (isNewUser) {
      systemPrompt += `\n\nThis is a new user who is just getting started with the platform. 
      Be extra helpful and explain basic concepts. Suggest creating their first listing.`;
    }

    if (userData) {
      systemPrompt += `\n\nUser information:
      - Subscription: ${userData.subscription_type}
      - AI Credits: ${userData.ai_credits}
      - Listing Credits: ${userData.listing_credits}`;
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const response = completion.choices[0].message.content;

    // Log the interaction
    if (userId) {
      await supabaseClient
        .from('ai_test_logs')
        .insert({
          test_results: { 
            query: message, 
            response,
            user_id: userId,
            is_onboarding: true
          },
          status: 'success'
        });
    }

    return new Response(
      JSON.stringify({
        response,
        suggestions: [
          "How do I create a listing?",
          "What are AI credits?",
          "How can I sell my car?",
          "How do I get more views?"
        ]
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
      JSON.stringify({
        error: error.message,
      }),
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