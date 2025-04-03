import React, { useState, Suspense, lazy } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Image, Palette, BarChart2, Link as LinkIcon, Settings, Plus, ChevronRight, Loader2, Instagram, Facebook, Twitter as TwitterIcon, Linkedin, BookText as TikTok, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import SocialSidebar from '../../components/social/SocialSidebar';

// Lazy load components for better performance
const TemplatesPage = lazy(() => import('./Templates'));
const BrandKitsPage = lazy(() => import('./BrandKits'));
const CalendarPage = lazy(() => import('./Calendar'));
const AnalyticsPage = lazy(() => import('./Analytics'));
const IntegrationsPage = lazy(() => import('./Integrations'));
const SettingsPage = lazy(() => import('./Settings'));
const MembershipCard = lazy(() => import('../../components/social/MembershipCard'));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
  </div>
);

export default function SocialDashboard() {
  const navigate = useNavigate();
  const { user, userRole } = useAuthStore();
  const [showMembershipCard, setShowMembershipCard] = useState(false);
  
  // Only allow business users or upgraded listers to access this dashboard
  if (userRole !== 'business' && userRole !== 'lister') {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
          <p className="text-gray-600 mb-6">
            The social media dashboard is only available for Business users or upgraded Listers.
          </p>
          <button
            onClick={() => navigate('/pro-plus')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <SocialSidebar />
      
      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<SocialDashboardHome setShowMembershipCard={setShowMembershipCard} />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/brand-kits" element={<BrandKitsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Suspense>
      </div>
      
      {/* Membership Card Modal */}
      {showMembershipCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Suspense fallback={<LoadingFallback />}>
            <MembershipCard onClose={() => setShowMembershipCard(false)} />
          </Suspense>
        </div>
      )}
    </div>
  );
}

function SocialDashboardHome({ setShowMembershipCard }: { setShowMembershipCard: (show: boolean) => void }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const quickLinks = [
    { 
      title: 'Templates', 
      icon: <Image className="w-6 h-6 text-blue-600" />, 
      description: 'Create content from pre-designed templates',
      path: '/social/templates',
      color: 'bg-blue-50'
    },
    { 
      title: 'Brand Kits', 
      icon: <Palette className="w-6 h-6 text-purple-600" />, 
      description: 'Manage your brand assets and styles',
      path: '/social/brand-kits',
      color: 'bg-purple-50'
    },
    { 
      title: 'Calendar', 
      icon: <Calendar className="w-6 h-6 text-green-600" />, 
      description: 'Schedule and manage your content',
      path: '/social/calendar',
      color: 'bg-green-50'
    },
    { 
      title: 'Analytics', 
      icon: <BarChart2 className="w-6 h-6 text-orange-600" />, 
      description: 'Track performance and engagement',
      path: '/social/analytics',
      color: 'bg-orange-50'
    }
  ];
  
  const connectedAccounts = [
    { name: 'Instagram', icon: <Instagram className="w-5 h-5 text-pink-600" />, handle: '@chatorigali' },
    { name: 'Facebook', icon: <Facebook className="w-5 h-5 text-blue-600" />, handle: 'Chatori Gali' },
    { name: 'TikTok', icon: <TikTok className="w-5 h-5" />, handle: '@chatorigali' },
    { name: 'LinkedIn', icon: <Linkedin className="w-5 h-5 text-blue-700" />, handle: 'Chatori Gali' }
  ];
  
  const recentPosts = [
    {
      id: 1,
      title: 'Unlimited Buffet Weekends',
      platform: 'Instagram',
      date: '2 days ago',
      engagement: '42 likes',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 2,
      title: 'New Butter Chicken Recipe',
      platform: 'Facebook',
      date: '5 days ago',
      engagement: '28 likes',
      image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'
    }
  ];
  
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Social Media Dashboard</h1>
          <p className="text-gray-600">Manage your content and social media presence</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowMembershipCard(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700"
          >
            View Membership
          </button>
          
          <button
            onClick={() => navigate('/social/calendar')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Post
          </button>
        </div>
      </div>
      
      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickLinks.map((link) => (
          <motion.div
            key={link.title}
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className={`${link.color} p-4`}>
              {link.icon}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{link.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{link.description}</p>
              <button
                onClick={() => navigate(link.path)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
              >
                Get Started
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Connected Accounts & Recent Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connected Accounts */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Connected Accounts</h2>
          <div className="space-y-4">
            {connectedAccounts.map((account) => (
              <div key={account.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {account.icon}
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-sm text-gray-600">{account.handle}</p>
                  </div>
                </div>
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              </div>
            ))}
          </div>
          
          <button
            onClick={() => navigate('/social/integrations')}
            className="mt-6 w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            Manage Connections
          </button>
        </div>
        
        {/* Recent Posts */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Posts</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search posts..."
                className="pl-8 pr-4 py-1 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
            </div>
          </div>
          
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div key={post.id} className="flex gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{post.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{post.platform}</span>
                    <span>•</span>
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.engagement}</span>
                  </div>
                </div>
                <button className="self-center p-2 hover:bg-gray-200 rounded-full">
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            ))}
          </div>
          
          <button
            onClick={() => navigate('/social/analytics')}
            className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
          >
            View All Posts
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}