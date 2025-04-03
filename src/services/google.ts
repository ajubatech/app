import { supabase } from '../lib/supabase';

interface GeocodeResult {
  lat: number;
  lng: number;
  formatted_address: string;
  place_id: string;
}

interface PlaceDetails {
  name: string;
  formatted_address: string;
  phone_number?: string;
  website?: string;
  opening_hours?: {
    weekday_text: string[];
    open_now: boolean;
  };
  photos?: string[];
  rating?: number;
  reviews?: {
    author_name: string;
    rating: number;
    text: string;
    time: number;
  }[];
}

interface TimeZoneResult {
  timeZoneId: string;
  timeZoneName: string;
  dstOffset: number;
  rawOffset: number;
}

export const googleService = {
  async geocode(address: string): Promise<GeocodeResult | null> {
    try {
      const { data, error } = await supabase.functions.invoke('google-geocode', {
        body: { address }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  },

  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('google-geocode', {
        body: { lat, lng }
      });

      if (error) throw error;
      return data.formatted_address;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  },

  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    try {
      const { data, error } = await supabase.functions.invoke('google-places', {
        body: { placeId }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  },

  async searchPlaces(query: string, location?: { lat: number; lng: number }): Promise<PlaceDetails[]> {
    try {
      const { data, error } = await supabase.functions.invoke('google-places', {
        body: { query, location }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  },

  async getTimeZone(lat: number, lng: number): Promise<TimeZoneResult | null> {
    try {
      const { data, error } = await supabase.functions.invoke('google-timezone', {
        body: { lat, lng, timestamp: Math.floor(Date.now() / 1000) }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting timezone:', error);
      return null;
    }
  },

  async validateAddress(address: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('google-address-validation', {
        body: { address }
      });

      if (error) throw error;
      return data.valid;
    } catch (error) {
      console.error('Error validating address:', error);
      return false;
    }
  }
};