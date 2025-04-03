import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Configuration, OpenAIApi } from 'npm:openai@4.24.1';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

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
    const { message, skills, licenses, availability } = await req.json();

    // Get relevant data from Supabase
    const { data: listings } = await supabaseClient
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .limit(5);

    const { data: training } = await supabaseClient
      .from('training_modules')
      .select('*')
      .limit(5);

    let systemContext = '';
    let prompt = '';

    if (skills && licenses && availability) {
      // Profile analysis mode
      systemContext = `You are an AI Income Coach helping users find earning opportunities. 
        Analyze their profile and suggest relevant jobs, training, and services they could offer.
        Consider their skills, licenses, and availability to make personalized recommendations.`;

      prompt = `Based on this profile:
        Skills: ${skills.join(', ')}
        Licenses: ${licenses.join(', ')}
        Availability: ${availability.join(', ')}

        Provide:
        1. Top 3 job opportunities they're qualified for
        2. Suggested training to increase earning potential
        3. Services they could offer on our platform
        4. Estimated earning potential for each option`;
    } else {
      // Chat mode
      systemContext = `You are an AI Income Coach helping users explore earning opportunities.
        Provide helpful, actionable advice about finding work, improving skills, and maximizing income.
        Focus on practical steps and local opportunities.`;

      prompt = message;
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemContext
        },
        {
          role: 'assistant',
          content: `Here are some relevant opportunities and resources:
            
            Active Listings:
            ${listings?.map(l => `- ${l.title} ($${l.price})`).join('\n')}
            
            Training Available:
            ${training?.map(t => `- ${t.title}`).join('\n')}`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const response = completion.choices[0].message.content;

    // Save recommendation if profile analysis
    if (skills) {
      await supabaseClient
        .from('ai_recommendations')
        .insert({
          type: 'job',
          content: {
            skills,
            licenses,
            availability,
            suggestions: response
          }
        });
    }

    return new Response(
      JSON.stringify({
        response,
        recommendation: skills ? {
          type: 'job',
          content: {
            skills,
            licenses,
            availability,
            suggestions: response
          }
        } : null
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