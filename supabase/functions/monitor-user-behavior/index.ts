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
    const { userId, content, contentType } = await req.json();

    if (!userId || !content || !contentType) {
      throw new Error('User ID, content, and content type are required');
    }

    // Analyze content with OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a content moderator for a marketplace platform. 
          Analyze the following ${contentType} content and determine if it contains any of the following:
          1. Hate speech or discriminatory language
          2. Scam or spam indicators
          3. Profanity or explicit content
          4. Suspicious behavior patterns
          5. Threatening language
          
          Return a JSON object with the following fields:
          - isFlagged: boolean (true if any issues detected)
          - reasons: array of strings (specific issues found)
          - severity: string (low, medium, high)
          - confidence: number (0-1)
          - recommendation: string (action to take)`
        },
        {
          role: 'user',
          content: content
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    const analysis = JSON.parse(completion.choices[0].message.content);

    // If content is flagged, create a flag record
    if (analysis.isFlagged) {
      await supabaseClient
        .from('user_behavior_flags')
        .insert({
          user_id: userId,
          flag_type: contentType,
          content: content,
          reason: analysis.reasons.join(', '),
          severity: analysis.severity,
          confidence: analysis.confidence,
          status: 'active'
        });

      // If high severity, notify admin
      if (analysis.severity === 'high') {
        await supabaseClient
          .from('admin_notifications')
          .insert({
            type: 'toxic_content',
            content: {
              userId,
              contentType,
              content,
              analysis
            },
            status: 'unread',
            priority: 'high'
          });

        // If extremely severe, restrict user
        if (analysis.confidence > 0.9) {
          await supabaseClient
            .from('users')
            .update({
              status: 'restricted'
            })
            .eq('id', userId);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis
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