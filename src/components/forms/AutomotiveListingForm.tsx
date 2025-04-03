import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Plus, Minus, Sparkles, Loader2, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import ImageUpload from '../ImageUpload';

interface AutomotiveFormData {
  title: string;
  description: string;
  make: string;
  model: string;
  year: number;
  variant: string;
  body_type: string;
  transmission: 'automatic' | 'manual';
  fuel_type: string;
  engine: {
    size: number;
    cylinders: number;
    power: number;
    torque: number;
  };
  odometer: number;
  registration: {
    plate: string;
    expiry: string;
    state: string;
  };
  features: string[];
  history: {
    owners: number;
    accidents: boolean;
    service_history: boolean;
  };
}

const australianStates = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'SA', label: 'South Australia' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'ACT', label: 'Australian Capital Territory' },
  { value: 'NT', label: 'Northern Territory' },
  { value: 'TAS', label: 'Tasmania' },
];

export default function AutomotiveListingForm() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AutomotiveFormData>();
  const [prompt, setPrompt] = useState('');

  const handleBack = () => {
    navigate(-1);
  };

  const lookupRego = async () => {
    const plate = watch('registration.plate');
    const state = watch('registration.state');

    if (!plate || !state) {
      toast.error('Please enter registration plate and state');
      return;
    }

    if (!user) {
      toast.error('Please sign in to use this feature');
      return;
    }

    try {
      setIsLookingUp(true);

      // Try AU lookup first
      const { data: auData, error: auError } = await supabase.functions.invoke('rego-lookup-au', {
        body: { 
          rego_plate: plate, 
          state,
          user_id: user.id
        }
      });

      if (auError) {
        // If AU lookup fails, try NZ lookup
        const { data: nzData, error: nzError } = await supabase.functions.invoke('rego-lookup-nz', {
          body: { 
            rego_plate: plate,
            user_id: user.id
          }
        });

        if (nzError) throw nzError;

        if (nzData) {
          // Populate form with NZ data
          setValue('make', nzData.make);
          setValue('model', nzData.model);
          setValue('year', parseInt(nzData.year));
          setValue('fuel_type', nzData.fuel_type);
          setValue('registration.expiry', nzData.expiry_date);
          toast.success('Vehicle found in NZ database');
          return;
        }
      }

      if (auData) {
        if (auData.manual_required) {
          toast.info(auData.message);
          return;
        }

        // Populate form with AU data
        setValue('make', auData.data.make);
        setValue('model', auData.data.model);
        setValue('year', parseInt(auData.data.year));
        setValue('fuel_type', auData.data.fuel_type);
        setValue('registration.expiry', auData.data.expiry_date);
        toast.success('Vehicle found');
      }
    } catch (error) {
      console.error('Error looking up registration:', error);
      toast.error('Failed to lookup registration');
    } finally {
      setIsLookingUp(false);
    }
  };

  const generateWithAI = async () => {
    if (!prompt) {
      toast.error('Please enter a description of your vehicle');
      return;
    }

    try {
      setIsGenerating(true);
      const { data, error } = await supabase.functions.invoke('generate-automotive-listing', {
        body: { prompt }
      });

      if (error) throw error;

      // Populate form with AI-generated data
      setValue('title', data.title);
      setValue('description', data.description);
      setValue('make', data.make);
      setValue('model', data.model);
      setValue('year', data.year);
      setValue('variant', data.variant);
      setValue('body_type', data.bodyType);
      setValue('transmission', data.transmission);
      setValue('fuel_type', data.fuelType);
      setValue('features', data.features);

      toast.success('Vehicle listing generated successfully!');
    } catch (error) {
      console.error('Error generating listing:', error);
      toast.error('Failed to generate listing');
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data: AutomotiveFormData) => {
    try {
      // Create listing
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .insert({
          title: data.title,
          description: data.description,
          category: 'automotive',
          price: 0, // Set later
          status: 'active'
        })
        .select()
        .single();

      if (listingError) throw listingError;

      // Create automotive metadata
      const { error: metadataError } = await supabase
        .from('automotive_metadata')
        .insert({
          listing_id: listing.id,
          make: data.make,
          model: data.model,
          year: data.year,
          variant: data.variant,
          body_type: data.body_type,
          transmission: data.transmission,
          fuel_type: data.fuel_type,
          engine: data.engine,
          odometer: data.odometer,
          registration: data.registration,
          features: data.features,
          history: data.history
        });

      if (metadataError) throw metadataError;

      toast.success('Vehicle listing created successfully!');
      navigate(`/automotive/${listing.id}`);
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
        <h1 className="text-3xl font-bold">List a Vehicle</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* AI Generation */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Start with AI</h2>
          <div className="space-y-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your vehicle and let AI help create the listing..."
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

        {/* Registration Lookup */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Registration Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Plate
              </label>
              <input
                type="text"
                {...register('registration.plate')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter plate number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Country
              </label>
              <select
                {...register('registration.state')}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select state/country</option>
                <optgroup label="Australia">
                  {australianStates.map(state => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="New Zealand">
                  <option value="NZ">New Zealand</option>
                </optgroup>
              </select>
            </div>

            <div className="flex items-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={lookupRego}
                disabled={isLookingUp}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {isLookingUp ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                Lookup Registration
              </motion.button>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Make
              </label>
              <input
                type="text"
                {...register('make', { required: true })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Toyota"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <input
                type="text"
                {...register('model', { required: true })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Camry"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year
              </label>
              <input
                type="number"
                {...register('year', { required: true, min: 1900, max: new Date().getFullYear() + 1 })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={new Date().getFullYear().toString()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Body Type
              </label>
              <select
                {...register('body_type', { required: true })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select body type</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="hatchback">Hatchback</option>
                <option value="wagon">Wagon</option>
                <option value="coupe">Coupe</option>
                <option value="convertible">Convertible</option>
                <option value="ute">Ute</option>
                <option value="van">Van</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Vehicle Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transmission
              </label>
              <select
                {...register('transmission', { required: true })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select transmission</option>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fuel Type
              </label>
              <select
                {...register('fuel_type', { required: true })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select fuel type</option>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="hybrid">Hybrid</option>
                <option value="electric">Electric</option>
                <option value="lpg">LPG</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Odometer (km)
              </label>
              <input
                type="number"
                {...register('odometer', { required: true, min: 0 })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Engine & Performance */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Engine & Performance</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Engine Size (L)
              </label>
              <input
                type="number"
                step="0.1"
                {...register('engine.size', { required: true, min: 0 })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cylinders
              </label>
              <input
                type="number"
                {...register('engine.cylinders', { required: true, min: 0 })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Power (kW)
              </label>
              <input
                type="number"
                {...register('engine.power', { required: true, min: 0 })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Torque (Nm)
              </label>
              <input
                type="number"
                {...register('engine.torque', { required: true, min: 0 })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Vehicle History */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Vehicle History</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Owners
              </label>
              <input
                type="number"
                {...register('history.owners', { required: true, min: 1 })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accident History
              </label>
              <select
                {...register('history.accidents', { required: true })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service History
              </label>
              <select
                {...register('history.service_history', { required: true })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select</option>
                <option value="true">Full Service History</option>
                <option value="false">Partial/No History</option>
              </select>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Vehicle Images</h2>
          <ImageUpload />
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{scale: 0.98 }}
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