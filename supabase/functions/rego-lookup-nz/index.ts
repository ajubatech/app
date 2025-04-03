import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const CARJAM_API_KEY = Deno.env.get('CARJAM_API_KEY');
const CARJAM_API_URL = 'https://api.carjam.co.nz/v2';

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function logLookup(userId: string, plate: string, status: string, data: any) {
  try {
    await supabaseClient
      .from('lookup_history')
      .insert({
        user_id: userId,
        rego_plate: plate,
        state: 'NZ',
        country: 'NZ',
        status,
        data
      });
  } catch (error) {
    console.error('Error logging lookup:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rego_plate, user_id } = await req.json();

    if (!rego_plate) {
      throw new Error('Registration plate is required');
    }

    if (!user_id) {
      throw new Error('User ID is required');
    }

    // Call CarJam API
    const response = await fetch(`${CARJAM_API_URL}/vehicle/${rego_plate}`, {
      headers: {
        'Authorization': `Bearer ${CARJAM_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch vehicle data');
    }

    const data = await response.json();

    // Log successful lookup
    await logLookup(user_id, rego_plate, 'success', data);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          make: data.make,
          model: data.model,
          year: data.year,
          fuel_type: data.fuel_type,
          body_style: data.body_style,
          engine_size: data.engine_size,
          transmission: data.transmission,
          vin: data.vin,
          expiry_date: data.expiry_date,
          status: data.status
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    // Log failed lookup
    if (error.response?.data) {
      await logLookup(user_id, rego_plate, 'error', {
        error: error.message,
        details: error.response.data
      });
    }

    return new Response(
      JSON.stringify({
        success: false,
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