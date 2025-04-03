import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface BannerSelectorProps {
  value: {
    text: string;
    style: string;
  } | null;
  onChange: (banner: { text: string; style: string } | null) => void;
}

interface BannerTemplate {
  id: string;
  text: string;
  style: string;
  isPro?: boolean;
}

export default function BannerSelector({ value, onChange }: BannerSelectorProps) {
  const { user } = useAuthStore();
  const [customText, setCustomText] = useState(value?.text || '');
  const isPro = user?.subscription_type === 'pro' || user?.subscription_type === 'business';

  const bannerTemplates: BannerTemplate[] = [
    { id: 'none', text: 'None', style: 'none' },
    { id: 'just_listed', text: 'Just Listed', style: 'primary' },
    { id: 'new', text: 'New', style: 'success' },
    { id: 'open_home', text: 'Open Home', style: 'warning' },
    { id: 'auction', text: 'Auction', style: 'danger', isPro: true },
    { id: 'price_reduced', text: 'Price Reduced', style: 'info', isPro: true },
    { id: 'hot_property', text: 'Hot Property', style: 'primary', isPro: true },
    { id: 'exclusive', text: 'Exclusive', style: 'success', isPro: true },
    { id: 'sold', text: 'Sold', style: 'danger', isPro: true },
  ];

  const handleSelectTemplate = (template: BannerTemplate) => {
    if (template.id === 'none') {
      onChange(null);
      return;
    }
    
    if (template.isPro && !isPro) {
      // Show upgrade message
      return;
    }
    
    onChange({
      text: template.text,
      style: template.style
    });
  };

  const handleCustomTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value.slice(0, 15); // Limit to 15 chars
    setCustomText(text);
    
    if (value) {
      onChange({
        ...value,
        text
      });
    } else {
      onChange({
        text,
        style: 'primary'
      });
    }
  };

  const getBannerStyle = (style: string) => {
    switch (style) {
      case 'primary':
        return 'bg-blue-600 text-white';
      case 'success':
        return 'bg-green-600 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'danger':
        return 'bg-red-600 text-white';
      case 'info':
        return 'bg-purple-600 text-white';
      default:
        return 'bg-gray-800 text-white';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Banner Template</h3>
      
      <div className="grid grid-cols-3 gap-2">
        {bannerTemplates.map((template) => (
          <motion.button
            key={template.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelectTemplate(template)}
            className={`relative px-3 py-2 text-sm rounded-lg border ${
              value?.text === template.text && template.id !== 'none'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'
            } ${template.isPro && !isPro ? 'opacity-50' : ''}`}
            disabled={template.isPro && !isPro}
          >
            {template.id === 'none' ? (
              'No Banner'
            ) : (
              <span className={`${template.isPro && !isPro ? 'text-gray-500' : ''}`}>
                {template.text}
              </span>
            )}
            
            {template.isPro && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                <Crown className="w-3 h-3 text-white" />
              </span>
            )}
          </motion.button>
        ))}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Text (max 15 chars)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customText}
            onChange={handleCustomTextChange}
            maxLength={15}
            placeholder="Custom banner text"
            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-gray-500 self-center">{customText.length}/15</span>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Banner Style
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['primary', 'success', 'warning', 'danger', 'info'].map((style) => (
            <button
              key={style}
              onClick={() => value && onChange({ ...value, style })}
              disabled={!value}
              className={`px-3 py-2 text-sm rounded-lg ${
                value?.style === style
                  ? 'ring-2 ring-blue-500'
                  : ''
              } ${getBannerStyle(style)} ${!value ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Preview */}
      {value && (
        <div className="mt-4">
          <h3 className="font-medium mb-2">Preview</h3>
          <div className="relative h-16 bg-gray-200 rounded-lg overflow-hidden">
            <div className={`absolute top-3 left-0 ${getBannerStyle(value.style)} px-4 py-1 text-sm font-medium`}>
              {value.text}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}