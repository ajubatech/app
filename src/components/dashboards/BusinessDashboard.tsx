import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart2, Users, Building2, DollarSign, 
  ArrowUp, ArrowDown, Calendar, Filter, 
  ListPlus, Eye, Heart, MessageSquare, Plus,
  Settings, CreditCard, Briefcase, Sparkles,
  FileText, Layers, Zap, Globe, Wrench, Film,
  Check, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import CreditUsageWidget from '../CreditUsageWidget';
import toast from 'react-hot-toast';

export default function BusinessDashboard() {
  const { user } = useAuthStore();
  const [listings, setListings] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [reels, setReels] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'listings' | 'reels' | 'orders'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalInquiries: 0,
    totalSaved: 0,
    revenue: 0,
    teamSize: 0
  });
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    if (user) {
      loadBusinessData();
    }
  }, [user, timeframe]);

  const loadBusinessData = async () => {
    try {
      setIsLoading(true);
      
      // Load listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('listings')
        .select(`
          *,
          media (
            id,
            url,
            type,
            tag
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
        
      if (listingsError) throw listingsError;
      setListings(listingsData || []);
      
      // Load team members
      const { data: teamData, error: teamError } = await supabase
        .from('team_members')
        .select(`
          *,
          users (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('business_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (teamError && teamError.code !== 'PGRST116') {
        console.log('Team members table may not exist yet');
      } else {
        setTeamMembers(teamData || []);
      }
      
      // Load reels
      const { data: reelsData, error: reelsError } = await supabase
        .from('media')
        .select(`
          *,
          listings (
            id,
            title,
            price
          )
        `)
        .eq('type', 'video')
        .in('listing_id', listingsData?.map(l => l.id) || [])
        .order('created_at', { ascending: false });
        
      if (reelsError) throw reelsError;
      setReels(reelsData || []);
      
      // Load inquiries
      const { data: inquiryData, error: inquiryError } = await supabase
        .from('messages')
        .select(`
          *,
          listings (
            id,
            title
          ),
          users (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('receiver_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (inquiryError && inquiryError.code !== 'PGRST116') {
        throw inquiryError;
      }
      setInquiries(inquiryData || []);
      
      // Load orders/bookings
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          users (
            id,
            full_name,
            email
          ),
          listings (
            id,
            title,
            price
          )
        `)
        .eq('business_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (ordersError && ordersError.code !== 'PGRST116') {
        console.log('Orders table may not exist yet');
      } else {
        setOrders(ordersData || []);
      }
      
      // Calculate stats
      const totalViews = listingsData?.reduce((sum, listing) => sum + (listing.views || 0), 0) || 0;
      const totalLikes = listingsData?.reduce((sum, listing) => sum + (listing.likes || 0), 0) || 0;
      
      setStats({
        totalViews,
        totalInquiries: inquiryData?.length || 0,
        totalSaved: totalLikes,
        revenue: calculateRevenue(ordersData || []),
        teamSize: teamData?.length || 0
      });
      
    } catch (error) {
      console.error('Error loading business data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRevenue = (orders: any[]) => {
    // Calculate revenue from orders
    return orders.reduce((total, order) => {
      if (order.status === 'completed' || order.status === 'paid') {
        return total + (order.total_amount || 0);
      }
      return total;
    }, 0);
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <StatCard 
          icon={<Eye className="w-5 h-5 text-blue-600" />}
          title="Total Views"
          value={stats.totalViews}
          trend={"+12%"}
          trendUp={true}
        />
        <StatCard 
          icon={<MessageSquare className="w-5 h-5 text-green-600" />}
          title="Inquiries"
          value={stats.totalInquiries}
          trend={"+5%"}
          trendUp={true}
        />
        <StatCard 
          icon={<Heart className="w-5 h-5 text-red-600" />}
          title="Saved by Others"
          value={stats.totalSaved}
          trend={"+8%"}
          trendUp={true}
        />
        <StatCard 
          icon={<DollarSign className="w-5 h-5 text-purple-600" />}
          title="Revenue"
          value={stats.revenue}
          trend={"+15%"}
          trendUp={true}
          isCurrency={true}
        />
        <StatCard 
          icon={<Users className="w-5 h-5 text-indigo-600" />}
          title="Team Size"
          value={stats.teamSize}
          trend={"+1"}
          trendUp={true}
        />
      </div>
      
      {/* Credit Usage */}
      <CreditUsageWidget />
      
      {/* Business Dashboard Tabs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b overflow-x-auto">
          <TabButton 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
            icon={<BarChart2 className="w-5 h-5" />}
            label="Overview"
          />
          <TabButton 
            active={activeTab === 'team'} 
            onClick={() => setActiveTab('team')}
            icon={<Users className="w-5 h-5" />}
            label="Team Management"
          />
          <TabButton 
            active={activeTab === 'listings'} 
            onClick={() => setActiveTab('listings')}
            icon={<ListPlus className="w-5 h-5" />}
            label="Listings"
          />
          <TabButton 
            active={activeTab === 'reels'} 
            onClick={() => setActiveTab('reels')}
            icon={<Film className="w-5 h-5" />}
            label="Reels & Social"
          />
          <TabButton 
            active={activeTab === 'orders'} 
            onClick={() => setActiveTab('orders')}
            icon={<FileText className="w-5 h-5" />}
            label="Orders & Bookings"
          />
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Performance Chart */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold">Business Performance</h3>
                      <div className="flex items-center gap-4">
                        <select
                          value={timeframe}
                          onChange={(e) => setTimeframe(e.target.value as any)}
                          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="7d">Last 7 days</option>
                          <option value="30d">Last 30 days</option>
                          <option value="90d">Last 90 days</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Performance Chart Placeholder</p>
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="font-medium">Business Health</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Listing Success Rate</span>
                          <span className="font-medium">92%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Inquiry Response Time</span>
                          <span className="font-medium">1.2 hours</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Customer Satisfaction</span>
                          <span className="font-medium">4.8/5</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Zap className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="font-medium">Top Performing</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Top Listing</span>
                          <span className="font-medium">Property #1204</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Top Team Member</span>
                          <span className="font-medium">Sarah J.</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Best Conversion</span>
                          <span className="font-medium">Services (8.2%)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="font-medium">Upcoming</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Scheduled Posts</span>
                          <span className="font-medium">3</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Appointments</span>
                          <span className="font-medium">5</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Renewals</span>
                          <span className="font-medium">2</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Recent Activity */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {[
                        { icon: <MessageSquare className="w-5 h-5 text-blue-600" />, text: "New inquiry received for Property #1204", time: "2 hours ago" },
                        { icon: <Heart className="w-5 h-5 text-red-600" />, text: "Your listing 'Modern Apartment' was saved by a user", time: "5 hours ago" },
                        { icon: <Eye className="w-5 h-5 text-green-600" />, text: "10 new views on your 'Professional Services' listing", time: "1 day ago" },
                        { icon: <DollarSign className="w-5 h-5 text-purple-600" />, text: "New order received for $250", time: "2 days ago" }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="mt-0.5">{activity.icon}</div>
                          <div className="flex-1">
                            <p className="text-gray-800">{activity.text}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Team Management Tab */}
              {activeTab === 'team' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Team Members</h3>
                    <button
                      onClick={() => toast.info('Team member invitation coming soon')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Invite Member
                    </button>
                  </div>
                  
                  {teamMembers.length > 0 ? (
                    <div className="space-y-4">
                      {teamMembers.map((member) => (
                        <TeamMemberCard key={member.id} member={member} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No team members yet</h3>
                      <p className="text-gray-600 mb-6">Invite team members to collaborate on your business</p>
                      <button
                        onClick={() => toast.info('Team member invitation coming soon')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Invite Team Members
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold">Pro+ Team Features</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Upgrade to Pro+ to unlock advanced team management features:
                    </p>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-blue-600" />
                        </div>
                        <span>Role-based permissions</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-blue-600" />
                        </div>
                        <span>Team performance analytics</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-blue-600" />
                        </div>
                        <span>Unlimited team members</span>
                      </li>
                    </ul>
                    <Link
                      to="/pro-plus"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Upgrade to Pro+
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
              
              {/* Listings Tab */}
              {activeTab === 'listings' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Business Listings</h3>
                    <Link
                      to="/create-listing"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      New Listing
                    </Link>
                  </div>
                  
                  {listings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {listings.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState 
                      icon={<ListPlus className="w-12 h-12 text-gray-300" />}
                      title="No listings yet"
                      description="Create your first business listing"
                      actionLabel="Create Listing"
                      actionLink="/create-listing"
                    />
                  )}
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-4">Listing Performance</h3>
                    <div className="h-64 bg-white rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Performance Chart Placeholder</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Reels & Social Tab */}
              {activeTab === 'reels' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Reels & Social Media</h3>
                    <div className="flex gap-2">
                      <Link
                        to="/reels/create"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4" />
                        Create Reel
                      </Link>
                      <button
                        onClick={() => toast.info('Social post scheduling coming soon')}
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                      >
                        <Calendar className="w-4 h-4" />
                        Schedule Post
                      </button>
                    </div>
                  </div>
                  
                  {reels.length > 0 ? (
                    <div>
                      <h4 className="font-medium mb-4">Your Reels</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {reels.map((reel) => (
                          <ReelCard key={reel.id} reel={reel} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <EmptyState 
                      icon={<Film className="w-12 h-12 text-gray-300" />}
                      title="No reels yet"
                      description="Create reels to showcase your business"
                      actionLabel="Create Reel"
                      actionLink="/reels/create"
                    />
                  )}
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="font-semibold mb-4">Scheduled Posts</h3>
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No scheduled posts</p>
                      <button
                        onClick={() => toast.info('Social post scheduling coming soon')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Schedule a Post
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                      </div>
                      <h3 className="font-semibold">AI Social Media Assistant</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Let AI help you create engaging social media content for your business.
                    </p>
                    <button
                      onClick={() => toast.info('AI Social Media Assistant coming soon')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Generate Content
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Orders & Bookings Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Orders & Bookings</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toast.info('Invoice generation coming soon')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <FileText className="w-4 h-4" />
                        Create Invoice
                      </button>
                      <Link
                        to="/settings"
                        className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                    </div>
                  </div>
                  
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState 
                      icon={<FileText className="w-12 h-12 text-gray-300" />}
                      title="No orders yet"
                      description="Your orders and bookings will appear here"
                      actionLabel="View Listings"
                      actionLink="#"
                      onClick={() => setActiveTab('listings')}
                    />
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="font-semibold mb-4">Payment Methods</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-gray-600" />
                            <div>
                              <p className="font-medium">Stripe</p>
                              <p className="text-xs text-gray-500">Connected</p>
                            </div>
                          </div>
                          <button className="text-blue-600 text-sm hover:underline">
                            Manage
                          </button>
                        </div>
                        <button
                          onClick={() => toast.info('Additional payment methods coming soon')}
                          className="w-full flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <Plus className="w-4 h-4" />
                          Add Payment Method
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="font-semibold mb-4">API Access</h3>
                      <p className="text-gray-600 mb-4">
                        Connect your business systems with our API.
                      </p>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border mb-4">
                        <Globe className="w-5 h-5 text-gray-600" />
                        <div className="flex-1">
                          <p className="font-medium">API Key</p>
                          <p className="text-xs text-gray-500">Pro+ feature</p>
                        </div>
                        <Link
                          to="/pro-plus"
                          className="text-blue-600 text-sm hover:underline"
                        >
                          Upgrade
                        </Link>
                      </div>
                      <Link
                        to="/settings"
                        className="text-blue-600 text-sm hover:underline"
                      >
                        View API documentation
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Business Tools */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Business Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BusinessToolCard 
            icon={<FileText className="w-6 h-6 text-blue-600" />}
            title="Invoices"
            description="Create and manage invoices"
            onClick={() => toast.info('Invoice management coming soon')}
          />
          <BusinessToolCard 
            icon={<Layers className="w-6 h-6 text-green-600" />}
            title="CRM"
            description="Customer relationship management"
            onClick={() => toast.info('CRM tools coming soon')}
          />
          <BusinessToolCard 
            icon={<Calendar className="w-6 h-6 text-purple-600" />}
            title="Bookings"
            description="Manage appointments"
            onClick={() => toast.info('Booking management coming soon')}
          />
          <BusinessToolCard 
            icon={<Wrench className="w-6 h-6 text-orange-600" />}
            title="Settings"
            link="/settings"
          />
        </div>
      </div>
      
      {/* API & Integrations */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold mb-2">Connect Your Business Systems</h2>
            <p className="text-white/80 mb-4">Integrate with your existing tools and automate your workflow.</p>
            <Link
              to="/pro-plus"
              className="flex items-center gap-2 bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50"
            >
              <Globe className="w-5 h-5" />
              Explore API & Integrations
            </Link>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80" 
            alt="API Integration" 
            className="w-40 h-40 object-cover rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-4 flex items-center justify-center gap-2 transition-colors whitespace-nowrap px-4 ${
        active
          ? 'border-b-2 border-blue-600 text-blue-600'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  trend: string;
  trendUp: boolean;
  isCurrency?: boolean;
}

function StatCard({ icon, title, value, trend, trendUp, isCurrency = false }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          {icon}
        </div>
        <span className={`flex items-center text-sm ${
          trendUp ? 'text-green-600' : 'text-red-600'
        }`}>
          {trendUp ? '↑' : '↓'} {trend}
        </span>
      </div>
      <h3 className="text-2xl font-bold">
        {isCurrency ? '$' : ''}{value.toLocaleString()}
      </h3>
      <p className="text-gray-600">{title}</p>
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  actionLink: string;
  onClick?: () => void;
}

function EmptyState({ icon, title, description, actionLabel, actionLink, onClick }: EmptyStateProps) {
  return (
    <div className="text-center py-12 bg-gray-50 rounded-lg">
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      {onClick ? (
        <button
          onClick={onClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {actionLabel}
          <ArrowRight className="w-4 h-4" />
        </button>
      ) : (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {actionLabel}
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

function ListingCard({ listing }: { listing: any }) {
  const mainImage = listing?.media?.find((m: any) => m.tag === 'Main Photo')?.url || 
                    listing?.media?.[0]?.url || 
                    'https://via.placeholder.com/300x200';
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-sm overflow-hidden border"
    >
      <Link to={`/${listing.category}/${listing.id}`}>
        <div className="relative">
          <img 
            src={mainImage} 
            alt={listing.title} 
            className="w-full h-48 object-cover"
          />
          <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-md font-bold">
            ${listing.price.toLocaleString()}
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-medium text-lg mb-1 line-clamp-1">{listing.title}</h3>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-gray-600 text-sm">
                <Eye className="w-4 h-4" />
                <span>{listing.views || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600 text-sm">
                <Heart className="w-4 h-4" />
                <span>{listing.likes || 0}</span>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              {new Date(listing.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Link>
      
      <div className="p-4 pt-0 flex gap-2">
        <Link
          to={`/edit-listing/${listing.id}`}
          className="flex-1 text-center text-sm py-1.5 border rounded-lg hover:bg-gray-50"
        >
          Edit
        </Link>
        <Link
          to={`/reels/create?listing=${listing.id}`}
          className="flex-1 text-center text-sm py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Reel
        </Link>
      </div>
    </motion.div>
  );
}

function ReelCard({ reel }: { reel: any }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="aspect-[9/16] rounded-lg overflow-hidden relative"
    >
      <Link to={`/reels?id=${reel.id}`}>
        <video 
          src={reel.url} 
          className="w-full h-full object-cover"
          muted
          playsInline
          onMouseOver={(e) => e.currentTarget.play()}
          onMouseOut={(e) => {
            e.currentTarget.pause();
            e.currentTarget.currentTime = 0;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3">
          <p className="text-white text-sm font-medium line-clamp-1">
            {reel.listings?.title || 'Reel'}
          </p>
          {reel.listings?.price && (
            <p className="text-white/90 text-xs">
              ${reel.listings.price.toLocaleString()}
            </p>
          )}
        </div>
      </Link>
      
      <div className="absolute top-2 right-2 flex gap-1">
        <Link
          to={`/reels/edit/${reel.id}`}
          className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}

function TeamMemberCard({ member }: { member: any }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={member.users?.avatar_url || 'https://via.placeholder.com/40'} 
            alt={member.users?.full_name || 'Team Member'} 
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-medium">{member.users?.full_name || 'Team Member'}</p>
            <p className="text-xs text-gray-500">{member.users?.email || 'No email'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 text-xs rounded-full ${
            member.status === 'active' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            {member.status || 'Active'}
          </span>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs capitalize">
            {member.role || 'Member'}
          </span>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <span className="text-xs text-gray-500">
          Joined {new Date(member.created_at).toLocaleDateString()}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => toast.info('Team member management coming soon')}
            className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-50"
          >
            Manage
          </button>
          <button
            onClick={() => toast.info('Team member removal coming soon')}
            className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: any }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-medium">Order #{order.id.slice(0, 8)}</h3>
          <p className="text-xs text-gray-500">
            {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <span className={`px-2 py-0.5 text-xs rounded-full ${
          order.status === 'completed' || order.status === 'paid'
            ? 'bg-green-100 text-green-700' 
            : order.status === 'pending'
            ? 'bg-yellow-100 text-yellow-700'
            : order.status === 'cancelled'
            ? 'bg-red-100 text-red-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {order.status}
        </span>
      </div>
      
      <div className="border-t border-b py-3 my-3">
        <p className="font-medium">{order.listings?.title || 'Product/Service'}</p>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Customer: {order.users?.full_name || 'Customer'}
          </p>
          <p className="font-bold text-blue-600">
            ${order.total_amount?.toLocaleString() || order.listings?.price?.toLocaleString() || 'N/A'}
          </p>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <button
          onClick={() => toast.info('Invoice generation coming soon')}
          className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-50"
        >
          Generate Invoice
        </button>
        <Link
          to={`/orders/${order.id}`}
          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

interface BusinessToolCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  link?: string;
  onClick?: () => void;
}

function BusinessToolCard({ icon, title, description, link, onClick }: BusinessToolCardProps) {
  const content = (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition-shadow"
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-3">{icon}</div>
        <h3 className="font-semibold">{title}</h3>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>
    </motion.div>
  );
  
  if (link) {
    return <Link to={link}>{content}</Link>;
  }
  
  return <button onClick={onClick} className="w-full">{content}</button>;
}