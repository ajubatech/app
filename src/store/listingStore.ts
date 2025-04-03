import { create } from 'zustand';
import { Listing } from '../types';

interface ListingState {
  listings: Listing[];
  draftListings: Listing[];
  activeListings: Listing[];
  selectedListing: Listing | null;
  isLoading: boolean;
  error: string | null;
  setListings: (listings: Listing[]) => void;
  setDraftListings: (listings: Listing[]) => void;
  setActiveListings: (listings: Listing[]) => void;
  setSelectedListing: (listing: Listing | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useListingStore = create<ListingState>((set) => ({
  listings: [],
  draftListings: [],
  activeListings: [],
  selectedListing: null,
  isLoading: false,
  error: null,
  setListings: (listings) => set({ listings }),
  setDraftListings: (listings) => set({ draftListings: listings }),
  setActiveListings: (listings) => set({ activeListings: listings }),
  setSelectedListing: (listing) => set({ selectedListing: listing }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));