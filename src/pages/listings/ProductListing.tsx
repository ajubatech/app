import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs } from 'swiper/modules';
import { 
  Heart, Share2, MapPin, Truck, Shield, 
  Star, MessageCircle, Package, ArrowRight,
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
import 'swiper/css/thumbs';

export default function ProductListing() {
  const { id } = useParams();
  const { selectedListing: listing, setSelectedListing } = useListingStore();
  const { userRole } = useAuthStore();
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
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
          product_metadata (*),
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

  const product = listing.product_metadata;
  const variant = product?.variants?.[selectedVariant] || { price: listing.price, name: 'Standard', stock: 10 };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <Swiper
            modules={[Navigation, Pagination, Thumbs]}
            navigation
            pagination={{ clickable: true }}
            thumbs={{ swiper: thumbsSwiper }}
            className="aspect-square rounded-2xl overflow-hidden"
          >
            {listing.media?.map((image: any, index: number) => (
              <SwiperSlide key={index}>
                <img 
                  src={image.url} 
                  alt={`${listing.title} - Image ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              </SwiperSlide>
            ))}
          </Swiper>
          
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={10}
            slidesPerView={4}
            freeMode={true}
            watchSlidesProgress={true}
            modules={[Navigation, Thumbs]}
            className="h-24"
          >
            {listing.media?.map((image: any, index: number) => (
              <SwiperSlide key={index}>
                <img 
                  src={image.url} 
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg cursor-pointer"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {listing.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>4.8 (256 reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  <span>{listing.views} sold</span>
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

          {/* Price */}
          <div className="bg-blue-50 p-6 rounded-xl">
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-gray-600">From</span>
              <span className="text-4xl font-bold text-blue-600">
                ${variant.price?.toLocaleString() || listing.price.toLocaleString()}
              </span>
            </div>
            {variant.stock < 10 && (
              <p className="text-sm text-red-600 mt-2">
                Only {variant.stock} left in stock!
              </p>
            )}
          </div>

          {/* Variants */}
          {product?.variants && product.variants.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Options</h3>
              <div className="grid grid-cols-2 gap-3">
                {product.variants.map((v: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedVariant(index)}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      selectedVariant === index
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-600'
                    }`}
                  >
                    <p className="font-medium">{v.name}</p>
                    <p className="text-sm text-gray-600">${v.price}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quantity</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                className="w-20 h-10 rounded-lg border border-gray-200 text-center"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Buy Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 border border-blue-600 text-blue-600 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              Add to Cart
            </motion.button>
          </div>

          {/* Shipping */}
          <div className="border-t pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-gray-600 mt-1" />
              <div>
                <p className="font-medium">Free Shipping</p>
                <p className="text-sm text-gray-600">
                  Estimated delivery: {product?.shipping_info?.estimated_days || 3-5} days
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-gray-600 mt-1" />
              <div>
                <p className="font-medium">Buyer Protection</p>
                <p className="text-sm text-gray-600">
                  Get full refund if the item is not as described
                </p>
              </div>
            </div>
          </div>
          
          {/* Create Reel Button */}
          <div className="pt-4 flex gap-4">
            <ReelButton 
              listingId={listing.id}
              buttonText="Create Product Reel"
              className="flex-1"
            />
            
            <InvoiceButton 
              listingId={listing.id}
              buttonText="Generate Invoice"
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Product Details</h2>
            <div className="prose max-w-none">
              <p className="text-gray-600 whitespace-pre-line">
                {listing.description}
              </p>
            </div>
          </div>

          {/* Specifications */}
          {product?.specifications && Object.keys(product.specifications).length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div 
                    key={key}
                    className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg"
                  >
                    <span className="text-gray-600">{key}:</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Reels Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Product Reels</h2>
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
                        {reel.caption || 'Product Reel'}
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
                <p className="text-gray-600 mb-4">No reels available for this product yet.</p>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Customer Reviews</h2>
              <button className="text-blue-600 font-medium hover:underline">
                Write a Review
              </button>
            </div>
            <div className="space-y-6">
              {/* Sample Review */}
              <div className="border-b pb-6">
                <div className="flex items-center gap-4 mb-3">
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="Reviewer"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-medium">John Doe</p>
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
                        2 weeks ago
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">
                  Great product! Exactly as described and arrived quickly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Seller Info */}
        <div>
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 sticky top-4">
            <h3 className="text-xl font-semibold mb-4">Seller Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={listing.users?.avatar_url || "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                  alt="Seller"
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <p className="font-medium">{listing.users?.full_name || "Tech Store"}</p>
                  <p className="text-sm text-gray-600">Member since 2020</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="font-medium">98%</p>
                  <p className="text-sm text-gray-600">Positive</p>
                </div>
                <div>
                  <p className="font-medium">1.2k</p>
                  <p className="text-sm text-gray-600">Followers</p>
                </div>
                <div>
                  <p className="font-medium">5k+</p>
                  <p className="text-sm text-gray-600">Products</p>
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                <MessageCircle className="w-5 h-5" />
                Contact Seller
              </button>
              <button className="w-full flex items-center justify-center gap-2 text-blue-600 hover:underline">
                <span>Visit Store</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Import Link at the top
import { Link } from 'react-router-dom';