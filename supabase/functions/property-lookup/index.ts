import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const LINZ_API_KEY = Deno.env.get('LINZ_API_KEY');
const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function lookupNZProperty(address: string) {
  try {
    // First, geocode the address
    const geocodeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}&components=country:NZ`
    );
    const geocodeData = await geocodeResponse.json();

    if (geocodeData.status !== 'OK') {
      throw new Error('Address not found');
    }

    const location = geocodeData.results[0].geometry.location;
    const formattedAddress = geocodeData.results[0].formatted_address;

    // Query LINZ API for property data
    const linzResponse = await fetch(
      `https://data.linz.govt.nz/services/query/v1/vector/772/1?geometry=${location.lng},${location.lat}&radius=100&geometry_format=wkt&with_field_names=true&key=${LINZ_API_KEY}`
    );
    const linzData = await linzResponse.json();

    if (!linzData.vectorQuery.layers[0].features.length) {
      throw new Error('Property not found in LINZ database');
    }

    const propertyData = linzData.vectorQuery.layers[0].features[0].properties;

    // Get property sales history from public data
    const salesResponse = await fetch(
      `https://data.linz.govt.nz/services/query/v1/vector/774/1?property_id=${propertyData.property_id}&key=${LINZ_API_KEY}`
    );
    const salesData = await salesResponse.json();

    return {
      success: true,
      data: {
        property_address: formattedAddress,
        lat: location.lat,
        lng: location.lng,
        land_size_sqm: propertyData.total_area,
        year_built: propertyData.year_built || null,
        property_type: propertyData.property_type,
        last_sold_date: salesData.vectorQuery.layers[0].features[0]?.properties.sale_date || null,
        last_sold_price: salesData.vectorQuery.layers[0].features[0]?.properties.sale_price || null
      }
    };
  } catch (error) {
    console.error('NZ Property Lookup Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function lookupAUProperty(address: string) {
  try {
    // Geocode the address
    const geocodeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}&components=country:AU`
    );
    const geocodeData = await geocodeResponse.json();

    if (geocodeData.status !== 'OK') {
      throw new Error('Address not found');
    }

    const location = geocodeData.results[0].geometry.location;
    const formattedAddress = geocodeData.results[0].formatted_address;

    // Use public property data API (example - replace with actual API)
    const propertyResponse = await fetch(
      `https://api.domain.com.au/v1/properties/${encodeURIComponent(formattedAddress)}`,
      {
        headers: {
          'X-API-Key': Deno.env.get('DOMAIN_API_KEY') || ''
        }
      }
    );
    const propertyData = await propertyResponse.json();

    return {
      success: true,
      data: {
        property_address: formattedAddress,
        lat: location.lat,
        lng: location.lng,
        land_size_sqm: propertyData.landSize || null,
        floor_area_sqm: propertyData.floorSize || null,
        year_built: propertyData.yearBuilt || null,
        property_type: propertyData.propertyType || null,
        last_sold_date: propertyData.lastSoldDate || null,
        last_sold_price: propertyData.lastSoldPrice || null,
        estimated_value: propertyData.estimatedValue || null
      }
    };
  } catch (error) {
    console.error('AU Property Lookup Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address, country } = await req.json();

    if (!address) {
      throw new Error('Address is required');
    }

    if (!['NZ', 'AU'].includes(country)) {
      throw new Error('Invalid country code. Must be NZ or AU');
    }

    // Lookup property based on country
    const result = country === 'NZ' 
      ? await lookupNZProperty(address)
      : await lookupAUProperty(address);

    // Log the lookup attempt
    await supabaseClient
      .from('property_lookup_logs')
      .insert({
        address,
        country,
        success: result.success,
        data: result.success ? result.data : { error: result.error }
      });

    return new Response(
      JSON.stringify(result),
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