import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Plus, Minus, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import ImageUpload from '../ImageUpload';

interface ProductFormData {
  title: string;
  description: string;
  condition: 'new' | 'used' | 'refurbished';
  brand?: string;
  model?: string;
  variants: {
    name: string;
    sku: string;
    price: number;
    stock: number;
  }[];
  specifications: Record<string, string>;
  shipping: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    free_shipping: boolean;
    estimated_days: number;
  };
}

export default function ProductListingForm() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ProductFormData>();
  const [prompt, setPrompt] = useState('');

  const handleBack = () => {
    navigate(-1);
  };

  const generateWithAI = async () => {
    if (!prompt) {
      toast.error('Please enter a description of your product');
      return;
    }

    try {
      setIsGenerating(true);
      const { data, error } = await supabase.functions.invoke('generate-product-listing', {
        body: { prompt }
      });

      if (error) throw error;

      // Populate form with AI-generated data
      setValue('title', data.title);
      setValue('description', data.description);
      setValue('brand', data.brand);
      setValue('model', data.model);
      setValue('specifications', data.specifications);

      toast.success('Product listing generated successfully!');
    } catch (error) {
      console.error('Error generating listing:', error);
      toast.error('Failed to generate listing');
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      // Create listing
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          title: data.title,
          description: data.description,
          category: 'products',
          price: data.variants[0].price, // Use first variant as main price
          status: 'active'
        })
        .select()
        .single();

      if (listingError) throw listingError;

      // Create product metadata
      const { error: metadataError } = await supabase
        .from('product_metadata')
        .insert({
          listing_id: listing.id,
          condition: data.condition,
          brand: data.brand,
          model: data.model,
          specifications: data.specifications,
          shipping_info: data.shipping
        });

      if (metadataError) throw metadataError;

      toast.success('Product listing created successfully!');
      navigate(`/products/${listing.id}`);
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error('Failed to create listing');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold">List a Product</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
                placeholder="e.g., Wireless Noise-Canceling Headphones"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <select
                {...register('condition', { required: true })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select condition</option>
                <option value="new">New</option>
                <option value="used">Used</option>
                <option value="refurbished">Refurbished</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <input
                type="text"
                {...register('brand')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter brand name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <input
                type="text"
                {...register('model')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter model number"
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
            placeholder="Describe your product in detail..."
          />
        </div>

        {/* Variants */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Product Variants</h2>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Plus className="w-4 h-4" />
              Add Variant
            </button>
          </div>

          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    {...register('variants.0.name')}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    {...register('variants.0.sku')}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      {...register('variants.0.price')}
                      className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    {...register('variants.0.stock')}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Images</h2>
          <ImageUpload />
        </div>

        {/* Shipping */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                {...register('shipping.weight')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensions (cm)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  {...register('shipping.dimensions.length')}
                  placeholder="L"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  {...register('shipping.dimensions.width')}
                  placeholder="W"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  {...register('shipping.dimensions.height')}
                  placeholder="H"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Days
              </label>
              <input
                type="number"
                {...register('shipping.estimated_days')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('shipping.free_shipping')}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Offer free shipping</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
          >
            Create Listing
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
  );
}