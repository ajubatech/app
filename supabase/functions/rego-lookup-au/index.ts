import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface RegoLookupRequest {
  rego_plate: string;
  state: 'NSW' | 'VIC' | 'QLD' | 'SA' | 'WA' | 'ACT' | 'NT' | 'TAS';
  user_id: string;
}

interface VehicleData {
  make?: string;
  model?: string;
  year?: string;
  fuel_type?: string;
  rego_status?: string;
  expiry_date?: string;
  vin?: string;
  transmission?: string;
}

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function logLookup(userId: string, plate: string, state: string, status: string, data: any) {
  try {
    await supabaseClient
      .from('lookup_history')
      .insert({
        user_id: userId,
        rego_plate: plate,
        state,
        country: 'AU',
        status,
        data
      });
  } catch (error) {
    console.error('Error logging lookup:', error);
  }
}

async function lookupNSW(rego: string): Promise<VehicleData> {
  try {
    const response = await fetch('https://www.service.nsw.gov.au/api/vehiclerego/lookup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plate: rego }),
    });

    if (!response.ok) {
      throw new Error('NSW lookup failed');
    }

    const data = await response.json();
    return {
      make: data.make,
      model: data.model,
      year: data.year,
      rego_status: data.status,
      expiry_date: data.expiry,
      vin: data.vin,
    };
  } catch (error) {
    throw new Error(`NSW Lookup Error: ${error.message}`);
  }
}

async function lookupVIC(rego: string): Promise<VehicleData> {
  try {
    const response = await fetch('https://www.vicroads.vic.gov.au/api/vehiclelookup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ registration: rego }),
    });

    if (!response.ok) {
      throw new Error('VIC lookup failed');
    }

    const data = await response.json();
    return {
      make: data.make,
      model: data.model,
      year: data.year,
      fuel_type: data.fuelType,
      rego_status: data.status,
      expiry_date: data.expiryDate,
    };
  } catch (error) {
    throw new Error(`VIC Lookup Error: ${error.message}`);
  }
}

async function lookupQLD(rego: string): Promise<VehicleData> {
  try {
    const response = await fetch('https://www.tmr.qld.gov.au/api/regocheck', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plateNumber: rego }),
    });

    if (!response.ok) {
      throw new Error('QLD lookup failed');
    }

    const data = await response.json();
    return {
      make: data.make,
      model: data.model,
      year: data.year,
      rego_status: data.status,
      expiry_date: data.expiry,
    };
  } catch (error) {
    throw new Error(`QLD Lookup Error: ${error.message}`);
  }
}

async function lookupSA(rego: string): Promise<VehicleData> {
  try {
    const response = await fetch('https://www.ezyreg.sa.gov.au/api/vehiclelookup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ registration: rego }),
    });

    if (!response.ok) {
      throw new Error('SA lookup failed');
    }

    const data = await response.json();
    return {
      make: data.make,
      model: data.model,
      year: data.year,
      rego_status: data.status,
      expiry_date: data.expiry,
    };
  } catch (error) {
    throw new Error(`SA Lookup Error: ${error.message}`);
  }
}

async function lookupWA(rego: string): Promise<VehicleData> {
  try {
    const response = await fetch('https://www.transport.wa.gov.au/api/vehiclelookup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plate: rego }),
    });

    if (!response.ok) {
      throw new Error('WA lookup failed');
    }

    const data = await response.json();
    return {
      make: data.make,
      model: data.model,
      year: data.year,
      rego_status: data.status,
      expiry_date: data.expiry,
    };
  } catch (error) {
    throw new Error(`WA Lookup Error: ${error.message}`);
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rego_plate, state, user_id } = await req.json() as RegoLookupRequest;

    if (!rego_plate || !state) {
      throw new Error('Registration plate and state are required');
    }

    if (!user_id) {
      throw new Error('User ID is required');
    }

    let vehicleData: VehicleData | null = null;
    let status = 'success';
    let errorMessage = '';

    try {
      // Route to appropriate state handler
      switch (state) {
        case 'NSW':
          vehicleData = await lookupNSW(rego_plate);
          break;
        case 'VIC':
          vehicleData = await lookupVIC(rego_plate);
          break;
        case 'QLD':
          vehicleData = await lookupQLD(rego_plate);
          break;
        case 'SA':
          vehicleData = await lookupSA(rego_plate);
          break;
        case 'WA':
          vehicleData = await lookupWA(rego_plate);
          break;
        case 'ACT':
        case 'NT':
        case 'TAS':
          status = 'manual_required';
          errorMessage = `Manual input required for ${state} registrations`;
          break;
        default:
          status = 'error';
          errorMessage = 'Invalid state specified';
      }
    } catch (error) {
      status = 'error';
      errorMessage = error.message;
    }

    // Log the lookup attempt
    await logLookup(
      user_id,
      rego_plate,
      state,
      status,
      status === 'success' ? vehicleData : { error: errorMessage }
    );

    if (status === 'error') {
      throw new Error(errorMessage);
    }

    if (status === 'manual_required') {
      return new Response(
        JSON.stringify({
          success: false,
          manual_required: true,
          message: errorMessage,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: vehicleData,
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