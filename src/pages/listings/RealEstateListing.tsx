import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { 
  Bed, Bath, Car, Ruler, CalendarDays, Heart, Share2, 
  MapPin, Phone, Mail, Clock, ChevronRight, Info, Map,
  Film, Plus
} from 'lucide-react';
import { useListingStore } from '../../store/listingStore';
import { formatDistance } from 'date-fns';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import PropertyMap from '../../components/PropertyMap';
import InquiryModal from '../../components/InquiryModal';
import InvoiceButton from '../../components/InvoiceButton';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function RealEstateListing() {
  const { id } = useParams();
  const { selectedListing: listing, setSelectedListing } = useListingStore();
  const { user, userRole } = useAuthStore();
  const [showContactForm, setShowContactForm] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reels, setReels] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadListing(id);
    }
  }, [id]);

  const loadListing = async (listingId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          media (
            id,
            url,
            type,
            tag,
            status
          ),
          real_estate_metadata (*),
          users (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('id', listingId)
        .single();

      if (error) throw error;
      setSelectedListing(data);

      // Increment view count
      await supabase
        .from('listings')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', listingId);
        
      // Load reels for this listing
      loadReels(listingId);
    } catch (error) {
      console.error('Error loading listing:', error);
      toast.error('Failed to load listing');
    } finally {
      setLoading(false);
    }
  };
  
  const loadReels = async (listingId: string) => {
    try {
      const { data, error } = await supabase
        .from('reels')
        .select(`
          id,
          caption,
          hashtags,
          status,
          views,
          created_at,
          media (
            id,
            url,
            type
          )
        `)
        .eq('listing_id', listingId)
        .eq('status', 'published')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setReels(data || []);
    } catch (error) {
      console.error('Error loading reels:', error);
    }
  };

  const handleLike = async () => {
    try {
      if (!listing) return;

      await supabase
        .from('saved_listings')
        .upsert({
          listing_id: listing.id,
          created_at: new Date().toISOString()
        });

      setIsLiked(true);
      toast.success('Listing saved!');
    } catch (error) {
      console.error('Error saving listing:', error);
      toast.error('Failed to save listing');
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
    
    if (!listing) return;
    
    // Navigate to reels page with listing ID
    window.location.href = `/reels?listingId=${listing.id}`;
  };

  if (loading || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const realEstate = listing.real_estate_metadata;
  const mainImage = listing.media?.find((m: any) => m.tag === 'Main Photo')?.url || 
                    listing.media?.[0]?.url || 
                    'https://via.placeholder.com/800x600';

  // Banner styles
  const getBannerStyle = (style: string) => {
    switch (style) {
      case 'primary':
        return 'bg-blue-600 text-white';
      case 'success':
        return 'bg-green-600 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'danger':
        return 'bg-red-600 text-white';
      case 'info':
        return 'bg-purple-600 text-white';
      default:
        return 'bg-gray-800 text-white';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Image Gallery */}
      <div className="relative rounded-2xl overflow-hidden mb-8">
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          className="aspect-[16/9]"
        >
          {listing.media?.map((image: any, index: number) => (
            <SwiperSlide key={index}>
              <img 
                src={image.url} 
                alt={`${listing.title} - Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
        
        {/* Banner */}
        {listing.metadata?.banner && (
          <div className={`absolute top-3 left-0 ${
            getBannerStyle(listing.metadata.banner.style)
          } px-4 py-1 text-sm font-medium`}>
            {listing.metadata.banner.text}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {listing.title}
                </h1>
                <p className="text-lg text-gray-600 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {listing.location?.address}
                </p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLike}
                  className={`p-2 rounded-full border ${
                    isLiked 
                      ? 'bg-red-50 border-red-200 text-red-500' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-full border border-gray-200 hover:bg-gray-50"
                >
                  <Share2 className="w-6 h-6 text-gray-600" />
                </motion.button>
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-4xl font-bold text-blue-600">
                ${listing.price.toLocaleString()}
              </h2>
            </div>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-4 gap-4 p-6 bg-gray-50 rounded-xl mb-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full">
                <Bed className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Bedrooms</p>
              <p className="text-lg font-semibold">{realEstate.bedrooms}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full">
                <Bath className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Bathrooms</p>
              <p className="text-lg font-semibold">{realEstate.bathrooms}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Parking</p>
              <p className="text-lg font-semibold">{realEstate.parking}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full">
                <Ruler className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Floor Area</p>
              <p className="text-lg font-semibold">{realEstate.floor_area}m²</p>
            </div>
          </div>

          {/* Description */}
          <div className="prose max-w-none mb-8">
            <h3 className="text-xl font-semibold mb-4">Property Description</h3>
            <p className="text-gray-600 whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Features & Amenities */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Features & Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {realEstate.features?.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 text-gray-600"
                >
                  <ChevronRight className="w-5 h-5 text-blue-600" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Location</h3>
              <button
                onClick={() => setShowMap(!showMap)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                {showMap ? 'Hide Map' : 'Show Map'}
                <Map className="w-4 h-4" />
              </button>
            </div>
            
            {showMap && listing.location?.lat && listing.location?.lng && (
              <div className="h-[400px] bg-gray-100 rounded-lg overflow-hidden">
                <PropertyMap 
                  properties={[listing]} 
                  loading={false}
                />
              </div>
            )}
          </div>

          {/* Open Homes */}
          {realEstate.open_homes?.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Open Homes</h3>
              <div className="space-y-4">
                {realEstate.open_homes.map((openHome, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <CalendarDays className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-semibold">{openHome.date}</p>
                      <p className="text-gray-600">
                        {openHome.start_time} - {openHome.end_time}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <p className="text-gray-600">Agent: {openHome.agent}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Reels Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Property Reels</h3>
              {(userRole === 'lister' || userRole === 'business') && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateReel}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Create Reel
                </motion.button>
              )}
            </div>
            
            {reels.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {reels.map((reel) => (
                  <Link 
                    key={reel.id}
                    to={`/reels?id=${reel.id}`}
                    className="aspect-[9/16] bg-gray-200 rounded-lg overflow-hidden relative group"
                  >
                    <video
                      src={reel.media?.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      onMouseOver={(e) => e.currentTarget.play()}
                      onMouseOut={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                      <p className="text-white text-sm line-clamp-2">
                        {reel.caption || 'Property Reel'}
                      </p>
                    </div>
                    <div className="absolute top-2 right-2 bg-black/50 rounded-full p-2">
                      <Film className="w-4 h-4 text-white" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <Film className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No reels available for this property yet.</p>
                {(userRole === 'lister' || userRole === 'business') && (
                  <button
                    onClick={handleCreateReel}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Reel
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Invoice Button for Listers/Business */}
          <div className="mb-8">
            <InvoiceButton 
              listingId={listing.id}
              buttonText="Generate Invoice for this Property"
              className="w-full"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold mb-4">Contact Agent</h3>
            <div className="flex items-center gap-4 mb-6">
              <img
                src={listing.users?.avatar_url || 'https://via.placeholder.com/64'}
                alt="Agent"
                className="w-16 h-16 rounded-full"
              />
              <div>
                <p className="font-medium">{listing.users?.full_name || 'Agent'}</p>
                <p className="text-sm text-gray-600">Real Estate Agent</p>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowContactForm(true)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Send Message
            </motion.button>

            <div className="mt-6 space-y-4">
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                <Phone className="w-5 h-5" />
                Call Agent
              </button>
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                <Mail className="w-5 h-5" />
                Email Agent
              </button>
            </div>
          </div>

          {/* Property Details Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-semibold mb-4">Property Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Property Type</span>
                <span className="font-semibold capitalize">
                  {realEstate.property_type}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Land Size</span>
                <span className="font-semibold">{realEstate.land_size}m²</span>
              </div>
              {realEstate.year_built && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Year Built</span>
                  <span className="font-semibold">{realEstate.year_built}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Listed</span>
                <span className="font-semibold">
                  {formatDistance(new Date(listing.created_at), new Date(), { 
                    addSuffix: true 
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Listing Stats */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="text-gray-600">Activity</span>
              </div>
              <Info className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Views</span>
                <span className="font-semibold">{listing.views}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Watchlist</span>
                <span className="font-semibold">{listing.likes}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={showContactForm}
        onClose={() => setShowContactForm(false)}
        listing={{
          id: listing.id,
          title: listing.title,
          user_id: listing.user_id
        }}
      />
    </div>
  );
}