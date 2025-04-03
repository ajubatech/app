import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Instagram, Facebook, Twitter as TwitterIcon, Linkedin, BookText as TikTok, Sparkles, Image, Video, FileText, ChevronRight } from 'lucide-react';

export default function Templates() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  
  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'reels', name: 'Reels & Stories' },
    { id: 'posts', name: 'Posts' },
    { id: 'carousels', name: 'Carousels' },
    { id: 'blogs', name: 'Blog Posts' }
  ];
  
  const platforms = [
    { id: 'all', name: 'All Platforms', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'instagram', name: 'Instagram', icon: <Instagram className="w-4 h-4" /> },
    { id: 'facebook', name: 'Facebook', icon: <Facebook className="w-4 h-4" /> },
    { id: 'twitter', name: 'Twitter', icon: <TwitterIcon className="w-4 h-4" /> },
    { id: 'linkedin', name: 'LinkedIn', icon: <Linkedin className="w-4 h-4" /> },
    { id: 'tiktok', name: 'TikTok', icon: <TikTok className="w-4 h-4" /> }
  ];
  
  // Mock templates data
  const templates = [
    {
      id: 1,
      title: 'Property Showcase',
      category: 'reels',
      platform: 'instagram',
      thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80',
      isPremium: false,
      type: 'video'
    },
    {
      id: 2,
      title: 'Luxury Home Tour',
      category: 'reels',
      platform: 'instagram',
      thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80',
      isPremium: true,
      type: 'video'
    },
    {
      id: 3,
      title: 'Product Highlight',
      category: 'posts',
      platform: 'facebook',
      thumbnail: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80',
      isPremium: false,
      type: 'image'
    },
    {
      id: 4,
      title: 'Service Promotion',
      category: 'posts',
      platform: 'linkedin',
      thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80',
      isPremium: false,
      type: 'image'
    },
    {
      id: 5,
      title: 'Property Features',
      category: 'carousels',
      platform: 'instagram',
      thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80',
      isPremium: true,
      type: 'image'
    },
    {
      id: 6,
      title: 'Market Update',
      category: 'blogs',
      platform: 'linkedin',
      thumbnail: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80',
      isPremium: false,
      type: 'blog'
    }
  ];
  
  // Filter templates based on search, category, and platform
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesPlatform = selectedPlatform === 'all' || template.platform === selectedPlatform;
    
    return matchesSearch && matchesCategory && matchesPlatform;
  });
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'blog':
        return <FileText className="w-4 h-4" />;
      default:
        return <Image className="w-4 h-4" />;
    }
  };
  
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-4 h-4" />;
      case 'facebook':
        return <Facebook className="w-4 h-4" />;
      case 'twitter':
        return <TwitterIcon className="w-4 h-4" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />;
      case 'tiktok':
        return <TikTok className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-gray-600">Create content from pre-designed templates</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search templates..."
              className="pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
          </div>
          
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Custom
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Category Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* Platform Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform
            </label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => setSelectedPlatform(platform.id)}
                  className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                    selectedPlatform === platform.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {platform.icon}
                  <span>{platform.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <motion.div
            key={template.id}
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="relative">
              <img 
                src={template.thumbnail} 
                alt={template.title} 
                className="w-full h-48 object-cover"
              />
              {template.isPremium && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                  PRO
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                {getTypeIcon(template.type)}
                <span className="capitalize">{template.type}</span>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                {getPlatformIcon(template.platform)}
                <span className="capitalize">{template.platform}</span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{template.title}</h3>
              <button
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
              >
                Use Template
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No templates found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your filters or search for something else.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedPlatform('all');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}