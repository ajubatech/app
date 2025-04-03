import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface FiltersProps {
  filters: {
    saleType: string;
    propertyType: string[];
    priceRange: [number, number];
    beds: number | null;
    baths: number | null;
    keywords: string[];
    minLandSize: number | null;
    minFloorArea: number | null;
  };
  onChange: (filters: any) => void;
  onClear: () => void;
}

export default function ListingFilters({ filters, onChange, onClear }: FiltersProps) {
  const [keyword, setKeyword] = useState('');

  const handleSaleTypeChange = (type: string) => {
    onChange({ saleType: type });
  };

  const handlePropertyTypeChange = (type: string) => {
    const currentTypes = [...filters.propertyType];
    if (currentTypes.includes(type)) {
      onChange({ propertyType: currentTypes.filter(t => t !== type) });
    } else {
      onChange({ propertyType: [...currentTypes, type] });
    }
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    onChange({ priceRange: [min, max] });
  };

  const handleBedsChange = (beds: number | null) => {
    onChange({ beds });
  };

  const handleBathsChange = (baths: number | null) => {
    onChange({ baths });
  };

  const handleAddKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && keyword.trim()) {
      e.preventDefault();
      const newKeywords = [...filters.keywords, keyword.trim()];
      onChange({ keywords: newKeywords });
      setKeyword('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    const newKeywords = filters.keywords.filter(k => k !== keywordToRemove);
    onChange({ keywords: newKeywords });
  };

  return (
    <div className="space-y-6">
      {/* Sale Type */}
      <div>
        <h3 className="font-medium mb-3">Sale Type</h3>
        <div className="grid grid-cols-3 gap-2">
          {['for_sale', 'for_rent', 'sold'].map((type) => (
            <button
              key={type}
              onClick={() => handleSaleTypeChange(type)}
              className={`px-3 py-2 text-sm rounded-lg border ${
                filters.saleType === type
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              {type === 'for_sale' ? 'For Sale' : type === 'for_rent' ? 'For Rent' : 'Sold'}
            </button>
          ))}
        </div>
      </div>

      {/* Property Type */}
      <div>
        <h3 className="font-medium mb-3">Property Type</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'house', label: 'House' },
            { id: 'apartment', label: 'Apartment' },
            { id: 'townhouse', label: 'Townhouse' },
            { id: 'land', label: 'Land' }
          ].map((type) => (
            <label
              key={type.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${
                filters.propertyType.includes(type.id)
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={filters.propertyType.includes(type.id)}
                onChange={() => handlePropertyTypeChange(type.id)}
                className="sr-only"
              />
              <span className="text-sm">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-medium mb-3">Price Range</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Min</label>
            <select
              value={filters.priceRange[0]}
              onChange={(e) => handlePriceRangeChange(Number(e.target.value), filters.priceRange[1])}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value={0}>No Min</option>
              <option value={100000}>$100,000</option>
              <option value={200000}>$200,000</option>
              <option value={300000}>$300,000</option>
              <option value={400000}>$400,000</option>
              <option value={500000}>$500,000</option>
              <option value={750000}>$750,000</option>
              <option value={1000000}>$1,000,000</option>
              <option value={1500000}>$1,500,000</option>
              <option value={2000000}>$2,000,000</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Max</label>
            <select
              value={filters.priceRange[1]}
              onChange={(e) => handlePriceRangeChange(filters.priceRange[0], Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value={10000000}>No Max</option>
              <option value={200000}>$200,000</option>
              <option value={300000}>$300,000</option>
              <option value={400000}>$400,000</option>
              <option value={500000}>$500,000</option>
              <option value={750000}>$750,000</option>
              <option value={1000000}>$1,000,000</option>
              <option value={1500000}>$1,500,000</option>
              <option value={2000000}>$2,000,000</option>
              <option value={3000000}>$3,000,000</option>
              <option value={5000000}>$5,000,000</option>
            </select>
          </div>
        </div>
      </div>

      {/* Beds & Baths */}
      <div>
        <h3 className="font-medium mb-3">Bedrooms & Bathrooms</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Beds</label>
            <select
              value={filters.beds || ''}
              onChange={(e) => handleBedsChange(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Baths</label>
            <select
              value={filters.baths || ''}
              onChange={(e) => handleBathsChange(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>
        </div>
      </div>

      {/* Land & Floor Area */}
      <div>
        <h3 className="font-medium mb-3">Property Size</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Land Size (m²)</label>
            <input
              type="number"
              value={filters.minLandSize || ''}
              onChange={(e) => onChange({ minLandSize: e.target.value ? Number(e.target.value) : null })}
              placeholder="Min size"
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Floor Area (m²)</label>
            <input
              type="number"
              value={filters.minFloorArea || ''}
              onChange={(e) => onChange({ minFloorArea: e.target.value ? Number(e.target.value) : null })}
              placeholder="Min size"
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div>
        <h3 className="font-medium mb-3">Keywords</h3>
        <div>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleAddKeyword}
            placeholder="Type and press Enter"
            className="w-full px-3 py-2 border rounded-lg text-sm mb-2"
          />
          
          <div className="flex flex-wrap gap-2">
            {filters.keywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
              >
                {kw}
                <button
                  onClick={() => handleRemoveKeyword(kw)}
                  className="hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      <div className="pt-4 border-t">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClear}
          className="w-full py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
        >
          Clear All Filters
        </motion.button>
      </div>
    </div>
  );
}