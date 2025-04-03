import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Plus, Minus, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import ImageUpload from '../ImageUpload';

interface ServiceFormData {
  title: string;
  description: string;
  category: string;
  hourlyRate: number;
  addOns: {
    name: string;
    price: number;
    description: string;
  }[];
  availability: {
    days: string[];
    hours: {
      start: string;
      end: string;
    };
  };
  areaServed: {
    radius: number;
    location: string;
  };
  skills: string[];
  languages: string[];
  certifications: string[];
}

export default function ServiceListingForm() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ServiceFormData>();
  const [prompt, setPrompt] = useState('');

  const handleBack = () => {
    navigate(-1);
  };

  const generateWithAI = async () => {
    if (!prompt) {
      toast.error('Please enter a description of your service');
      return;
    }

    try {
      setIsGenerating(true);
      const { data, error } = await supabase.functions.invoke('generate-service-listing', {
        body: { prompt }
      });

      if (error) throw error;

      // Populate form with AI-generated data
      setValue('title', data.title);
      setValue('description', data.description);
      setValue('category', data.category);
      setValue('hourlyRate', data.hourlyRate);
      setValue('skills', data.skills);

      toast.success('Service listing generated successfully!');
    } catch (error) {
      console.error('Error generating listing:', error);
      toast.error('Failed to generate listing');
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data: ServiceFormData) => {
    try {
      // Create listing
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          title: data.title,
          description: data.description,
          category: 'services',
          price: data.hourlyRate,
          status: 'active'
        })
        .select()
        .single();

      if (listingError) throw listingError;

      // Create service metadata
      const { error: metadataError } = await supabase
        .from('service_metadata')
        .insert({
          listing_id: listing.id,
          category: data.category,
          hourly_rate: data.hourlyRate,
          add_ons: data.addOns,
          availability: data.availability,
          area_served: data.areaServed
        });

      if (metadataError) throw metadataError;

      toast.success('Service listing created successfully!');
      navigate(`/services/${listing.id}`);
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
        <h1 className="text-3xl font-bold">Create a Service Listing</h1>
      </div>

      {/* AI Generation */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Generate with AI</h2>
        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the service you're offering..."
            className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateWithAI}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              Generate Listing
            </motion.button>
            <div className="flex-1 flex items-center gap-4">
              <span className="text-sm text-gray-600">Or choose a suggestion:</span>
              {['Lawn Mowing', 'Electrician', 'Tutor', 'Driver'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setPrompt(`I offer professional ${suggestion.toLowerCase()} services`)}
                  className="px-3 py-1 bg-white rounded-full text-sm hover:bg-gray-50 border"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
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
                placeholder="e.g., Professional Web Design Services"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                {...register('category', { required: true })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select category</option>
                <option value="design">Design</option>
                <option value="development">Development</option>
                <option value="marketing">Marketing</option>
                <option value="writing">Writing</option>
                <option value="video">Video & Animation</option>
                <option value="music">Music & Audio</option>
                <option value="business">Business</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hourly Rate
              </label>
              <div className="relative">
                <span className="absolute left-4 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  {...register('hourlyRate', { required: true, min: 0 })}
                  className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
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
            placeholder="Describe your service in detail..."
          />
        </div>

        {/* Add-ons */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Service Add-ons</h2>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Plus className="w-4 h-4" />
              Add Option
            </button>
          </div>

          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    {...register('addOns.0.name')}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Weekend Work"
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
                      {...register('addOns.0.price')}
                      className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    {...register('addOns.0.description')}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Availability</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Working Days
              </label>
              <div className="grid grid-cols-4 gap-3">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <label
                    key={day}
                    className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      {...register('availability.days')}
                      value={day}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>{day}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  {...register('availability.hours.start')}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  {...register('availability.hours.end')}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Area Served */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Area Served</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                {...register('areaServed.location')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your location"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Radius (km)
              </label>
              <input
                type="number"
                {...register('areaServed.radius')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 25"
              />
            </div>
          </div>
        </div>

        {/* Portfolio */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Portfolio</h2>
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