import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Image, Sparkles, Loader2, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface StockMediaSelectorProps {
  category: string;
  onSelect: (image: { url: string; type: 'stock' | 'ai' }) => void;
}

export default function StockMediaSelector({ category, onSelect }: StockMediaSelectorProps) {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'stock' | 'ai'>('stock');
  const [searchQuery, setSearchQuery] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [stockImages, setStockImages] = useState<any[]>([]);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const searchStockImages = async () => {
    if (!searchQuery) return;

    try {
      setIsSearching(true);
      const { data, error } = await supabase.functions.invoke('unsplash-search', {
        body: { 
          query: searchQuery,
          category,
          page: 1,
          perPage: 12
        }
      });

      if (error) throw error;
      setStockImages(data);
    } catch (error) {
      console.error('Error searching images:', error);
      toast.error('Failed to search images');
    } finally {
      setIsSearching(false);
    }
  };

  const generateImage = async () => {
    if (!prompt) {
      toast.error('Please enter a description');
      return;
    }

    if (!user?.aiService?.isActive) {
      toast.error('Please upgrade your plan to use AI features');
      return;
    }

    try {
      setIsGenerating(true);
      const { data, error } = await supabase.functions.invoke('generate-image-ai', {
        body: { prompt }
      });

      if (error) throw error;
      setGeneratedImages(data.images);
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelect = (image: { url: string; type: 'stock' | 'ai' }) => {
    onSelect(image);
    toast.success(`${image.type === 'stock' ? 'Stock' : 'AI-generated'} image selected`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex-1 px-4 py-3 text-center font-medium transition-colors ${
            activeTab === 'stock'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Image className="w-5 h-5" />
            Stock Images
          </div>
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 px-4 py-3 text-center font-medium transition-colors ${
            activeTab === 'ai'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Generator
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'stock' ? (
          <div className="space-y-4">
            {/* Search */}
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchStockImages()}
                placeholder="Search stock images..."
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={searchStockImages}
                disabled={isSearching}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSearching ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </motion.button>
            </div>

            {/* Stock Images Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {stockImages.map((image, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect({ url: image.url, type: 'stock' })}
                  className="relative aspect-square rounded-lg overflow-hidden group"
                >
                  <img
                    src={image.url}
                    alt={image.description}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-medium">Select</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* AI Generation */}
            <div className="space-y-2">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate..."
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateImage}
                disabled={isGenerating}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Generate with AI
                  </span>
                )}
              </motion.button>
            </div>

            {/* Generated Images Grid */}
            <div className="grid grid-cols-2 gap-4">
              {generatedImages.map((imageUrl, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect({ url: imageUrl, type: 'ai' })}
                  className="relative aspect-square rounded-lg overflow-hidden group"
                >
                  <img
                    src={imageUrl}
                    alt={`Generated image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-medium">Select</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}