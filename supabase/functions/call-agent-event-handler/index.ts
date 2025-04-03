import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event, user_id, call_data } = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify Pro+ subscription
    const { data: subscription, error: subError } = await supabaseClient
      .from('pro_plus_subscriptions')
      .select('*')
      .eq('user_id', user_id)
      .eq('active', true)
      .single();

    if (subError || !subscription) {
      throw new Error('Active Pro+ subscription required');
    }

    // Initialize AI session for call analysis
    const model = new Supabase.ai.Session('gpt-4');

    // Analyze call content
    const analysis = await model.run([
      {
        role: 'system',
        content: 'You are an AI call analyzer. Analyze the call transcript and provide a concise summary.'
      },
      {
        role: 'user',
        content: call_data.transcript
      }
    ]);

    // Log call event
    const { data: log, error: logError } = await supabaseClient
      .from('call_agent_logs')
      .insert({
        user_id,
        type: event.type,
        summary: analysis,
        metadata: {
          duration: call_data.duration,
          sentiment: call_data.sentiment,
          action_taken: call_data.action
        }
      })
      .select()
      .single();

    if (logError) throw logError;

    return new Response(
      JSON.stringify({ success: true, log }),
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