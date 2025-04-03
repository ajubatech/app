import { create } from 'zustand';
import { Reel, MusicTrack, Sticker, TextStyle, Filter } from '../types';
import { supabase } from '../lib/supabase';

interface ReelState {
  reels: Reel[];
  currentReel: Reel | null;
  draftReel: Partial<Reel> | null;
  isLoading: boolean;
  error: string | null;
  musicLibrary: MusicTrack[];
  stickerLibrary: Sticker[];
  textStyles: TextStyle[];
  filters: Filter[];
  
  // Setters
  setReels: (reels: Reel[]) => void;
  setCurrentReel: (reel: Reel | null) => void;
  setDraftReel: (reel: Partial<Reel> | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Actions
  loadReels: () => Promise<void>;
  loadReel: (id: string) => Promise<Reel | null>;
  createReel: (reel: Partial<Reel>) => Promise<Reel | null>;
  updateReel: (id: string, updates: Partial<Reel>) => Promise<Reel | null>;
  deleteReel: (id: string) => Promise<boolean>;
  publishReel: (id: string) => Promise<Reel | null>;
  
  // Engagement
  likeReel: (id: string) => Promise<boolean>;
  unlikeReel: (id: string) => Promise<boolean>;
  commentOnReel: (id: string, comment: string) => Promise<boolean>;
  shareReel: (id: string, platform: string) => Promise<boolean>;
  
  // Media libraries
  loadMusicLibrary: () => Promise<void>;
  loadStickerLibrary: () => Promise<void>;
  loadTextStyles: () => Promise<void>;
  loadFilters: () => Promise<void>;
}

export const useReelStore = create<ReelState>((set, get) => ({
  reels: [],
  currentReel: null,
  draftReel: null,
  isLoading: false,
  error: null,
  musicLibrary: [],
  stickerLibrary: [],
  textStyles: [],
  filters: [],
  
  setReels: (reels) => set({ reels }),
  setCurrentReel: (reel) => set({ currentReel: reel }),
  setDraftReel: (reel) => set({ draftReel: reel }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  loadReels: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('reels')
        .select(`
          *,
          users (
            id,
            full_name,
            avatar_url
          ),
          listings (
            id,
            title,
            price,
            category
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      set({ reels: data || [] });
    } catch (error: any) {
      console.error('Error loading reels:', error);
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  loadReel: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('reels')
        .select(`
          *,
          users (
            id,
            full_name,
            avatar_url
          ),
          listings (
            id,
            title,
            price,
            category
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      set({ currentReel: data });
      return data;
    } catch (error: any) {
      console.error('Error loading reel:', error);
      set({ error: error.message });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
  
  createReel: async (reel) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('reels')
        .insert(reel)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update reels list
      const reels = get().reels;
      set({ reels: [data, ...reels] });
      
      return data;
    } catch (error: any) {
      console.error('Error creating reel:', error);
      set({ error: error.message });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
  
  updateReel: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('reels')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update reels list
      const reels = get().reels.map(reel => 
        reel.id === id ? { ...reel, ...data } : reel
      );
      
      set({ reels, currentReel: data });
      return data;
    } catch (error: any) {
      console.error('Error updating reel:', error);
      set({ error: error.message });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
  
  deleteReel: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('reels')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update reels list
      const reels = get().reels.filter(reel => reel.id !== id);
      set({ reels, currentReel: null });
      
      return true;
    } catch (error: any) {
      console.error('Error deleting reel:', error);
      set({ error: error.message });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  
  publishReel: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data, error } = await supabase
        .from('reels')
        .update({
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update reels list
      const reels = get().reels.map(reel => 
        reel.id === id ? { ...reel, ...data } : reel
      );
      
      set({ reels, currentReel: data });
      return data;
    } catch (error: any) {
      console.error('Error publishing reel:', error);
      set({ error: error.message });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
  
  likeReel: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('reel_engagements')
        .insert({
          reel_id: id,
          type: 'like'
        });
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Error liking reel:', error);
      set({ error: error.message });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  
  unlikeReel: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('reel_engagements')
        .delete()
        .eq('reel_id', id)
        .eq('type', 'like');
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Error unliking reel:', error);
      set({ error: error.message });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  
  commentOnReel: async (id, comment) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('reel_engagements')
        .insert({
          reel_id: id,
          type: 'comment',
          comment_text: comment
        });
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Error commenting on reel:', error);
      set({ error: error.message });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  
  shareReel: async (id, platform) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase
        .from('social_shares')
        .insert({
          reel_id: id,
          platform,
          status: 'pending'
        });
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Error sharing reel:', error);
      set({ error: error.message });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  
  loadMusicLibrary: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // In a real implementation, this would fetch from an API or database
      // For now, we'll use mock data
      const mockMusicLibrary: MusicTrack[] = [
        {
          id: 'music-1',
          title: 'Summer Vibes',
          artist: 'Beach Tunes',
          duration: 30,
          url: 'https://example.com/music/summer-vibes.mp3',
          thumbnail: 'https://example.com/music/summer-vibes.jpg',
          category: 'Upbeat',
          isPremium: false
        },
        {
          id: 'music-2',
          title: 'Urban Beats',
          artist: 'City Sounds',
          duration: 30,
          url: 'https://example.com/music/urban-beats.mp3',
          thumbnail: 'https://example.com/music/urban-beats.jpg',
          category: 'Hip Hop',
          isPremium: false
        },
        {
          id: 'music-3',
          title: 'Elegant Piano',
          artist: 'Classical Vibes',
          duration: 30,
          url: 'https://example.com/music/elegant-piano.mp3',
          thumbnail: 'https://example.com/music/elegant-piano.jpg',
          category: 'Classical',
          isPremium: false
        },
        {
          id: 'music-4',
          title: 'Corporate Success',
          artist: 'Business Tunes',
          duration: 30,
          url: 'https://example.com/music/corporate-success.mp3',
          thumbnail: 'https://example.com/music/corporate-success.jpg',
          category: 'Corporate',
          isPremium: true
        },
        {
          id: 'music-5',
          title: 'Real Estate Groove',
          artist: 'Property Beats',
          duration: 30,
          url: 'https://example.com/music/real-estate-groove.mp3',
          thumbnail: 'https://example.com/music/real-estate-groove.jpg',
          category: 'Real Estate',
          isPremium: true
        }
      ];
      
      set({ musicLibrary: mockMusicLibrary });
    } catch (error: any) {
      console.error('Error loading music library:', error);
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  loadStickerLibrary: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // In a real implementation, this would fetch from an API or database
      // For now, we'll use mock data
      const mockStickerLibrary: Sticker[] = [
        {
          id: 'sticker-1',
          name: 'For Sale',
          url: 'https://example.com/stickers/for-sale.png',
          category: 'Real Estate',
          isPremium: false
        },
        {
          id: 'sticker-2',
          name: 'New Listing',
          url: 'https://example.com/stickers/new-listing.png',
          category: 'Real Estate',
          isPremium: false
        },
        {
          id: 'sticker-3',
          name: 'Price Reduced',
          url: 'https://example.com/stickers/price-reduced.png',
          category: 'Real Estate',
          isPremium: false
        },
        {
          id: 'sticker-4',
          name: 'Luxury',
          url: 'https://example.com/stickers/luxury.png',
          category: 'Real Estate',
          isPremium: true
        },
        {
          id: 'sticker-5',
          name: 'Verified',
          url: 'https://example.com/stickers/verified.png',
          category: 'General',
          isPremium: true
        }
      ];
      
      set({ stickerLibrary: mockStickerLibrary });
    } catch (error: any) {
      console.error('Error loading sticker library:', error);
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  loadTextStyles: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // In a real implementation, this would fetch from an API or database
      // For now, we'll use mock data
      const mockTextStyles: TextStyle[] = [
        {
          id: 'text-style-1',
          name: 'Basic',
          font: 'Arial',
          color: '#FFFFFF',
          background: '#000000',
          isPremium: false
        },
        {
          id: 'text-style-2',
          name: 'Bold',
          font: 'Arial Bold',
          color: '#FFFFFF',
          background: '#FF0000',
          isPremium: false
        },
        {
          id: 'text-style-3',
          name: 'Elegant',
          font: 'Times New Roman',
          color: '#FFFFFF',
          background: '#0000FF',
          isPremium: false
        },
        {
          id: 'text-style-4',
          name: 'Modern',
          font: 'Helvetica',
          color: '#FFFFFF',
          background: '#00FF00',
          isPremium: true
        },
        {
          id: 'text-style-5',
          name: 'Luxury',
          font: 'Playfair Display',
          color: '#FFFFFF',
          background: '#FFD700',
          isPremium: true
        }
      ];
      
      set({ textStyles: mockTextStyles });
    } catch (error: any) {
      console.error('Error loading text styles:', error);
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
  
  loadFilters: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // In a real implementation, this would fetch from an API or database
      // For now, we'll use mock data
      const mockFilters: Filter[] = [
        {
          id: 'filter-1',
          name: 'Normal',
          preview: 'https://example.com/filters/normal.jpg',
          strength: 0,
          isPremium: false
        },
        {
          id: 'filter-2',
          name: 'Bright',
          preview: 'https://example.com/filters/bright.jpg',
          strength: 0.5,
          isPremium: false
        },
        {
          id: 'filter-3',
          name: 'Warm',
          preview: 'https://example.com/filters/warm.jpg',
          strength: 0.5,
          isPremium: false
        },
        {
          id: 'filter-4',
          name: 'Cool',
          preview: 'https://example.com/filters/cool.jpg',
          strength: 0.5,
          isPremium: false
        },
        {
          id: 'filter-5',
          name: 'Luxury',
          preview: 'https://example.com/filters/luxury.jpg',
          strength: 0.5,
          isPremium: true
        }
      ];
      
      set({ filters: mockFilters });
    } catch (error: any) {
      console.error('Error loading filters:', error);
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  }
}));