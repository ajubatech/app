import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ListPlus, Eye, Heart, MessageSquare, BarChart2, 
  ArrowRight, Sparkles, Film, Calendar, Home, Package, 
  Wrench, Car, Plus, Clock, CheckCircle, XCircle, 
  DollarSign, Users, Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import CreditUsageWidget from '../CreditUsageWidget';
import toast from 'react-hot-toast';

export default function ListerDashboard() {
  const { user } = useAuthStore();
  const [listings, setListings] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [reels, setReels] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'drafts' | 'sold' | 'reels' | 'rentals'>('active');
  const [rentalTab, setRentalTab] = useState<'tenants' | 'maintenance' | 'inspections'>('tenants');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    views: 0,
    inquiries: 0,
    likes: 0,
    revenue: 0
  });

  useEffect(() => {
    if (user) {
      loadListerData();
    }
  }, [user]);

  const loadListerData = async () => {
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
      
      // Load drafts
      const { data: draftsData, error: draftsError } = await supabase
        .from('listing_drafts')
        .select('*')
        .eq('user_id', user?.id)
        .order('last_saved', { ascending: false });
        
      if (draftsError && draftsError.code !== 'PGRST116') {
        throw draftsError;
      }
      setDrafts(draftsData || []);
      
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
      
      // Load tenants (if rental properties exist)
      const { data: tenantsData, error: tenantsError } = await supabase
        .from('tenant_properties')
        .select(`
          *,
          users (
            id,
            full_name,
            email,
            avatar_url
          ),
          listings (
            id,
            title,
            price
          )
        `)
        .eq('landlord_id', user?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
        
      if (tenantsError && tenantsError.code !== 'PGRST116') {
        console.log('Tenant properties table may not exist yet');
      } else {
        setTenants(tenantsData || []);
      }
      
      // Load maintenance requests
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          tenant_properties (
            id,
            tenant_id,
            users (
              id,
              full_name
            ),
            listings (
              id,
              title
            )
          )
        `)
        .eq('landlord_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (maintenanceError && maintenanceError.code !== 'PGRST116') {
        console.log('Maintenance requests table may not exist yet');
      } else {
        setMaintenanceRequests(maintenanceData || []);
      }
      
      // Calculate stats
      const totalViews = listingsData?.reduce((sum, listing) => sum + (listing.views || 0), 0) || 0;
      const totalLikes = listingsData?.reduce((sum, listing) => sum + (listing.likes || 0), 0) || 0;
      
      setStats({
        views: totalViews,
        inquiries: inquiryData?.length || 0,
        likes: totalLikes,
        revenue: calculateRevenue(tenantsData || [])
      });
      
    } catch (error) {
      console.error('Error loading lister data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRevenue = (tenants: any[]) => {
    // Simple calculation based on active rental properties
    return tenants.reduce((total, tenant) => {
      return total + (tenant.listings?.price || 0);
    }, 0);
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          icon={<Eye className="w-5 h-5 text-blue-600" />}
          title="Total Views"
          value={stats.views}
          trend={"+12%"}
          trendUp={true}
        />
        <StatCard 
          icon={<MessageSquare className="w-5 h-5 text-green-600" />}
          title="Inquiries"
          value={stats.inquiries}
          trend={"+5%"}
          trendUp={true}
        />
        <StatCard 
          icon={<Heart className="w-5 h-5 text-red-600" />}
          title="Saved by Others"
          value={stats.likes}
          trend={"+8%"}
          trendUp={true}
        />
        <StatCard 
          icon={<DollarSign className="w-5 h-5 text-purple-600" />}
          title="Monthly Revenue"
          value={stats.revenue}
          trend={"+3%"}
          trendUp={true}
          isCurrency={true}
        />
      </div>
      
      {/* Credit Usage */}
      <CreditUsageWidget />
      
      {/* Listings Dashboard */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b overflow-x-auto">
          <TabButton 
            active={activeTab === 'active'} 
            onClick={() => setActiveTab('active')}
            icon={<ListPlus className="w-5 h-5" />}
            label="Active Listings"
            count={listings.length}
          />
          <TabButton 
            active={activeTab === 'drafts'} 
            onClick={() => setActiveTab('drafts')}
            icon={<Clock className="w-5 h-5" />}
            label="Drafts"
            count={drafts.length}
          />
          <TabButton 
            active={activeTab === 'sold'} 
            onClick={() => setActiveTab('sold')}
            icon={<CheckCircle className="w-5 h-5" />}
            label="Sold/Rented"
            count={0}
          />
          <TabButton 
            active={activeTab === 'reels'} 
            onClick={() => setActiveTab('reels')}
            icon={<Film className="w-5 h-5" />}
            label="Reels"
            count={reels.length}
          />
          <TabButton 
            active={activeTab === 'rentals'} 
            onClick={() => setActiveTab('rentals')}
            icon={<Home className="w-5 h-5" />}
            label="Rental Management"
            count={tenants.length}
          />
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Active Listings */}
              {activeTab === 'active' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Your Active Listings</h3>
                    <Link
                      to="/create-listing"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      New Listing
                    </Link>
                  </div>
                  
                  {listings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {listings.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState 
                      icon={<ListPlus className="w-12 h-12 text-gray-300" />}
                      title="No active listings"
                      description="Create your first listing to start selling"
                      actionLabel="Create Listing"
                      actionLink="/create-listing"
                    />
                  )}
                </div>
              )}
              
              {/* Drafts */}
              {activeTab === 'drafts' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Your Draft Listings</h3>
                    <Link
                      to="/create-listing"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      New Listing
                    </Link>
                  </div>
                  
                  {drafts.length > 0 ? (
                    <div className="space-y-4">
                      {drafts.map((draft) => (
                        <DraftCard key={draft.id} draft={draft} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState 
                      icon={<Clock className="w-12 h-12 text-gray-300" />}
                      title="No drafts"
                      description="Your saved drafts will appear here"
                      actionLabel="Create Listing"
                      actionLink="/create-listing"
                    />
                  )}
                </div>
              )}
              
              {/* Sold/Rented */}
              {activeTab === 'sold' && (
                <EmptyState 
                  icon={<CheckCircle className="w-12 h-12 text-gray-300" />}
                  title="No sold or rented listings"
                  description="Listings marked as sold or rented will appear here"
                  actionLabel="View Active Listings"
                  actionLink="#"
                  onClick={() => setActiveTab('active')}
                />
              )}
              
              {/* Reels */}
              {activeTab === 'reels' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Your Reels</h3>
                    <Link
                      to="/reels"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Create Reel
                    </Link>
                  </div>
                  
                  {reels.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {reels.map((reel) => (
                        <ReelCard key={reel.id} reel={reel} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState 
                      icon={<Film className="w-12 h-12 text-gray-300" />}
                      title="No reels yet"
                      description="Create reels to showcase your listings"
                      actionLabel="Create Reel"
                      actionLink="/reels"
                    />
                  )}
                </div>
              )}
              
              {/* Rental Management */}
              {activeTab === 'rentals' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Rental Property Management</h3>
                    <Link
                      to="/create-listing"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      List a Rental
                    </Link>
                  </div>
                  
                  {/* Rental Tabs */}
                  <div className="flex border-b mb-6">
                    <button
                      onClick={() => setRentalTab('tenants')}
                      className={`px-4 py-2 font-medium ${
                        rentalTab === 'tenants'
                          ? 'border-b-2 border-blue-600 text-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Tenants
                    </button>
                    <button
                      onClick={() => setRentalTab('maintenance')}
                      className={`px-4 py-2 font-medium ${
                        rentalTab === 'maintenance'
                          ? 'border-b-2 border-blue-600 text-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Maintenance
                    </button>
                    <button
                      onClick={() => setRentalTab('inspections')}
                      className={`px-4 py-2 font-medium ${
                        rentalTab === 'inspections'
                          ? 'border-b-2 border-blue-600 text-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Inspections
                    </button>
                  </div>
                  
                  {/* Tenants Tab */}
                  {rentalTab === 'tenants' && (
                    <div>
                      {tenants.length > 0 ? (
                        <div className="space-y-4">
                          {tenants.map((tenant) => (
                            <TenantCard key={tenant.id} tenant={tenant} />
                          ))}
                        </div>
                      ) : (
                        <EmptyState 
                          icon={<Users className="w-12 h-12 text-gray-300" />}
                          title="No active tenants"
                          description="Your tenant information will appear here"
                          actionLabel="List a Rental"
                          actionLink="/create-listing"
                        />
                      )}
                    </div>
                  )}
                  
                  {/* Maintenance Tab */}
                  {rentalTab === 'maintenance' && (
                    <div>
                      {maintenanceRequests.length > 0 ? (
                        <div className="space-y-4">
                          {maintenanceRequests.map((request) => (
                            <MaintenanceRequestCard key={request.id} request={request} />
                          ))}
                        </div>
                      ) : (
                        <EmptyState 
                          icon={<Wrench className="w-12 h-12 text-gray-300" />}
                          title="No maintenance requests"
                          description="Maintenance requests from tenants will appear here"
                          actionLabel="View Tenants"
                          actionLink="#"
                          onClick={() => setRentalTab('tenants')}
                        />
                      )}
                    </div>
                  )}
                  
                  {/* Inspections Tab */}
                  {rentalTab === 'inspections' && (
                    <EmptyState 
                      icon={<Calendar className="w-12 h-12 text-gray-300" />}
                      title="No scheduled inspections"
                      description="Schedule property inspections to keep track of your rentals"
                      actionLabel="Schedule Inspection"
                      actionLink="#"
                      onClick={() => toast.info('Inspection scheduling coming soon')}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Recent Inquiries */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Recent Inquiries</h2>
          <Link
            to="/messages"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        
        {inquiries.length > 0 ? (
          <div className="space-y-4">
            {inquiries.slice(0, 3).map((inquiry) => (
              <InquiryCard key={inquiry.id} inquiry={inquiry} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>No inquiries yet</p>
          </div>
        )}
      </div>
      
      {/* Create Listing Shortcuts */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Quick Create</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <CategoryCard 
            icon={<Home className="w-6 h-6 text-blue-600" />}
            title="Real Estate"
            link="/listings/new/real-estate"
          />
          <CategoryCard 
            icon={<Package className="w-6 h-6 text-green-600" />}
            title="Product"
            link="/listings/new/product"
          />
          <CategoryCard 
            icon={<Wrench className="w-6 h-6 text-purple-600" />}
            title="Service"
            link="/listings/new/service"
          />
          <CategoryCard 
            icon={<Car className="w-6 h-6 text-red-600" />}
            title="Automotive"
            link="/listings/new/automotive"
          />
        </div>
      </div>
      
      {/* Upgrade Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold mb-2">Take your business to the next level</h2>
            <p className="text-white/80 mb-4">Upgrade to a Business account for team management, advanced analytics, and more.</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                useAuthStore.getState().upgradeToBusiness()
                  .then(() => toast.success('Successfully upgraded to Business!'))
                  .catch(() => toast.error('Failed to upgrade account'));
              }}
              className="flex items-center gap-2 bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50"
            >
              <Building2 className="w-5 h-5" />
              Upgrade to Business
            </motion.button>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1632&q=80" 
            alt="Upgrade to Business" 
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
  count: number;
}

function TabButton({ active, onClick, icon, label, count }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-4 flex flex-col items-center gap-1 transition-colors whitespace-nowrap px-4 ${
        active
          ? 'border-b-2 border-blue-600 text-blue-600'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span>{label}</span>
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        active ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
      }`}>
        {count}
      </span>
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
      <h3 className="text-2xl font-bold">{isCurrency ? '$' : ''}{value.toLocaleString()}</h3>
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
    <div className="text-center py-12">
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

function DraftCard({ draft }: { draft: any }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-medium">{draft.content?.title || `${draft.category} Draft`}</h3>
          <p className="text-xs text-gray-500">
            Last saved: {new Date(draft.last_saved).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/listings/new/${draft.category}?draft=${draft.id}`}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Edit
          </Link>
          <button
            className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-50"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs capitalize">
          {draft.category}
        </span>
        <span className="text-xs text-gray-500">
          Created: {new Date(draft.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
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

function InquiryCard({ inquiry }: { inquiry: any }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border">
      <div className="flex items-center gap-3 mb-3">
        <img 
          src={inquiry.users?.avatar_url || 'https://via.placeholder.com/40'} 
          alt={inquiry.users?.full_name || 'User'} 
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-medium">{inquiry.users?.full_name || 'User'}</p>
          <p className="text-xs text-gray-500">
            {new Date(inquiry.created_at).toLocaleString()}
          </p>
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-3">{inquiry.content}</p>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">
          Re: {inquiry.listings?.title || 'Listing'}
        </span>
        <Link
          to={`/messages?inquiry=${inquiry.id}`}
          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          Reply
        </Link>
      </div>
    </div>
  );
}

function TenantCard({ tenant }: { tenant: any }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img 
            src={tenant.users?.avatar_url || 'https://via.placeholder.com/40'} 
            alt={tenant.users?.full_name || 'Tenant'} 
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-medium">{tenant.users?.full_name || 'Tenant'}</p>
            <p className="text-xs text-gray-500">{tenant.users?.email || 'No email'}</p>
          </div>
        </div>
        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
          Active
        </span>
      </div>
      
      <div className="border-t border-b py-3 my-3">
        <p className="font-medium">{tenant.listings?.title || 'Property'}</p>
        <p className="text-sm text-gray-600">
          ${tenant.listings?.price?.toLocaleString() || 'N/A'}/week
        </p>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          <span>Lease: </span>
          <span>{tenant.lease_start ? new Date(tenant.lease_start).toLocaleDateString() : 'N/A'}</span>
          <span> - </span>
          <span>{tenant.lease_end ? new Date(tenant.lease_end).toLocaleDateString() : 'Ongoing'}</span>
        </div>
        <Link
          to={`/tenants/${tenant.id}`}
          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          Manage
        </Link>
      </div>
    </div>
  );
}

function MaintenanceRequestCard({ request }: { request: any }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">{request.title || 'Maintenance Request'}</h3>
        <span className={`px-2 py-0.5 text-xs rounded-full ${
          request.status === 'new' 
            ? 'bg-yellow-100 text-yellow-700' 
            : request.status === 'in_progress'
            ? 'bg-blue-100 text-blue-700'
            : request.status === 'completed'
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {request.status}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{request.description}</p>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {new Date(request.created_at).toLocaleDateString()}
          </span>
          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">
            {request.priority}
          </span>
        </div>
        <Link
          to={`/maintenance/${request.id}`}
          className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          View
        </Link>
      </div>
    </div>
  );
}

function CategoryCard({ icon, title, link }: { icon: React.ReactNode; title: string; link: string }) {
  return (
    <Link to={link}>
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition-shadow"
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-3">{icon}</div>
          <h3 className="font-semibold">{title}</h3>
        </div>
      </motion.div>
    </Link>
  );
}