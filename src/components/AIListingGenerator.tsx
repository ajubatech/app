import React, { useState } from 'react';
import { Sparkles, Loader2, Camera, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { aiService } from '../services/ai';
import { useAuthStore } from '../store/authStore';
import { useCredits } from '../hooks/useCredits';
import { useStripeBilling } from '../hooks/useStripeBilling';
import CreditWarningModal from './CreditWarningModal';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface AIListingGeneratorProps {
  onGenerated: (data: any) => void;
}

export default function AIListingGenerator({ onGenerated }: AIListingGeneratorProps) {
  const { user } = useAuthStore();
  const { useAICredit, checkAICredits } = useCredits();
  const { checkoutWithStripe } = useStripeBilling();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'property' | 'vehicle'>('property');
  const [showCreditWarning, setShowCreditWarning] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    const hasCredits = await checkAICredits();
    if (!hasCredits) {
      setShowCreditWarning(true);
      return;
    }

    if (!agreeToTerms) {
      toast.error('Please agree to the terms and policies');
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setIsGenerating(true);
      const formData = new FormData();
      formData.append('image', file);

      // Use AI credit
      const creditUsed = await useAICredit();
      if (!creditUsed) {
        setShowCreditWarning(true);
        return;
      }

      // Upload image and get URL
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('temp-images')
        .upload(`ai-analysis/${Date.now()}-${file.name}`, file);

      if (uploadError) throw uploadError;

      const imageUrl = supabase.storage
        .from('temp-images')
        .getPublicUrl(uploadData.path).data.publicUrl;

      const result = await aiService.analyzeImage(imageUrl, user);
      if (result) {
        onGenerated(result);
        toast.success('Image analyzed successfully!');
      }
    } catch (error) {
      toast.error('Error analyzing image');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1
  });

  const handleGenerate = async () => {
    if (!prompt) return;
    
    // Check if user has AI credits
    const hasCredits = await checkAICredits();
    if (!hasCredits) {
      setShowCreditWarning(true);
      return;
    }

    if (!agreeToTerms) {
      toast.error('Please agree to the terms and policies');
      return;
    }
    
    try {
      setIsGenerating(true);
      
      // Use AI credit
      const creditUsed = await useAICredit();
      if (!creditUsed) {
        setShowCreditWarning(true);
        return;
      }
      
      const result = await aiService.generateListing(prompt, user);
      if (result) {
        onGenerated(result);
        toast.success('Listing generated successfully!');
      }
    } catch (error) {
      toast.error('Error generating listing');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLookup = async () => {
    if (!searchTerm) return;
    if (!user?.subscription?.features[searchType === 'property' ? 'propertyLookup' : 'carLookup']) {
      toast.error('Please upgrade your plan to use this feature');
      return;
    }

    if (!agreeToTerms) {
      toast.error('Please agree to the terms and policies');
      return;
    }

    try {
      setIsGenerating(true);
      const result = searchType === 'property'
        ? await aiService.lookupProperty(searchTerm)
        : await aiService.lookupVehicle(searchTerm);

      if (result) {
        onGenerated(result);
        toast.success(`${searchType === 'property' ? 'Property' : 'Vehicle'} details found!`);
      }
    } catch (error) {
      toast.error(`Error looking up ${searchType}`);
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBuyCredits = async () => {
    await checkoutWithStripe('ai_credits_10');
  };

  return (
    <div className="space-y-6">
      {/* AI Credits Info */}
      {user?.aiService && (
        <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 font-medium">
              AI Credits Remaining: {user.aiService.remainingCredits}/{user.aiService.usageLimit}
            </p>
            {user.aiService.remainingCredits === 0 && (
              <p className="text-xs text-blue-500 mt-1">
                <button 
                  onClick={handleBuyCredits}
                  className="text-blue-600 hover:underline"
                >
                  Buy more credits
                </button> or upgrade your plan
              </p>
            )}
          </div>
          {user.subscription && (
            <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              {user.subscription.type} Plan
            </span>
          )}
        </div>
      )}

      {/* AI Text Generation */}
      <div className="space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you're selling and our AI will create a professional listing..."
          className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerate}
          disabled={isGenerating || !prompt}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          Generate with AI
        </motion.button>
      </div>

      {/* Image Analysis */}
      <div
        {...getRootProps()}
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
      >
        <input {...getInputProps()} />
        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-3" />
        <p className="text-sm text-gray-600">
          Drop an image here or click to upload for AI analysis
        </p>
      </div>

      {/* Property/Vehicle Lookup */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as 'property' | 'vehicle')}
            className="px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="property">Property</option>
            <option value="vehicle">Vehicle</option>
          </select>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchType === 'property' ? 'Enter property address...' : 'Enter registration number...'}
            className="flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLookup}
          disabled={isGenerating || !searchTerm}
          className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-200 disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
          Lookup {searchType === 'property' ? 'Property' : 'Vehicle'}
        </motion.button>
      </div>

      {/* Terms Agreement */}
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id="agreeToTerms"
          checked={agreeToTerms}
          onChange={(e) => setAgreeToTerms(e.target.checked)}
          className="mt-1 rounded text-blue-600"
        />
        <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
          I agree to the <Link to="/legal/terms" className="text-blue-600 hover:underline" target="_blank">Terms</Link>, <Link to="/legal/privacy" className="text-blue-600 hover:underline" target="_blank">Privacy Policy</Link>, and <Link to="/legal/acceptable-use" className="text-blue-600 hover:underline" target="_blank">Acceptable Use Policy</Link>. I understand AI-generated content may require review.
        </label>
      </div>

      {/* Credit Warning Modal */}
      <CreditWarningModal
        isOpen={showCreditWarning}
        onClose={() => setShowCreditWarning(false)}
        type="ai"
      />
    </div>
  );
}