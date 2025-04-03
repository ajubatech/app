import React, { useState } from 'react';
import { BarChart2, TrendingUp, Users, Eye, Heart, MessageCircle, Share2, Calendar, Download, ChevronDown, Instagram, Facebook, Twitter as TwitterIcon, Linkedin, BookText as TikTok } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState('7days');
  const [platform, setPlatform] = useState('all');
  
  // Mock analytics data
  const analyticsData = {
    summary: {
      impressions: 1007,
      impressionsChange: '+646%',
      engagement: 124,
      engagementChange: '+32%',
      followers: 342,
      followersChange: '+5%',
      reach: 876,
      reachChange: '+128%'
    },
    topPosts: [
      {
        id: 1,
        title: 'New Property Listing',
        platform: 'instagram',
        date: '2 days ago',
        impressions: 432,
        engagement: 56,
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80'
      },
      {
        id: 2,
        title: 'Weekend Open House',
        platform: 'facebook',
        date: '5 days ago',
        impressions: 287,
        engagement: 34,
        image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80'
      },
      {
        id: 3,
        title: 'Property Tour Video',
        platform: 'instagram',
        date: '1 week ago',
        impressions: 198,
        engagement: 22,
        image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80'
      }
    ],
    platformBreakdown: [
      { platform: 'instagram', followers: 156, engagement: 48 },
      { platform: 'facebook', followers: 124, engagement: 32 },
      { platform: 'twitter', followers: 42, engagement: 18 },
      { platform: 'linkedin', followers: 20, engagement: 26 }
    ]
  };
  
  const getPlatformIcon = (platform: string, size = 5) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className={`w-${size} h-${size}`} />;
      case 'facebook':
        return <Facebook className={`w-${size} h-${size}`} />;
      case 'twitter':
        return <TwitterIcon className={`w-${size} h-${size}`} />;
      case 'linkedin':
        return <Linkedin className={`w-${size} h-${size}`} />;
      case 'tiktok':
        return <TikTok className={`w-${size} h-${size}`} />;
      default:
        return null;
    }
  };
  
  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return 'text-pink-600';
      case 'facebook':
        return 'text-blue-600';
      case 'twitter':
        return 'text-blue-400';
      case 'linkedin':
        return 'text-blue-700';
      case 'tiktok':
        return 'text-gray-800';
      default:
        return 'text-gray-600';
    }
  };
  
  const getPlatformBgColor = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return 'bg-pink-100';
      case 'facebook':
        return 'bg-blue-100';
      case 'twitter':
        return 'bg-blue-100';
      case 'linkedin':
        return 'bg-blue-100';
      case 'tiktok':
        return 'bg-gray-100';
      default:
        return 'bg-gray-100';
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-gray-600">Track your social media performance</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="pl-4 pr-10 py-2 border rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="year">This Year</option>
            </select>
            <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          
          <div className="relative">
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="pl-4 pr-10 py-2 border rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Platforms</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="twitter">Twitter</option>
              <option value="linkedin">LinkedIn</option>
              <option value="tiktok">TikTok</option>
            </select>
            <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          
          <button
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <span className={`text-sm font-medium ${
              analyticsData.summary.impressionsChange.startsWith('+') 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {analyticsData.summary.impressionsChange}
            </span>
          </div>
          <h3 className="text-2xl font-bold">{analyticsData.summary.impressions.toLocaleString()}</h3>
          <p className="text-gray-600">Impressions</p>
        </motion.div>
        
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className={`text-sm font-medium ${
              analyticsData.summary.engagementChange.startsWith('+') 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {analyticsData.summary.engagementChange}
            </span>
          </div>
          <h3 className="text-2xl font-bold">{analyticsData.summary.engagement.toLocaleString()}</h3>
          <p className="text-gray-600">Engagement</p>
        </motion.div>
        
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <span className={`text-sm font-medium ${
              analyticsData.summary.followersChange.startsWith('+') 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {analyticsData.summary.followersChange}
            </span>
          </div>
          <h3 className="text-2xl font-bold">{analyticsData.summary.followers.toLocaleString()}</h3>
          <p className="text-gray-600">Followers</p>
        </motion.div>
        
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <BarChart2 className="w-6 h-6 text-orange-600" />
            </div>
            <span className={`text-sm font-medium ${
              analyticsData.summary.reachChange.startsWith('+') 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {analyticsData.summary.reachChange}
            </span>
          </div>
          <h3 className="text-2xl font-bold">{analyticsData.summary.reach.toLocaleString()}</h3>
          <p className="text-gray-600">Reach</p>
        </motion.div>
      </div>
      
      {/* Performance Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Performance Over Time</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Impressions</button>
            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Engagement</button>
            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Followers</button>
          </div>
        </div>
        
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Performance chart will be displayed here</p>
        </div>
      </div>
      
      {/* Top Performing Posts & Platform Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Performing Posts */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Top Performing Posts</h2>
          
          <div className="space-y-4">
            {analyticsData.topPosts.map((post) => (
              <div key={post.id} className="flex gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{post.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      {getPlatformIcon(post.platform, 4)}
                      <span className="capitalize">{post.platform}</span>
                    </span>
                    <span>•</span>
                    <span>{post.date}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Eye className="w-4 h-4" />
                    <span>{post.impressions}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Heart className="w-4 h-4" />
                    <span>{post.engagement}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Platform Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Platform Breakdown</h2>
          
          <div className="space-y-4">
            {analyticsData.platformBreakdown.map((platform) => (
              <div key={platform.platform} className="p-3 rounded-lg border">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 ${getPlatformBgColor(platform.platform)} rounded-full flex items-center justify-center`}>
                    {getPlatformIcon(platform.platform)}
                  </div>
                  <div>
                    <p className={`font-medium capitalize ${getPlatformColor(platform.platform)}`}>
                      {platform.platform}
                    </p>
                    <p className="text-sm text-gray-600">
                      {platform.followers} followers
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-gray-600">Engagement</p>
                    <p className="font-medium">{platform.engagement}%</p>
                  </div>
                  <div>
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${platform.engagement}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Engagement Breakdown */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-6">Engagement Breakdown</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-2xl font-bold">842</p>
            <p className="text-sm text-gray-600">Likes</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <MessageCircle className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">124</p>
            <p className="text-sm text-gray-600">Comments</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Share2 className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold">56</p>
            <p className="text-sm text-gray-600">Shares</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold">28</p>
            <p className="text-sm text-gray-600">New Followers</p>
          </div>
        </div>
      </div>
    </div>
  );
}