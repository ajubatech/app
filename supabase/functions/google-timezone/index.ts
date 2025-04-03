import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
const TIMEZONE_API_URL = 'https://maps.googleapis.com/maps/api/timezone/json';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng, timestamp } = await req.json();

    if (!lat || !lng || !timestamp) {
      throw new Error('Latitude, longitude, and timestamp are required');
    }

    const url = `${TIMEZONE_API_URL}?location=${lat},${lng}&timestamp=${timestamp}&key=${GOOGLE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Timezone API request failed: ${data.status}`);
    }

    return new Response(
      JSON.stringify({
        timeZoneId: data.timeZoneId,
        timeZoneName: data.timeZoneName,
        dstOffset: data.dstOffset,
        rawOffset: data.rawOffset,
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