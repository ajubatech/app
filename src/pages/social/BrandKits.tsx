import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Palette, 
  Image, 
  Type, 
  Edit2, 
  Trash2, 
  Copy, 
  Check,
  X
} from 'lucide-react';

export default function BrandKits() {
  const [brandKits, setBrandKits] = useState([
    {
      id: 1,
      name: 'Chatori Gali',
      isPrimary: true,
      logo: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
      colors: ['#FF5A5F', '#00A699', '#FC642D', '#484848', '#767676'],
      fonts: ['Montserrat', 'Open Sans']
    },
    {
      id: 2,
      name: 'ListHouze',
      isPrimary: false,
      logo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'],
      fonts: ['Poppins', 'Roboto']
    }
  ]);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBrandKit, setNewBrandKit] = useState({
    name: '',
    logo: '',
    colors: ['#000000'],
    fonts: ['Arial']
  });
  
  const handleAddColor = () => {
    setNewBrandKit({
      ...newBrandKit,
      colors: [...newBrandKit.colors, '#000000']
    });
  };
  
  const handleRemoveColor = (index: number) => {
    const updatedColors = [...newBrandKit.colors];
    updatedColors.splice(index, 1);
    setNewBrandKit({
      ...newBrandKit,
      colors: updatedColors
    });
  };
  
  const handleColorChange = (index: number, color: string) => {
    const updatedColors = [...newBrandKit.colors];
    updatedColors[index] = color;
    setNewBrandKit({
      ...newBrandKit,
      colors: updatedColors
    });
  };
  
  const handleAddFont = () => {
    setNewBrandKit({
      ...newBrandKit,
      fonts: [...newBrandKit.fonts, 'Arial']
    });
  };
  
  const handleRemoveFont = (index: number) => {
    const updatedFonts = [...newBrandKit.fonts];
    updatedFonts.splice(index, 1);
    setNewBrandKit({
      ...newBrandKit,
      fonts: updatedFonts
    });
  };
  
  const handleFontChange = (index: number, font: string) => {
    const updatedFonts = [...newBrandKit.fonts];
    updatedFonts[index] = font;
    setNewBrandKit({
      ...newBrandKit,
      fonts: updatedFonts
    });
  };
  
  const handleCreateBrandKit = () => {
    if (!newBrandKit.name) {
      alert('Please enter a name for your brand kit');
      return;
    }
    
    const newKit = {
      id: brandKits.length + 1,
      name: newBrandKit.name,
      isPrimary: brandKits.length === 0,
      logo: newBrandKit.logo || 'https://via.placeholder.com/100',
      colors: newBrandKit.colors,
      fonts: newBrandKit.fonts
    };
    
    setBrandKits([...brandKits, newKit]);
    setShowCreateForm(false);
    setNewBrandKit({
      name: '',
      logo: '',
      colors: ['#000000'],
      fonts: ['Arial']
    });
  };
  
  const handleSetPrimary = (id: number) => {
    const updatedKits = brandKits.map(kit => ({
      ...kit,
      isPrimary: kit.id === id
    }));
    
    setBrandKits(updatedKits);
  };
  
  const handleDeleteBrandKit = (id: number) => {
    if (confirm('Are you sure you want to delete this brand kit?')) {
      const updatedKits = brandKits.filter(kit => kit.id !== id);
      setBrandKits(updatedKits);
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Brand Kits</h1>
          <p className="text-gray-600">Manage your brand assets and styles</p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Brand Kit
        </button>
      </div>
      
      {/* Brand Kits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {brandKits.map((kit) => (
          <motion.div
            key={kit.id}
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={kit.logo} 
                    alt={kit.name} 
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{kit.name}</h3>
                    {kit.isPrimary && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="p-2 hover:bg-gray-100 rounded-full"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    className="p-2 hover:bg-gray-100 rounded-full"
                    title="Duplicate"
                  >
                    <Copy className="w-5 h-5 text-gray-600" />
                  </button>
                  {!kit.isPrimary && (
                    <button
                      onClick={() => handleDeleteBrandKit(kit.id)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Colors */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Brand Colors</h4>
                  <div className="flex gap-2">
                    {kit.colors.map((color, index) => (
                      <div 
                        key={index}
                        className="w-8 h-8 rounded-full border border-gray-200"
                        style={{ backgroundColor: color }}
                        title={color}
                      ></div>
                    ))}
                  </div>
                </div>
                
                {/* Fonts */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Brand Fonts</h4>
                  <div className="flex flex-wrap gap-2">
                    {kit.fonts.map((font, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {font}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {!kit.isPrimary && (
                <button
                  onClick={() => handleSetPrimary(kit.id)}
                  className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Set as Primary
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Empty State */}
      {brandKits.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Palette className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No brand kits yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first brand kit to maintain consistent branding across your content.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Brand Kit
          </button>
        </div>
      )}
      
      {/* Create Brand Kit Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Create Brand Kit</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Brand Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={newBrandKit.name}
                  onChange={(e) => setNewBrandKit({ ...newBrandKit, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter brand name"
                />
              </div>
              
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo
                </label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Drag & drop your logo here, or click to browse
                  </p>
                </div>
              </div>
              
              {/* Brand Colors */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Brand Colors
                  </label>
                  <button
                    onClick={handleAddColor}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Color
                  </button>
                </div>
                <div className="space-y-2">
                  {newBrandKit.colors.map((color, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => handleColorChange(index, e.target.value)}
                        className="w-10 h-10 rounded-md border-0 p-0"
                      />
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => handleColorChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => handleRemoveColor(index)}
                        className="p-2 hover:bg-gray-100 rounded-full"
                        disabled={newBrandKit.colors.length <= 1}
                      >
                        <Trash2 className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Brand Fonts */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Brand Fonts
                  </label>
                  <button
                    onClick={handleAddFont}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Font
                  </button>
                </div>
                <div className="space-y-2">
                  {newBrandKit.fonts.map((font, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <select
                        value={font}
                        onChange={(e) => handleFontChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Roboto">Roboto</option>
                      </select>
                      <button
                        onClick={() => handleRemoveFont(index)}
                        className="p-2 hover:bg-gray-100 rounded-full"
                        disabled={newBrandKit.fonts.length <= 1}
                      >
                        <Trash2 className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCreateBrandKit}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Create Brand Kit
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}