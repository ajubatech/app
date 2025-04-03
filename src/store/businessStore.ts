import { create } from 'zustand';
import { BusinessProfile } from '../types';

interface BusinessState {
  profile: BusinessProfile | null;
  isLoading: boolean;
  error: string | null;
  setProfile: (profile: BusinessProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useBusinessStore = create<BusinessState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));