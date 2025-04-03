import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

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
    const { prompt } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    // Initialize AI session
    const model = new Supabase.ai.Session('gpt-4');

    // Generate listing
    const completion = await model.run(
      `Generate a professional service listing based on this description: "${prompt}"

      Return a JSON object with the following fields:
      - title: A catchy, professional title
      - description: Detailed service description (200-300 words)
      - category: One of [design, development, marketing, writing, video, music, business]
      - hourlyRate: Suggested hourly rate in USD
      - skills: Array of relevant skills
      - addOns: Array of suggested service add-ons with name, price, and description
      - availability: Suggested working hours
      - requirements: What clients need to provide`
    );

    return new Response(
      JSON.stringify(completion),
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