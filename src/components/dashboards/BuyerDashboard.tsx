import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageSquare, Home, Clock, ArrowRight, Sparkles, FileText, AlertTriangle, Film, Building2, Wrench, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

export default function BuyerDashboard() {
  const { user } = useAuthStore();
  const [savedListings, setSavedListings] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [savedReels, setSavedReels] = useState<any[]>([]);
  const [rentalProperties, setRentalProperties] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'saved' | 'applications' | 'inquiries' | 'reels' | 'rentals'>('saved');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBuyerData();
    }
  }, [user]);

  const loadBuyerData = async () => {
    try {
      setIsLoading(true);
      
      // Load saved listings
      const { data: savedData, error: savedError } = await supabase
        .from('saved_listings')
        .select(`
          *,
          listings (
            id,
            title,
            price,
            category,
            status,
            media (
              id,
              url,
              type,
              tag
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (savedError) throw savedError;
      setSavedListings(savedData || []);
      
      // Load applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('rental_applications')
        .select(`
          *,
          listings (
            id,
            title,
            price,
            category,
            status
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (applicationsError && applicationsError.code !== 'PGRST116') {
        // PGRST116 means the table doesn't exist, which is fine for now
        console.log('Applications table may not exist yet');
      } else {
        setApplications(applicationsData || []);
      }
      
      // Load inquiries (messages)
      const { data: inquiryData, error: inquiryError } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          read,
          listings (
            id,
            title,
            user_id,
            users (
              id,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('sender_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (inquiryError && inquiryError.code !== 'PGRST116') {
        // PGRST116 means the table doesn't exist, which is fine for now
        throw inquiryError;
      }
      setInquiries(inquiryData || []);
      
      // Load saved reels
      const { data: reelsData, error: reelsError } = await supabase
        .from('reel_likes')
        .select(`
          *,
          media (
            id,
            url,
            type,
            listings (
              id,
              title,
              price
            )
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (reelsError && reelsError.code !== 'PGRST116') {
        throw reelsError;
      }
      setSavedReels(reelsData || []);
      
      // Load rental properties (if any)
      const { data: rentalData, error: rentalError } = await supabase
        .from('tenant_properties')
        .select(`
          *,
          listings (
            id,
            title,
            price,
            category,
            status,
            media (
              id,
              url,
              type,
              tag
            )
          )
        `)
        .eq('tenant_id', user?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
        
      if (rentalError && rentalError.code !== 'PGRST116') {
        console.log('Tenant properties table may not exist yet');
      } else {
        setRentalProperties(rentalData || []);
      }
      
    } catch (error) {
      console.error('Error loading buyer data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Tabs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b overflow-x-auto">
          <TabButton 
            active={activeTab === 'saved'} 
            onClick={() => setActiveTab('saved')}
            icon={<Heart className="w-5 h-5" />}
            label="Saved Listings"
            count={savedListings.length}
          />
          <TabButton 
            active={activeTab === 'applications'} 
            onClick={() => setActiveTab('applications')}
            icon={<FileText className="w-5 h-5" />}
            label="Applications"
            count={applications.length}
          />
          <TabButton 
            active={activeTab === 'inquiries'} 
            onClick={() => setActiveTab('inquiries')}
            icon={<MessageSquare className="w-5 h-5" />}
            label="Inquiries"
            count={inquiries.length}
          />
          <TabButton 
            active={activeTab === 'reels'} 
            onClick={() => setActiveTab('reels')}
            icon={<Film className="w-5 h-5" />}
            label="Saved Reels"
            count={savedReels.length}
          />
          <TabButton 
            active={activeTab === 'rentals'} 
            onClick={() => setActiveTab('rentals')}
            icon={<Home className="w-5 h-5" />}
            label="My Rentals"
            count={rentalProperties.length}
          />
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Saved Listings */}
              {activeTab === 'saved' && (
                <div>
                  {savedListings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {savedListings.map((saved) => (
                        <SavedListingCard key={saved.id} listing={saved.listings} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState 
                      icon={<Heart className="w-12 h-12 text-gray-300" />}
                      title="No saved listings yet"
                      description="Save listings you're interested in to view them later"
                      actionLabel="Browse Listings"
                      actionLink="/explore"
                    />
                  )}
                </div>
              )}
              
              {/* Applications */}
              {activeTab === 'applications' && (
                <div>
                  {applications.length > 0 ? (
                    <div className="space-y-4">
                      {applications.map((application) => (
                        <ApplicationCard key={application.id} application={application} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState 
                      icon={<FileText className="w-12 h-12 text-gray-300" />}
                      title="No applications yet"
                      description="Apply for rental properties to see your applications here"
                      actionLabel="Browse Rentals"
                      actionLink="/real-estate/category/for-rent"
                    />
                  )}
                </div>
              )}
              
              {/* Inquiries */}
              {activeTab === 'inquiries' && (
                <div>
                  {inquiries.length > 0 ? (
                    <div className="space-y-4">
                      {inquiries.map((inquiry) => (
                        <InquiryCard key={inquiry.id} inquiry={inquiry} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState 
                      icon={<MessageSquare className="w-12 h-12 text-gray-300" />}
                      title="No inquiries yet"
                      description="Contact sellers about listings you're interested in"
                      actionLabel="Browse Listings"
                      actionLink="/explore"
                    />
                  )}
                </div>
              )}
              
              {/* Saved Reels */}
              {activeTab === 'reels' && (
                <div>
                  {savedReels.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {savedReels.map((reel) => (
                        <SavedReelCard key={reel.id} reel={reel.media} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState 
                      icon={<Film className="w-12 h-12 text-gray-300" />}
                      title="No saved reels yet"
                      description="Like reels to save them for later viewing"
                      actionLabel="Browse Reels"
                      actionLink="/reels"
                    />
                  )}
                </div>
              )}
              
              {/* My Rentals */}
              {activeTab === 'rentals' && (
                <div>
                  {rentalProperties.length > 0 ? (
                    <div className="space-y-6">
                      {rentalProperties.map((rental) => (
                        <RentalPropertyCard key={rental.id} rental={rental} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState 
                      icon={<Home className="w-12 h-12 text-gray-300" />}
                      title="No rental properties"
                      description="Your active rental properties will appear here"
                      actionLabel="Browse Rentals"
                      actionLink="/real-estate/category/for-rent"
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* AI Assistant */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold">AI Home Buying Assistant</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Get personalized recommendations, mortgage calculations, and property insights with our AI assistant.
            </p>
            <Link
              to="/chat-with-ai"
              className="flex items-center gap-2 text-purple-600 font-medium hover:text-purple-700"
            >
              Start a conversation <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm max-w-md">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <p className="font-medium">ListAI</p>
            </div>
            <p className="text-gray-600 mb-3">
              Hi there! I can help you find the perfect property based on your preferences. What are you looking for?
            </p>
            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200">
                Find a house
              </button>
              <button className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200">
                Calculate mortgage
              </button>
              <button className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200">
                Property insights
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Quick Explore</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionCard 
            icon={<Home className="w-6 h-6 text-blue-600" />}
            title="Real Estate"
            description="Find your dream home"
            link="/real-estate/category/all"
          />
          <QuickActionCard 
            icon={<Building2 className="w-6 h-6 text-green-600" />}
            title="Rentals"
            description="Properties for rent"
            link="/real-estate/category/for-rent"
          />
          <QuickActionCard 
            icon={<Wrench className="w-6 h-6 text-purple-600" />}
            title="Services"
            description="Find local services"
            link="/services/category/all"
          />
          <QuickActionCard 
            icon={<DollarSign className="w-6 h-6 text-orange-600" />}
            title="Earn Money"
            description="Income opportunities"
            link="/ai/earn-money"
          />
        </div>
      </div>
      
      {/* Upgrade Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold mb-2">Ready to start selling?</h2>
            <p className="text-white/80 mb-4">Upgrade to a Lister account to create and manage your own listings.</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                useAuthStore.getState().upgradeToLister()
                  .then(() => toast.success('Successfully upgraded to Lister!'))
                  .catch(() => toast.error('Failed to upgrade account'));
              }}
              className="flex items-center gap-2 bg-white text-purple-600 px-6 py-2 rounded-lg font-medium hover:bg-purple-50"
            >
              <Sparkles className="w-5 h-5" />
              Upgrade to Lister
            </motion.button>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80" 
            alt="Upgrade to Lister" 
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

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  actionLink: string;
}

function EmptyState({ icon, title, description, actionLabel, actionLink }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      <Link
        to={actionLink}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        {actionLabel}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function SavedListingCard({ listing }: { listing: any }) {
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
          
          <div className="flex items-center justify-between mt-2">
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              listing.status === 'active' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {listing.status}
            </span>
            <span className="text-xs text-gray-500">
              Saved {new Date(listing.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function ApplicationCard({ application }: { application: any }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">{application.listings?.title || 'Property Application'}</h3>
        <span className={`px-2 py-0.5 text-xs rounded-full ${
          application.status === 'approved' 
            ? 'bg-green-100 text-green-700' 
            : application.status === 'rejected'
            ? 'bg-red-100 text-red-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {application.status}
        </span>
      </div>
      <p className="text-gray-600 text-sm mb-3">
        Applied on {new Date(application.created_at).toLocaleDateString()}
      </p>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">
          ${application.listings?.price?.toLocaleString() || 'N/A'} 
          {application.listings?.category === 'real_estate' ? '/week' : ''}
        </span>
        <Link
          to={`/applications/${application.id}`}
          className="text-blue-600 text-sm hover:underline"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

function InquiryCard({ inquiry }: { inquiry: any }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">{inquiry.listings?.title || 'Listing'}</h3>
        <span className="text-xs text-gray-500">
          {new Date(inquiry.created_at).toLocaleDateString()}
        </span>
      </div>
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{inquiry.content}</p>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
          <span className="text-sm">{inquiry.listings?.users?.full_name || 'Seller'}</span>
        </div>
        <span className={`px-2 py-0.5 text-xs rounded-full ${
          inquiry.read ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {inquiry.read ? 'Read' : 'Unread'}
        </span>
      </div>
    </div>
  );
}

function SavedReelCard({ reel }: { reel: any }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="aspect-[9/16] rounded-lg overflow-hidden relative"
    >
      <Link to={`/reels?id=${reel.id}`}>
        <img 
          src={reel.url} 
          alt="Reel thumbnail" 
          className="w-full h-full object-cover"
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
    </motion.div>
  );
}

function RentalPropertyCard({ rental }: { rental: any }) {
  const mainImage = rental.listings?.media?.find((m: any) => m.tag === 'Main Photo')?.url || 
                    rental.listings?.media?.[0]?.url || 
                    'https://via.placeholder.com/300x200';
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3">
          <img 
            src={mainImage} 
            alt={rental.listings?.title || 'Rental Property'} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4 md:w-2/3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg mb-1">{rental.listings?.title || 'Rental Property'}</h3>
              <p className="text-blue-600 font-bold">${rental.listings?.price?.toLocaleString() || 'N/A'}/week</p>
            </div>
            <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
              Active Lease
            </span>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Lease Start:</span>
              <span>{new Date(rental.lease_start || rental.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Lease End:</span>
              <span>{rental.lease_end ? new Date(rental.lease_end).toLocaleDateString() : 'Ongoing'}</span>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Link
              to={`/rentals/${rental.id}/maintenance`}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Report Issue
            </Link>
            <Link
              to={`/rentals/${rental.id}/details`}
              className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ icon, title, description, link }: { icon: React.ReactNode; title: string; description: string; link: string }) {
  return (
    <Link to={link}>
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-3">{icon}</div>
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </motion.div>
    </Link>
  );
}