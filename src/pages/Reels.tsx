import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, ArrowLeft, Film } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Virtual, Mousewheel, Keyboard } from 'swiper/modules';
import { useInView } from 'react-intersection-observer';
import ReelPlayer from '../components/ReelPlayer';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import ReelCreator from '../components/ReelCreator';

import 'swiper/css';

export default function Reels() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole } = useAuthStore();
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showCreator, setShowCreator] = useState(false);
  const [specificReelId, setSpecificReelId] = useState<string | null>(null);
  const swiperRef = useRef<any>(null);

  useEffect(() => {
    // Check if a specific reel ID is provided in the URL
    const params = new URLSearchParams(location.search);
    const reelId = params.get('id');
    const listingId = params.get('listingId');
    
    if (reelId) {
      setSpecificReelId(reelId);
    }
    
    if (listingId) {
      setShowCreator(true);
    } else {
      loadReels();
    }
  }, [location]);

  const loadReels = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('reels')
        .select(`
          id,
          caption,
          hashtags,
          music,
          status,
          views,
          created_at,
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
          ),
          media (
            id,
            url,
            type
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });
      
      // If a specific reel ID is provided, filter by it
      if (specificReelId) {
        query = query.eq('id', specificReelId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Process the data to format it for ReelPlayer
      const formattedReels = data?.map(reel => ({
        id: reel.id,
        url: reel.media?.url,
        caption: reel.caption,
        hashtags: reel.hashtags,
        user: reel.users,
        listing: reel.listings,
        music: reel.music,
        likes: 0, // This would be calculated from engagements in a real implementation
        comments: 0 // This would be calculated from engagements in a real implementation
      })) || [];
      
      setReels(formattedReels);
      
      // If a specific reel was requested, find its index
      if (specificReelId && formattedReels.length > 0) {
        const index = formattedReels.findIndex(reel => reel.id === specificReelId);
        if (index !== -1) {
          setActiveIndex(index);
        }
      }
    } catch (error) {
      console.error('Error loading reels:', error);
      toast.error('Failed to load reels');
    } finally {
      setLoading(false);
    }
  };

  const handleSlideChange = (swiper: any) => {
    setActiveIndex(swiper.activeIndex);
    
    // Update view count
    if (reels[swiper.activeIndex]) {
      updateViewCount(reels[swiper.activeIndex].id);
    }
  };

  const updateViewCount = async (reelId: string) => {
    try {
      await supabase.rpc('increment_reel_views', { reel_id: reelId });
    } catch (error) {
      console.error('Error updating view count:', error);
    }
  };

  const handleCreateReel = () => {
    if (!user) {
      toast.error('Please sign in to create reels');
      return;
    }
    
    if (userRole !== 'lister' && userRole !== 'business') {
      toast.error('Only listers and businesses can create reels');
      return;
    }
    
    setShowCreator(true);
  };

  if (showCreator) {
    return (
      <ReelCreator
        listingId={new URLSearchParams(location.search).get('listingId') || undefined}
        onClose={() => {
          setShowCreator(false);
          loadReels();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <Film className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">No Reels Found</h2>
          <p className="text-gray-400 mb-8">
            {specificReelId
              ? "The reel you're looking for doesn't exist or has been removed."
              : "There are no reels available yet. Be the first to create one!"}
          </p>
          
          {(userRole === 'lister' || userRole === 'business') && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateReel}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-medium hover:from-blue-700 hover:to-purple-700 flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Create Reel
            </motion.button>
          )}
          
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-blue-400 hover:underline flex items-center gap-1 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Create Reel Button */}
      {(userRole === 'lister' || userRole === 'business') && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreateReel}
          className="fixed bottom-20 right-4 z-50 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg"
        >
          <Plus className="w-6 h-6 text-white" />
        </motion.button>
      )}
      
      {/* Reels Feed */}
      <Swiper
        direction="vertical"
        modules={[Virtual, Mousewheel, Keyboard]}
        virtual
        mousewheel
        keyboard
        slidesPerView={1}
        initialSlide={activeIndex}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={handleSlideChange}
        className="h-screen"
      >
        {reels.map((reel, index) => (
          <SwiperSlide key={reel.id} virtualIndex={index}>
            <ReelWithInView 
              reel={reel} 
              isActive={index === activeIndex} 
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

// Component to handle InView for each reel
function ReelWithInView({ reel, isActive }: { reel: any; isActive: boolean }) {
  const { ref, inView } = useInView({
    threshold: 0.5,
    initialInView: isActive
  });
  
  return (
    <div ref={ref} className="h-full">
      <ReelPlayer 
        reel={reel} 
        autoPlay={isActive} 
        inView={inView && isActive}
      />
    </div>
  );
}