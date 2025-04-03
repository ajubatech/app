import { supabase } from '../lib/supabase';
import { Listing, User } from '../types';

interface AIResponse {
  title: string;
  description: string;
  price: number;
  category: string;
  features: string[];
  metadata: Record<string, any>;
}

export const aiService = {
  async generateListing(prompt: string, user: User): Promise<AIResponse | null> {
    try {
      if (!user.aiService?.isActive || user.aiService.remainingCredits <= 0) {
        throw new Error('No AI credits remaining. Please upgrade your plan.');
      }

      const { data, error } = await supabase.functions.invoke('generate-listing', {
        body: { prompt }
      });

      if (error) throw error;

      // Decrement AI credits
      await supabase
        .from('users')
        .update({
          'ai_service.remaining_credits': user.aiService.remainingCredits - 1
        })
        .eq('id', user.id);

      return data;
    } catch (error) {
      console.error('Error generating listing:', error);
      return null;
    }
  },

  async analyzeImage(imageUrl: string, user: User): Promise<AIResponse | null> {
    try {
      if (!user.aiService?.isActive || user.aiService.remainingCredits <= 0) {
        throw new Error('No AI credits remaining. Please upgrade your plan.');
      }

      const { data, error } = await supabase.functions.invoke('analyze-image', {
        body: { imageUrl }
      });

      if (error) throw error;

      // Decrement AI credits
      await supabase
        .from('users')
        .update({
          'ai_service.remaining_credits': user.aiService.remainingCredits - 1
        })
        .eq('id', user.id);

      return data;
    } catch (error) {
      console.error('Error analyzing image:', error);
      return null;
    }
  },

  async lookupProperty(address: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('linz-lookup', {
        body: { address }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error looking up property:', error);
      return null;
    }
  },

  async lookupVehicle(rego: string): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('carjam-lookup', {
        body: { rego }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error looking up vehicle:', error);
      return null;
    }
  }
};