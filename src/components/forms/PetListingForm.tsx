import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import ImageUpload from '../ImageUpload';

interface PetFormData {
  title: string;
  description: string;
  breed: string;
  age: number;
  gender: 'male' | 'female';
  health_info: {
    vaccinated: boolean;
    desexed: boolean;
    microchipped: boolean;
    health_certificate: boolean;
    medical_history?: string;
  };
  training: {
    house_trained: boolean;
    basic_commands: boolean;
    leash_trained: boolean;
    crate_trained: boolean;
    additional_training?: string;
  };
  price: number;
}

export default function PetListingForm() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PetFormData>();
  const [prompt, setPrompt] = useState('');

  const handleBack = () => {
    navigate(-1);
  };

  const generateWithAI = async () => {
    if (!prompt) {
      toast.error('Please enter a description of your pet');
      return;
    }

    try {
      setIsGenerating(true);
      const { data, error } = await supabase.functions.invoke('generate-pet-listing', {
        body: { prompt }
      });

      if (error) throw error;

      // Populate form with AI-generated data
      setValue('title', data.title);
      setValue('description', data.description);
      setValue('breed', data.breed);
      setValue('health_info', data.health_info);
      setValue('training', data.training);

      toast.success('Pet listing generated successfully!');
    } catch (error) {
      console.error('Error generating listing:', error);
      toast.error('Failed to generate listing');
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data: PetFormData) => {
    try {
      // Create listing
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          title: data.title,
          description: data.description,
          category: 'pets',
          price: data.price,
          status: 'active'
        })
        .select()
        .single();

      if (listingError) throw listingError;

      // Create pet metadata
      const { error: metadataError } = await supabase
        .from('pet_metadata')
        .insert({
          listing_id: listing.id,
          breed: data.breed,
          age: data.age,
          gender: data.gender,
          health_info: data.health_info,
          training: data.training
        });

      if (metadataError) throw metadataError;

      toast.success('Pet listing created successfully!');
      navigate(`/pets/${listing.id}`);
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
        <h1 className="text-3xl font-bold">List a Pet</h1>
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
                placeholder="e.g., Lovely Golden Retriever Puppy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Breed
              </label>
              <input
                type="text"
                {...register('breed', { required: true })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter breed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age (months)
              </label>
              <input
                type="number"
                {...register('age', { required: true, min: 0 })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 6"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                {...register('gender', { required: true })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
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

        {/* Description */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Description</h2>
          <textarea
            {...register('description', { required: true })}
            rows={6}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe your pet's personality, history, and any special requirements..."
          />
        </div>

        {/* Health Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Health Information</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('health_info.vaccinated')}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Vaccinated</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('health_info.desexed')}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Desexed</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('health_info.microchipped')}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Microchipped</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('health_info.health_certificate')}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Health Certificate</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical History
              </label>
              <textarea
                {...register('health_info.medical_history')}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any relevant medical history..."
              />
            </div>
          </div>
        </div>

        {/* Training */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Training & Behavior</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('training.house_trained')}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>House Trained</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('training.basic_commands')}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Basic Commands</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('training.leash_trained')}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Leash Trained</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...register('training.crate_trained')}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Crate Trained</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Training Details
              </label>
              <textarea
                {...register('training.additional_training')}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any additional training or behavioral information..."
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Photos</h2>
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