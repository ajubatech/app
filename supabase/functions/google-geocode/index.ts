import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');
const GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address, lat, lng } = await req.json();

    let url = GEOCODING_API_URL;
    if (address) {
      // Forward geocoding
      url += `?address=${encodeURIComponent(address)}`;
    } else if (lat !== undefined && lng !== undefined) {
      // Reverse geocoding
      url += `?latlng=${lat},${lng}`;
    } else {
      throw new Error('Either address or lat/lng coordinates are required');
    }

    url += `&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Geocoding failed: ${data.status}`);
    }

    const result = data.results[0];
    return new Response(
      JSON.stringify({
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formatted_address: result.formatted_address,
        place_id: result.place_id,
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