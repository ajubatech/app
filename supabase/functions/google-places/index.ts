import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
const PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { placeId, query, location } = await req.json();

    let url: string;
    if (placeId) {
      // Get place details
      url = `${PLACES_API_URL}/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,photos,rating,reviews&key=${GOOGLE_API_KEY}`;
    } else if (query) {
      // Search places
      url = `${PLACES_API_URL}/textsearch/json?query=${encodeURIComponent(query)}`;
      if (location) {
        url += `&location=${location.lat},${location.lng}&radius=50000`;
      }
      url += `&key=${GOOGLE_API_KEY}`;
    } else {
      throw new Error('Either placeId or query is required');
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Places API request failed: ${data.status}`);
    }

    return new Response(
      JSON.stringify(placeId ? data.result : data.results),
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