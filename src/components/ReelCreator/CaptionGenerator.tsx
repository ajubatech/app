import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Loader2, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface CaptionGeneratorProps {
  listing: any;
  onSelect: (caption: string, hashtags: string[]) => void;
  onClose: () => void;
}

export default function CaptionGenerator({ listing, onSelect, onClose }: CaptionGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOptions, setGeneratedOptions] = useState<{
    caption: string;
    hashtags: string[];
  }[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  const generateCaptions = async () => {
    if (!listing) {
      toast.error('Listing information is required');
      return;
    }
    
    try {
      setIsGenerating(true);
      
      // In a real implementation, this would call an AI service
      // For now, we'll generate mock captions
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockCaptions = [
        {
          caption: `✨ Just listed! Check out this amazing ${listing.title} on ListHouze! Perfect for anyone looking for quality and style.`,
          hashtags: ['#JustListed', '#ListHouze', `#${listing.category}`, '#NewListing', '#MustSee']
        },
        {
          caption: `Don't miss this incredible opportunity! This ${listing.title} is now available on ListHouze. Contact me for more details!`,
          hashtags: ['#ListHouze', `#${listing.category}`, '#DreamProperty', '#PerfectMatch', '#ContactMe']
        },
        {
          caption: `Excited to share this ${listing.title} with you all! Swipe to see all the amazing features and details. Available now on ListHouze!`,
          hashtags: ['#Excited', '#ListHouze', `#${listing.category}`, '#SwipeRight', '#Available']
        }
      ];
      
      setGeneratedOptions(mockCaptions);
    } catch (error) {
      console.error('Error generating captions:', error);
      toast.error('Failed to generate captions');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSelect = () => {
    if (selectedOption === null) return;
    
    const option = generatedOptions[selectedOption];
    onSelect(option.caption, option.hashtags);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-gray-800 rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold">AI Caption Generator</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {generatedOptions.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <p className="text-gray-300 mb-6">
                Generate engaging captions and hashtags for your reel based on your listing.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={generateCaptions}
                disabled={isGenerating}
                className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Captions
                  </>
                )}
              </motion.button>
            </div>
          ) : (
            <>
              <p className="text-gray-300 mb-4">
                Select a caption option:
              </p>
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                {generatedOptions.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedOption(index)}
                    className={`p-4 rounded-lg cursor-pointer ${
                      selectedOption === index
                        ? 'bg-blue-900/50 border border-blue-500'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <p className="mb-3">{option.caption}</p>
                    <div className="flex flex-wrap gap-2">
                      {option.hashtags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-blue-600/30 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSelect}
                  disabled={selectedOption === null}
                  className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Use Selected
                </motion.button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}