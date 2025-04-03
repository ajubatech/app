import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { 
  Heart, Share2, Clock, Star, Shield, Award,
  CheckCircle2, MessageCircle, Calendar, ArrowRight,
  Film, Plus
} from 'lucide-react';
import { useListingStore } from '../../store/listingStore';
import { formatDistance } from 'date-fns';
import { motion } from 'framer-motion';
import InvoiceButton from '../../components/InvoiceButton';
import ReelButton from '../../components/ReelButton';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function ServiceListing() {
  const { id } = useParams();
  const { selectedListing: listing, setSelectedListing } = useListingStore();
  const { userRole } = useAuthStore();
  const [selectedPackage, setSelectedPackage] = useState(0);
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
          service_metadata (*),
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

  if (loading || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const service = listing.service_metadata;
  const selectedPkg = service?.packages?.[selectedPackage] || {
    name: 'Standard',
    price: listing.price,
    description: 'Standard service package',
    features: ['Basic service'],
    delivery_time: 7
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {listing.title}
                </h1>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">4.9</span>
                    <span className="text-gray-600">(128 reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{listing.views} orders in queue</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-full border border-gray-200 hover:bg-gray-50"
                >
                  <Heart className="w-6 h-6 text-gray-600" />
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

            {/* Gallery */}
            <div className="relative rounded-2xl overflow-hidden">
              <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                className="aspect-video"
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
            </div>
          </div>

          {/* About This Service */}
          <div>
            <h2 className="text-2xl font-bold mb-4">About This Service</h2>
            <div className="prose max-w-none text-gray-600">
              <p className="whitespace-pre-line">{listing.description}</p>
            </div>
          </div>

          {/* Why Choose Me */}
          <div className="bg-blue-50 p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">Why Choose Me</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">Fast Delivery</p>
                  <p className="text-sm text-gray-600">
                    {service?.delivery_time || 7} days average
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">Quality Guarantee</p>
                  <p className="text-sm text-gray-600">
                    {service?.revisions || 2} revisions included
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">Expert Level</p>
                  <p className="text-sm text-gray-600">
                    Top rated in {service?.category || 'Services'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">Always Available</p>
                  <p className="text-sm text-gray-600">
                    Quick response guaranteed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio */}
          {service?.portfolio && service.portfolio.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Portfolio</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {service.portfolio.map((item: any) => (
                  <div 
                    key={item.id}
                    className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer"
                  >
                    <img 
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-center px-4">
                        {item.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills & Expertise */}
          {service?.skills && service.skills.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Skills & Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {service.skills.map((skill: string, index: number) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Reels Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Service Reels</h2>
              {(userRole === 'lister' || userRole === 'business') && (
                <ReelButton 
                  listingId={listing.id}
                  buttonText="Create Reel"
                />
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
                        {reel.caption || 'Service Reel'}
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
                <p className="text-gray-600 mb-4">No reels available for this service yet.</p>
                {(userRole === 'lister' || userRole === 'business') && (
                  <ReelButton 
                    listingId={listing.id}
                    buttonText="Create First Reel"
                  />
                )}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Reviews</h2>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-lg">4.9</span>
                <span className="text-gray-600">(128)</span>
              </div>
            </div>
            <div className="space-y-6">
              {/* Sample Review */}
              <div className="border-b pb-6">
                <div className="flex items-start gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="Reviewer"
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">Sarah Johnson</p>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i}
                                className="w-4 h-4 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            1 month ago
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        Premium Package
                      </p>
                    </div>
                    <p className="text-gray-600">
                      Exceptional service! The quality of work exceeded my expectations. 
                      Communication was great throughout the process.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Invoice Button */}
          <div>
            <InvoiceButton 
              listingId={listing.id}
              buttonText="Generate Invoice for this Service"
              className="w-full"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Packages */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-4">
            <div className="grid grid-cols-3 border-b">
              {service?.packages ? (
                service.packages.map((pkg: any, index: number) => (
                  <button
                    key={pkg.name}
                    onClick={() => setSelectedPackage(index)}
                    className={`py-4 text-center transition-colors ${
                      selectedPackage === index
                        ? 'bg-blue-50 border-b-2 border-blue-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <p className="font-medium">{pkg.name}</p>
                    <p className="text-sm text-gray-600">${pkg.price}</p>
                  </button>
                ))
              ) : (
                <button
                  className="py-4 text-center bg-blue-50 border-b-2 border-blue-600 col-span-3"
                >
                  <p className="font-medium">Standard</p>
                  <p className="text-sm text-gray-600">${listing.price}</p>
                </button>
              )}
            </div>

            <div className="p-6 space-y-6">
              <div>
                <p className="font-medium mb-2">{selectedPkg.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{selectedPkg.delivery_time} Days Delivery</span>
                </div>
              </div>

              <div className="space-y-3">
                {selectedPkg.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Continue (${selectedPkg.price})
              </motion.button>

              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors">
                <MessageCircle className="w-5 h-5" />
                Contact Seller
              </button>
            </div>
          </div>

          {/* Seller Info */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <img
                src={listing.users?.avatar_url || "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                alt="Seller"
                className="w-16 h-16 rounded-full"
              />
              <div>
                <p className="font-medium">{listing.users?.full_name || "David Chen"}</p>
                <p className="text-sm text-gray-600">Digital Artist & Designer</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">98%</p>
                <p className="text-sm text-gray-600">Completion</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">100%</p>
                <p className="text-sm text-gray-600">On Time</p>
              </div>
            </div>

            <div className="space-y-4">
              {service?.languages && service.languages.length > 0 && (
                <div>
                  <p className="font-medium mb-1">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {service.languages.map((lang: string, index: number) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-gray-100 rounded text-sm"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {service?.certification && service.certification.length > 0 && (
                <div>
                  <p className="font-medium mb-1">Certifications</p>
                  <div className="space-y-2">
                    {service.certification.map((cert: string, index: number) => (
                      <div 
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Award className="w-4 h-4 text-blue-600" />
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}