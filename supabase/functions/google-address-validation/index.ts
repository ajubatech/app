import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
const VALIDATION_API_URL = 'https://addressvalidation.googleapis.com/v1:validateAddress';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address } = await req.json();

    if (!address) {
      throw new Error('Address is required');
    }

    const response = await fetch(`${VALIDATION_API_URL}?key=${GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: {
          addressLines: [address],
        },
        enableUspsCass: true,
      }),
    });

    const data = await response.json();

    return new Response(
      JSON.stringify({
        valid: data.result.verdict.validationGranularity === 'COMPLETE',
        formatted_address: data.result.address.formattedAddress,
        metadata: data.result.metadata,
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