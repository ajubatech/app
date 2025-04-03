import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Sticker, Crown } from 'lucide-react';
import { useReelStore } from '../../store/reelStore';
import { Sticker as StickerType } from '../../types';

interface StickerSelectorProps {
  onSelect: (sticker: StickerType) => void;
  onClose: () => void;
}

export default function StickerSelector({ onSelect, onClose }: StickerSelectorProps) {
  const { stickerLibrary, loadStickerLibrary, isLoading } = useReelStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStickers, setFilteredStickers] = useState<StickerType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  useEffect(() => {
    loadStickerLibrary();
  }, []);
  
  useEffect(() => {
    // Filter stickers based on search term and category
    let filtered = [...stickerLibrary];
    
    if (searchTerm) {
      filtered = filtered.filter(sticker => 
        sticker.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(sticker => sticker.category === selectedCategory);
    }
    
    setFilteredStickers(filtered);
  }, [stickerLibrary, searchTerm, selectedCategory]);
  
  // Get unique categories
  const categories = ['All', ...Array.from(new Set(stickerLibrary.map(sticker => sticker.category)))];
  
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
          <h2 className="text-xl font-semibold">Select Sticker</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="relative mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search stickers..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        <div className="max-h-[50vh] overflow-y-auto p-4 pt-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredStickers.length === 0 ? (
            <div className="text-center py-8">
              <Sticker className="w-12 h-12 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400">No stickers found</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {filteredStickers.map((sticker) => (
                <motion.div
                  key={sticker.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative bg-gray-700 p-2 rounded-lg aspect-square flex items-center justify-center cursor-pointer"
                  onClick={() => onSelect(sticker)}
                >
                  {sticker.isPremium && (
                    <div className="absolute top-1 right-1 bg-yellow-500 rounded-full p-1">
                      <Crown className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <img 
                    src={sticker.url} 
                    alt={sticker.name} 
                    className="max-w-full max-h-full object-contain"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}