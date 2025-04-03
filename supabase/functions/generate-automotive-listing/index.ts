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
      `Generate a professional automotive listing based on this description: "${prompt}"

      Return a JSON object with the following fields:
      - title: A catchy, professional title
      - description: Detailed vehicle description (200-300 words)
      - make: Vehicle manufacturer
      - model: Vehicle model
      - year: Manufacturing year
      - variant: Model variant/trim
      - bodyType: Vehicle body type
      - transmission: Transmission type
      - fuelType: Fuel type
      - engine: Engine specifications
      - features: Array of vehicle features
      - suggestedPrice: Estimated market value in USD`
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