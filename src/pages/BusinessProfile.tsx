import React from 'react';
import { Upload, Link as LinkIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BusinessProfile() {
  const [activeTab, setActiveTab] = React.useState('business-details');

  return (
    <div className="p-6">
      {/* Warning Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="text-yellow-800 font-medium mb-1">Not a business account</h3>
        <p className="text-yellow-700">Your account is not registered as a business. Some features may be limited.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Business Information */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-xl font-bold mb-6">Business Information</h2>
          
          <div className="mb-8">
            <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">Upload Business Logo</p>
              <p className="text-xs text-gray-500">Drag 'n' drop an image or click to select</p>
            </div>
            <button className="w-full mt-4 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">
              Select File
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name
              </label>
              <input
                type="text"
                placeholder="Enter business name"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Email
              </label>
              <input
                type="email"
                placeholder="Enter business email"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Phone
              </label>
              <input
                type="tel"
                placeholder="Enter business phone"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Address
              </label>
              <input
                type="text"
                placeholder="Enter business address"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl border p-6 mb-6">
            <h2 className="text-xl font-bold mb-6">Public Profile Settings</h2>
            <p className="text-gray-600 mb-6">Control which elements appear on your public business profile page.</p>

            <div className="space-y-6">
              {profileSettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{setting.name}</p>
                    <p className="text-sm text-gray-600">{setting.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 mt-6"
            >
              Save Profile Settings
            </motion.button>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-xl font-bold mb-6">Public Profile URL</h2>
            <p className="text-gray-600 mb-4">Your public business profile is available at:</p>
            
            <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
              <LinkIcon className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value="https://kauriflats.co.nz/profile/admin-user"
                readOnly
                className="flex-1 bg-transparent border-none focus:ring-0 text-gray-600"
              />
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              This URL is automatically generated based on your business name.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const tabs = [
  { id: 'business-details', name: 'Business Details' },
  { id: 'social-links', name: 'Social Links' },
  { id: 'page-settings', name: 'Page Settings' },
  { id: 'documents', name: 'Documents' }
];

const profileSettings = [
  {
    id: 'description',
    name: 'Business Description',
    description: 'Show your business description and about text'
  },
  {
    id: 'address',
    name: 'Business Address',
    description: 'Display your business address publicly'
  },
  {
    id: 'social',
    name: 'Social Media Links',
    description: 'Show links to your social media profiles'
  },
  {
    id: 'services',
    name: 'Services Offered',
    description: 'Display your services on your profile'
  },
  {
    id: 'reels',
    name: 'Reels & Videos',
    description: 'Show your reels on your public profile'
  },
  {
    id: 'contact',
    name: 'Contact Information',
    description: 'Display your contact details (email, phone)'
  }
];