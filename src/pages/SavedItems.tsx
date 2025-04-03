import React, { useState, useEffect } from 'react';
import { Heart, Bookmark, Film, Tag, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function SavedItems() {
  const { user } = useAuthStore();
  const [savedListings, setSavedListings] = useState<any[]>([]);
  const [savedReels, setSavedReels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'reels'>('listings');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadSavedItems();
    }
  }, [user]);

  const loadSavedItems = async () => {
    try {
      setIsLoading(true);
      
      // Load saved listings
      const { data: savedData, error: savedError } = await supabase
        .from('saved_listings')
        .select(`
          *,
          listings (
            id,
            title,
            price,
            category,
            status,
            created_at,
            media (
              id,
              url,
              type,
              tag
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (savedError) throw savedError;
      setSavedListings(savedData || []);
      
      // Load saved reels
      const { data: reelsData, error: reelsError } = await supabase
        .from('reel_likes')
        .select(`
          *,
          media (
            id,
            url,
            type,
            listings (
              id,
              title,
              price,
              category
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (reelsError && reelsError.code !== 'PGRST116') {
        throw reelsError;
      }
      setSavedReels(reelsData || []);
      
    } catch (error) {
      console.error('Error loading saved items:', error);
      toast.error('Failed to load saved items');
    } finally {
      setIsLoading(false);
    }
  };

  const removeSavedListing = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_listings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setSavedListings(prev => prev.filter(item => item.id !== id));
      
      toast.success('Listing removed from saved items');
    } catch (error) {
      console.error('Error removing saved listing:', error);
      toast.error('Failed to remove saved listing');
    }
  };

  const removeSavedReel = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reel_likes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setSavedReels(prev => prev.filter(item => item.id !== id));
      
      toast.success('Reel removed from saved items');
    } catch (error) {
      console.error('Error removing saved reel:', error);
      toast.error('Failed to remove saved reel');
    }
  };

  // Filter listings by category
  const filteredListings = categoryFilter === 'all' 
    ? savedListings 
    : savedListings.filter(item => item.listings?.category === categoryFilter);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Saved Items</h1>
        <div className="flex items-center gap-4">
          <div className="flex bg-white rounded-lg shadow-sm p-1">
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'listings' 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5" />
                <span>Listings</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('reels')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'reels' 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5" />
                <span>Reels</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'listings' && (
        <>
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
                  categoryFilter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                All Categories
              </button>
              <button
                onClick={() => setCategoryFilter('real_estate')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
                  categoryFilter === 'real_estate' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Real Estate
              </button>
              <button
                onClick={() => setCategoryFilter('products')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
                  categoryFilter === 'products' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setCategoryFilter('services')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
                  categoryFilter === 'services' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Services
              </button>
              <button
                onClick={() => setCategoryFilter('automotive')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
                  categoryFilter === 'automotive' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Automotive
              </button>
              <button
                onClick={() => setCategoryFilter('pets')}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
                  categoryFilter === 'pets' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Pets
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredListings.map((saved) => (
                <SavedListingCard 
                  key={saved.id} 
                  saved={saved} 
                  onRemove={() => removeSavedListing(saved.id)} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No saved listings</h2>
              <p className="text-gray-600 mb-6">
                Items you save will appear here for easy access
              </p>
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Explore Listings
              </Link>
            </div>
          )}
        </>
      )}

      {activeTab === 'reels' && (
        <>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="animate-pulse bg-gray-200 aspect-[9/16] rounded-lg"></div>
              ))}
            </div>
          ) : savedReels.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {savedReels.map((saved) => (
                <SavedReelCard 
                  key={saved.id} 
                  saved={saved} 
                  onRemove={() => removeSavedReel(saved.id)} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <Film className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No saved reels</h2>
              <p className="text-gray-600 mb-6">
                Reels you like will appear here for easy access
              </p>
              <Link
                to="/reels"
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Explore Reels
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SavedListingCard({ saved, onRemove }: { saved: any; onRemove: () => void }) {
  const listing = saved.listings;
  const mainImage = listing?.media?.find((m: any) => m.tag === 'Main Photo')?.url || 
                    listing?.media?.[0]?.url || 
                    'https://via.placeholder.com/300x200';
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-sm overflow-hidden"
    >
      <div className="relative">
        <Link to={`/${listing.category}/${listing.id}`}>
          <img 
            src={mainImage} 
            alt={listing.title} 
            className="w-full h-48 object-cover"
          />
          <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-md font-bold">
            ${listing.price.toLocaleString()}
          </div>
        </Link>
        <button
          onClick={onRemove}
          className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white"
        >
          <Heart className="w-5 h-5 fill-red-500 text-red-500" />
        </button>
      </div>
      
      <div className="p-4">
        <Link to={`/${listing.category}/${listing.id}`}>
          <h3 className="font-medium text-lg mb-1 line-clamp-1">{listing.title}</h3>
        </Link>
        
        <div className="flex items-center justify-between mt-2">
          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 capitalize">
            {listing.category.replace('_', ' ')}
          </span>
          <span className="text-xs text-gray-500">
            Saved {new Date(saved.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function SavedReelCard({ saved, onRemove }: { saved: any; onRemove: () => void }) {
  const reel = saved.media;
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="aspect-[9/16] rounded-lg overflow-hidden relative group"
    >
      <Link to={`/reels?id=${reel.id}`}>
        <video 
          src={reel.url} 
          className="w-full h-full object-cover"
          muted
          playsInline
          onMouseOver={(e) => e.currentTarget.play()}
          onMouseOut={(e) => {
            e.currentTarget.pause();
            e.currentTarget.currentTime = 0;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3">
          <p className="text-white text-sm font-medium line-clamp-1">
            {reel.listings?.title || 'Reel'}
          </p>
          {reel.listings?.price && (
            <p className="text-white/90 text-xs">
              ${reel.listings.price.toLocaleString()}
            </p>
          )}
        </div>
      </Link>
      
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Heart className="w-4 h-4 fill-white" />
      </button>
    </motion.div>
  );
}