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
    const { title, description, tags, category, price, userId, listingId } = await req.json();

    if (!title || !description || !category) {
      throw new Error('Title, description, and category are required');
    }

    // Compile content for analysis
    const contentToAnalyze = `
      Title: ${title}
      Description: ${description}
      Category: ${category}
      Tags: ${tags ? tags.join(', ') : 'None'}
      Price: ${price || 'Not specified'}
    `;

    // Analyze content with OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a content moderator for a marketplace platform. 
          Analyze the following listing content and determine if it contains any of the following issues:
          
          1. Hate speech or discriminatory language
          2. Scam or spam indicators (e.g., "get rich quick", unrealistic promises)
          3. Misleading information or false advertising
          4. Adult content or inappropriate material
          5. Illegal items or services
          6. Category mismatch (e.g., a car listed in real estate)
          7. Suspicious pricing (too low or too high compared to market value)
          8. Contact information in description (trying to bypass platform)
          
          Return a JSON object with the following fields:
          - approved: boolean (true if content is acceptable, false if it violates policies)
          - reason: string (explanation if not approved, empty if approved)
          - category_match: boolean (true if listing is in the correct category)
          - suggested_category: string (if category_match is false)
          - confidence: number (0-1)
          - flags: array of strings (specific issues found)
          - severity: string (low, medium, high)
          `
        },
        {
          role: 'user',
          content: contentToAnalyze
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    const analysis = JSON.parse(completion.choices[0].message.content);

    // Log moderation result
    await supabaseClient
      .from('listing_moderation_logs')
      .insert({
        listing_id: listingId,
        user_id: userId,
        content: {
          title,
          description,
          category,
          tags
        },
        analysis: analysis,
        approved: analysis.approved,
        created_at: new Date().toISOString()
      });

    // If not approved and high severity, notify admin
    if (!analysis.approved && analysis.severity === 'high') {
      await supabaseClient
        .from('admin_notifications')
        .insert({
          type: 'listing_flagged',
          content: {
            listingId,
            userId,
            title,
            analysis
          },
          status: 'unread',
          priority: 'high'
        });
    }

    return new Response(
      JSON.stringify(analysis),
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
        approved: false,
        reason: `Error processing request: ${error.message}`,
        confidence: 1,
        flags: ['system_error'],
        severity: 'medium'
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