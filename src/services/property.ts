import { supabase } from '../lib/supabase';

interface PropertyLookupResult {
  success: boolean;
  data?: {
    property_address: string;
    lat: number;
    lng: number;
    year_built?: string;
    land_size_sqm?: number;
    floor_area_sqm?: number;
    last_sold_date?: string;
    last_sold_price?: number;
    estimated_value?: number;
    property_type?: string;
  };
  error?: string;
}

export const propertyService = {
  async lookupProperty(address: string, country: 'NZ' | 'AU'): Promise<PropertyLookupResult> {
    try {
      const { data, error } = await supabase.functions.invoke('property-lookup', {
        body: { address, country }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error looking up property:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};