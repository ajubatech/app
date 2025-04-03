import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Sliders, Check, Crown } from 'lucide-react';
import { useReelStore } from '../../store/reelStore';
import { Filter } from '../../types';
import { Slider } from '../ui/slider';

interface FilterSelectorProps {
  onSelect: (filter: any) => void;
  onClose: () => void;
}

export default function FilterSelector({ onSelect, onClose }: FilterSelectorProps) {
  const { filters, loadFilters, isLoading } = useReelStore();
  const [selectedFilter, setSelectedFilter] = useState<Filter | null>(null);
  const [strength, setStrength] = useState(0.5);
  
  useEffect(() => {
    loadFilters();
  }, []);
  
  const handleSelect = () => {
    if (!selectedFilter) return;
    
    onSelect({
      ...selectedFilter,
      strength
    });
  };
  
  // Mock filter colors for preview
  const filterColors: Record<string, string> = {
    'Normal': 'transparent',
    'Bright': 'rgba(255, 255, 255, 0.2)',
    'Warm': 'rgba(255, 200, 150, 0.3)',
    'Cool': 'rgba(150, 200, 255, 0.3)',
    'Luxury': 'rgba(255, 215, 0, 0.2)'
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
          <h2 className="text-xl font-semibold">Select Filter</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter)}
                  className={`relative rounded-lg overflow-hidden aspect-square ${
                    selectedFilter?.id === filter.id
                      ? 'ring-2 ring-blue-500'
                      : ''
                  }`}
                >
                  {filter.isPremium && (
                    <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-1 z-10">
                      <Crown className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img 
                      src={filter.preview} 
                      alt={filter.name} 
                      className="w-full h-full object-cover"
                    />
                    <div 
                      className="absolute inset-0"
                      style={{
                        backgroundColor: filterColors[filter.name] || 'transparent',
                        mixBlendMode: 'overlay'
                      }}
                    ></div>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-black/50 p-2 text-center">
                    <span className="text-sm">{filter.name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {selectedFilter && (
            <div className="space-y-2 pt-4">
              <div className="flex items-center justify-between">
                <span>Filter Strength</span>
                <span>{Math.round(strength * 100)}%</span>
              </div>
              <Slider
                value={[strength * 100]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => setStrength(value[0] / 100)}
              />
            </div>
          )}
          
          <div className="pt-4 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSelect}
              disabled={!selectedFilter}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              Apply Filter
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}