import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Sparkles, Loader2, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { propertyService } from '../../services/property';
import { googleService } from '../../services/google';
import ImageUpload from '../ImageUpload';
import BannerSelector from '../BannerSelector';
import { useCredits } from '../../hooks/useCredits';
import { useAutosave } from '../../hooks/useAutosave';
import { usePublish } from '../../hooks/usePublish';
import PublishModal from '../PublishModal';
import CreditWarningModal from '../CreditWarningModal';

interface RealEstateFormData {
  title: string;
  description: string;
  property_type: 'house' | 'apartment' | 'townhouse' | 'land';
  bedrooms: number;
  bathrooms: number;
  parking: number;
  land_size: number;
  floor_area: number;
  year_built?: number;
  features: string[];
  amenities: string[];
  open_homes: {
    date: string;
    start_time: string;
    end_time: string;
    agent: string;
  }[];
  price: number;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  banner?: {
    text: string;
    style: string;
  } | null;
}

export default function RealEstateListingForm() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RealEstateFormData>();
  const [prompt, setPrompt] = useState('');
  const [country, setCountry] = useState<'NZ' | 'AU'>('NZ');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showCreditWarning, setShowCreditWarning] = useState(false);
  const { checkListingQuota } = useCredits();
  const { debouncedSave, draftId } = useAutosave({ category: 'real_estate' });
  const { publish, isPublishing } = usePublish({
    onSuccess: (listingId) => {
      navigate(`/real-estate/${listingId}`);
    }
  });

  const handleBack = () => {
    navigate(-1);
  };

  const lookupProperty = async () => {
    const address = watch('address');
    if (!address) {
      toast.error('Please enter an address');
      return;
    }

    try {
      setIsLookingUp(true);

      // First validate the address
      const isValid = await googleService.validateAddress(address);
      if (!isValid) {
        toast.error('Please enter a valid address');
        return;
      }

      // Lookup property
      const result = await propertyService.lookupProperty(address, country);
      
      if (!result.success) {
        toast.error(result.error || 'Property lookup failed');
        return;
      }

      // Populate form with data
      setValue('location', {
        lat: result.data!.lat,
        lng: result.data!.lng
      });
      setValue('address', result.data!.property_address);
      
      if (result.data!.year_built) {
        setValue('year_built', parseInt(result.data!.year_built));
      }
      
      if (result.data!.land_size_sqm) {
        setValue('land_size', result.data!.land_size_sqm);
      }
      
      if (result.data!.floor_area_sqm) {
        setValue('floor_area', result.data!.floor_area_sqm);
      }
      
      if (result.data!.property_type) {
        setValue('property_type', result.data!.property_type as any);
      }

      if (result.data!.last_sold_price) {
        setValue('price', result.data!.last_sold_price);
      }

      toast.success('Property details found');
      
      // Save draft
      const formData = watch();
      debouncedSave(formData);
    } catch (error) {
      console.error('Error looking up property:', error);
      toast.error('Failed to lookup property');
    } finally {
      setIsLookingUp(false);
    }
  };

  const generateWithAI = async () => {
    if (!prompt) {
      toast.error('Please enter a description of your property');
      return;
    }

    try {
      setIsGenerating(true);
      const { data, error } = await supabase.functions.invoke('generate-listing-ai', {
        body: { 
          prompt,
          category: 'real_estate'
        }
      });

      if (error) throw error;

      // Populate form with AI-generated data
      setValue('title', data.title);
      setValue('description', data.description);
      setValue('features', data.features);
      setValue('amenities', data.amenities);
      setValue('property_type', data.propertyType);

      toast.success('Listing generated successfully!');
      
      // Save draft
      const formData = watch();
      debouncedSave(formData);
    } catch (error) {
      console.error('Error generating listing:', error);
      toast.error('Failed to generate listing');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFormSubmit = async (data: RealEstateFormData) => {
    // Check if user has listing credits
    const hasQuota = await checkListingQuota();
    if (!hasQuota) {
      setShowCreditWarning(true);
      return;
    }
    
    setShowPublishModal(true);
  };

  const handlePublish = async () => {
    const data = watch();
    
    try {
      // Create listing object
      const listing = {
        title: data.title,
        description: data.description,
        category: 'real_estate',
        price: data.price,
        status: 'active',
        location: {
          address: data.address,
          ...data.location
        },
        metadata: {
          sale_type: 'for_sale'
        },
        banner_text: data.banner?.text,
        banner_style: data.banner?.style,
        banner_type: user?.subscription_type === 'pro' || user?.subscription_type === 'business' ? 'pro' : 'free'
      };
      
      // Create real estate metadata
      const metadata = {
        property_type: data.property_type,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        parking: data.parking,
        land_size: data.land_size,
        floor_area: data.floor_area,
        year_built: data.year_built,
        features: data.features,
        amenities: data.amenities,
        open_homes: data.open_homes
      };
      
      // Publish listing
      await publish({
        ...listing,
        real_estate_metadata: metadata
      }, draftId);
      
    } catch (error) {
      console.error('Error publishing listing:', error);
      toast.error('Failed to publish listing');
    } finally {
      setShowPublishModal(false);
    }
  };

  // Watch for form changes and save draft
  React.useEffect(() => {
    const subscription = watch((value) => {
      debouncedSave(value);
    });
    return () => subscription.unsubscribe();
  }, [watch, debouncedSave]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold">List a Property</h1>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
          {/* AI Generation */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Start with AI</h2>
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your property and let AI help create the listing..."
                className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={generateWithAI}
                disabled={isGenerating}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                Generate with AI
              </motion.button>
            </div>
          </div>

          {/* Property Lookup */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Property Details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property Address
                  </label>
                  <input
                    type="text"
                    {...register('address')}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full property address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value as 'NZ' | 'AU')}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="NZ">New Zealand</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={lookupProperty}
                disabled={isLookingUp}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {isLookingUp ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                Lookup Property
              </motion.button>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  {...register('title', { required: true })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Modern 3-Bedroom House with Pool"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type
                </label>
                <select
                  {...register('property_type', { required: true })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select type</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="land">Land</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    {...register('price', { required: true, min: 0 })}
                    className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Property Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bedrooms
                </label>
                <input
                  type="number"
                  {...register('bedrooms', { required: true, min: 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bathrooms
                </label>
                <input
                  type="number"
                  {...register('bathrooms', { required: true, min: 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parking Spaces
                </label>
                <input
                  type="number"
                  {...register('parking', { required: true, min: 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Floor Area (m²)
                </label>
                <input
                  type="number"
                  {...register('floor_area', { required: true, min: 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Land Size (m²)
                </label>
                <input
                  type="number"
                  {...register('land_size', { required: true, min: 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year Built
                </label>
                <input
                  type="number"
                  {...register('year_built')}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Description</h2>
            <textarea
              {...register('description', { required: true })}
              rows={6}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your property..."
            />
          </div>

          {/* Features & Amenities */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Features & Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                'Air Conditioning',
                'Swimming Pool',
                'Garden',
                'Security System',
                'Solar Panels',
                'Home Theater',
                'Wine Cellar',
                'Gym',
                'Fireplace',
              ].map((feature) => (
                <label 
                  key={feature} 
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    {...register('features')}
                    value={feature}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>{feature}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Banner Selection */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Listing Banner</h2>
            <BannerSelector 
              value={watch('banner') || null}
              onChange={(banner) => setValue('banner', banner)}
            />
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Property Images</h2>
            <ImageUpload />
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
            >
              Publish Listing
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleBack}
              className="flex-1 border border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-50"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </div>

      {/* Publish Modal */}
      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onConfirm={handlePublish}
        onCreateReel={() => navigate('/create-reel')}
        listingTitle={watch('title') || 'Property Listing'}
      />

      {/* Credit Warning Modal */}
      <CreditWarningModal
        isOpen={showCreditWarning}
        onClose={() => setShowCreditWarning(false)}
        type="manual"
      />
    </div>
  );
}