import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Linkedin, Twitter, Calendar, Award, Verified as CheckVerified, Heart, Share2, MessageSquare, Clock, Home, Building, Tag, ChevronRight, Film, User, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { formatDistance } from 'date-fns';
import toast from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import PropertyCard from '../../components/PropertyCard';

export default function ListerProfile() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuthStore();
  const [lister, setLister] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('for-sale');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (username) {
      loadListerProfile();
    }
  }, [username]);

  useEffect(() => {
    if (lister) {
      loadListings();
      loadReels();
      checkFollowStatus();
      checkSavedStatus();
    }
  }, [lister, activeTab]);

  const loadListerProfile = async () => {
    try {
      setLoading(true);
      
      // First try to find by username
      let { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          lister_profiles (*)
        `)
        .eq('username', username)
        .single();
      
      // If not found by username, try by ID (in case username is actually an ID)
      if (userError) {
        const { data: idData, error: idError } = await supabase
          .from('users')
          .select(`
            *,
            lister_profiles (*)
          `)
          .eq('id', username)
          .single();
          
        if (idError) {
          throw new Error('Lister not found');
        }
        
        userData = idData;
      }
      
      // If lister profile doesn't exist, generate one with AI
      if (!userData.lister_profiles || userData.lister_profiles.length === 0) {
        const generatedProfile = await generateAIProfile(userData);
        
        // Create lister profile
        const { data: newProfile, error: profileError } = await supabase
          .from('lister_profiles')
          .insert({
            user_id: userData.id,
            full_name: userData.full_name || 'Real Estate Agent',
            avatar_url: userData.avatar_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            bio: generatedProfile.bio,
            position: generatedProfile.position,
            experience_years: generatedProfile.experience_years,
            specializations: generatedProfile.specializations,
            languages: ['English'],
            contact_info: {
              email: userData.email,
              phone: generatedProfile.phone || '(555) 123-4567'
            },
            verified: false,
            featured: false,
            stats: {
              listings_count: 0,
              sold_count: 0,
              rented_count: 0,
              rating: 4.5,
              reviews_count: 0
            }
          })
          .select()
          .single();
          
        if (profileError) {
          console.error('Error creating lister profile:', profileError);
        } else {
          userData.lister_profiles = [newProfile];
        }
      }
      
      setLister({
        ...userData,
        profile: userData.lister_profiles[0]
      });
    } catch (error) {
      console.error('Error loading lister profile:', error);
      toast.error('Failed to load lister profile');
    } finally {
      setLoading(false);
    }
  };

  const generateAIProfile = async (userData: any) => {
    try {
      // In a real implementation, this would call an AI service
      // For now, we'll return mock data
      return {
        bio: `${userData.full_name || 'This agent'} is a dedicated real estate professional with a passion for helping clients find their dream homes. With a deep understanding of the local market and a commitment to exceptional service, they strive to make every transaction smooth and successful.`,
        position: 'Real Estate Agent',
        experience_years: Math.floor(Math.random() * 10) + 1,
        specializations: ['Residential', 'First Home Buyers', 'Investment Properties'],
        phone: '(555) 123-4567'
      };
    } catch (error) {
      console.error('Error generating AI profile:', error);
      return {
        bio: 'Real estate professional dedicated to helping clients find their perfect property.',
        position: 'Real Estate Agent',
        experience_years: 3,
        specializations: ['Residential'],
        phone: '(555) 123-4567'
      };
    }
  };

  const loadListings = async () => {
    if (!lister) return;
    
    try {
      let query = supabase
        .from('listings')
        .select(`
          *,
          media (
            id,
            url,
            type,
            tag,
            status
          ),
          real_estate_metadata (*)
        `)
        .eq('user_id', lister.id)
        .eq('category', 'real_estate');
      
      // Filter by status based on active tab
      if (activeTab === 'for-sale') {
        query = query.eq('status', 'active').eq('metadata->sale_type', 'for_sale');
      } else if (activeTab === 'for-rent') {
        query = query.eq('status', 'active').eq('metadata->sale_type', 'for_rent');
      } else if (activeTab === 'sold') {
        query = query.eq('status', 'sold');
      }
      
      const { data, error } = await query.order('created_at', { ascending: false }).limit(10);
      
      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error loading listings:', error);
      toast.error('Failed to load listings');
    }
  };

  const loadReels = async () => {
    if (!lister) return;
    
    try {
      const { data, error } = await supabase
        .from('media')
        .select(`
          *,
          listings (
            id,
            title,
            price,
            category
          )
        `)
        .eq('type', 'video')
        .in('listing_id', function(builder) {
          return builder
            .select('id')
            .from('listings')
            .eq('user_id', lister.id);
        })
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      setReels(data || []);
    } catch (error) {
      console.error('Error loading reels:', error);
      toast.error('Failed to load reels');
    }
  };

  const checkFollowStatus = async () => {
    if (!user || !lister) return;
    
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', lister.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const checkSavedStatus = async () => {
    if (!user || !lister) return;
    
    try {
      const { data, error } = await supabase
        .from('saved_agents')
        .select('*')
        .eq('user_id', user.id)
        .eq('agent_id', lister.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      setIsSaved(!!data);
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      toast.error('Please sign in to follow agents');
      return;
    }
    
    if (!lister) return;
    
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', lister.id);
        
        if (error) throw error;
        setIsFollowing(false);
        toast.success(`Unfollowed ${lister.full_name || 'agent'}`);
      } else {
        // Follow
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: lister.id
          });
        
        if (error) throw error;
        setIsFollowing(true);
        toast.success(`Following ${lister.full_name || 'agent'}`);
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast.error('Failed to update follow status');
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Please sign in to save agents');
      return;
    }
    
    if (!lister) return;
    
    try {
      if (isSaved) {
        // Remove from saved
        const { error } = await supabase
          .from('saved_agents')
          .delete()
          .eq('user_id', user.id)
          .eq('agent_id', lister.id);
        
        if (error) throw error;
        setIsSaved(false);
        toast.success(`Removed ${lister.full_name || 'agent'} from saved agents`);
      } else {
        // Save
        const { error } = await supabase
          .from('saved_agents')
          .insert({
            user_id: user.id,
            agent_id: lister.id
          });
        
        if (error) throw error;
        setIsSaved(true);
        toast.success(`Added ${lister.full_name || 'agent'} to saved agents`);
      }
    } catch (error) {
      console.error('Error updating saved status:', error);
      toast.error('Failed to update saved status');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${lister?.full_name || 'Real Estate Agent'} - ListHouze`,
        text: `Check out ${lister?.full_name || 'this agent'}'s profile on ListHouze`,
        url: window.location.href
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      toast.success('Profile link copied to clipboard');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to send messages');
      return;
    }
    
    if (!contactMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }
    
    try {
      setSendingMessage(true);
      
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: lister.id,
          content: contactMessage.trim()
        });
      
      if (error) throw error;
      
      toast.success('Message sent successfully');
      setContactMessage('');
      setShowContactForm(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!lister) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Agent Not Found</h1>
          <p className="text-gray-600 mb-6">The agent you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const profile = lister.profile || {};

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Agent Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
            {/* Mobile Contact Button */}
            <div className="md:hidden absolute bottom-4 right-4 z-10">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowContactForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Contact</span>
              </motion.button>
            </div>
          </div>
          
          <div className="relative px-6 pb-6">
            {/* Profile Image */}
            <div className="absolute -top-16 left-6 w-32 h-32 rounded-full border-4 border-white overflow-hidden">
              <img 
                src={profile.avatar_url || lister.avatar_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'} 
                alt={lister.full_name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="pt-20 md:pt-6 md:ml-36 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">{lister.full_name}</h1>
                  {profile.verified && (
                    <span className="bg-blue-100 text-blue-800 p-1 rounded-full">
                      <CheckVerified className="w-5 h-5" />
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-2">{profile.position || 'Real Estate Agent'}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  {profile.experience_years && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{profile.experience_years} years experience</span>
                    </div>
                  )}
                  {profile.agency_id && (
                    <div className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      <Link to={`/agency/${profile.agency_id}`} className="hover:text-blue-600">
                        Agency Name
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFollow}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    isFollowing 
                      ? 'bg-gray-100 text-gray-800' 
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span>{isFollowing ? 'Following' : 'Follow'}</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    isSaved 
                      ? 'bg-red-50 text-red-600 border border-red-200' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleShare}
                  className="p-2 rounded-lg bg-gray-100 text-gray-800"
                >
                  <Share2 className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowContactForm(true)}
                  className="hidden md:flex px-4 py-2 rounded-lg bg-blue-600 text-white items-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Contact</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">About {lister.full_name}</h2>
              <p className="text-gray-600 whitespace-pre-line">
                {profile.bio || `${lister.full_name} is a dedicated real estate professional with a passion for helping clients find their dream homes. With a deep understanding of the local market and a commitment to exceptional service, they strive to make every transaction smooth and successful.`}
              </p>
              
              {profile.specializations && profile.specializations.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.specializations.map((spec: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {profile.languages && profile.languages.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map((lang: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {profile.certifications && profile.certifications.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.certifications.map((cert: string, index: number) => (
                      <div key={index} className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                        <Award className="w-4 h-4" />
                        <span>{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Listings Tabs */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <Tabs defaultValue="for-sale" onValueChange={setActiveTab}>
                <TabsList className="w-full border-b p-0 h-auto">
                  <TabsTrigger 
                    value="for-sale" 
                    className="flex-1 py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none"
                  >
                    For Sale
                  </TabsTrigger>
                  <TabsTrigger 
                    value="for-rent" 
                    className="flex-1 py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none"
                  >
                    For Rent
                  </TabsTrigger>
                  <TabsTrigger 
                    value="sold" 
                    className="flex-1 py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none"
                  >
                    Sold
                  </TabsTrigger>
                  <TabsTrigger 
                    value="reels" 
                    className="flex-1 py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none"
                  >
                    Reels
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="for-sale" className="p-6">
                  {listings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {listings.map((listing) => (
                        <PropertyCard key={listing.id} property={listing} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No listings for sale</h3>
                      <p className="text-gray-600">
                        {lister.full_name} doesn't have any properties for sale at the moment.
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="for-rent" className="p-6">
                  {listings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {listings.map((listing) => (
                        <PropertyCard key={listing.id} property={listing} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No rental listings</h3>
                      <p className="text-gray-600">
                        {lister.full_name} doesn't have any properties for rent at the moment.
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="sold" className="p-6">
                  {listings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {listings.map((listing) => (
                        <PropertyCard key={listing.id} property={listing} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No sold listings</h3>
                      <p className="text-gray-600">
                        {lister.full_name} doesn't have any sold properties to display.
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="reels" className="p-6">
                  {reels.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {reels.map((reel) => (
                        <Link 
                          key={reel.id} 
                          to={`/reels?id=${reel.id}`}
                          className="aspect-[9/16] rounded-lg overflow-hidden relative group"
                        >
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
                              {reel.listings?.title || 'Property Reel'}
                            </p>
                            {reel.listings?.price && (
                              <p className="text-white/90 text-xs">
                                ${reel.listings.price.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Film className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No reels</h3>
                      <p className="text-gray-600">
                        {lister.full_name} hasn't created any reels yet.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Agent Stats</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{profile.stats?.listings_count || 0}</p>
                  <p className="text-sm text-gray-600">Listings</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{profile.stats?.sold_count || 0}</p>
                  <p className="text-sm text-gray-600">Sold</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{profile.stats?.rented_count || 0}</p>
                  <p className="text-sm text-gray-600">Rented</p>
                </div>
              </div>
              
              {/* Rating */}
              {profile.stats?.rating && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`w-5 h-5 ${i < Math.floor(profile.stats.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-gray-600">{profile.stats.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-gray-500">{profile.stats.reviews_count || 0} reviews</span>
                </div>
              )}
            </div>
            
            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
              <div className="space-y-4">
                {profile.contact_info?.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <a href={`mailto:${profile.contact_info.email}`} className="font-medium hover:text-blue-600">
                        {profile.contact_info.email}
                      </a>
                    </div>
                  </div>
                )}
                
                {profile.contact_info?.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <a href={`tel:${profile.contact_info.phone}`} className="font-medium hover:text-blue-600">
                        {profile.contact_info.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {profile.contact_info?.office_address && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Office</p>
                      <p className="font-medium">{profile.contact_info.office_address}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Social Links */}
              {profile.social_links && Object.values(profile.social_links).some(link => !!link) && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-3">Social Media</h3>
                  <div className="flex gap-3">
                    {profile.social_links.facebook && (
                      <a 
                        href={profile.social_links.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                      >
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                    {profile.social_links.instagram && (
                      <a 
                        href={profile.social_links.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {profile.social_links.linkedin && (
                      <a 
                        href={profile.social_links.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {profile.social_links.twitter && (
                      <a 
                        href={profile.social_links.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                      >
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
              
              {/* Contact Buttons */}
              <div className="mt-6 space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowContactForm(true)}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Send Message
                </motion.button>
                
                <a
                  href={`tel:${profile.contact_info?.phone}`}
                  className="block w-full py-3 text-center border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                >
                  Call Agent
                </a>
              </div>
            </div>
            
            {/* Book a Callback */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
              <h2 className="text-lg font-semibold mb-2">Book a Callback</h2>
              <p className="text-white/80 mb-4">
                Schedule a time for {lister.full_name} to call you back.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50"
              >
                Schedule Now
              </motion.button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Contact {lister.full_name}</h2>
              <button
                onClick={() => setShowContactForm(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Message
                </label>
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Hi, I'm interested in your services..."
                  required
                ></textarea>
              </div>
              
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={sendingMessage}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {sendingMessage ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}