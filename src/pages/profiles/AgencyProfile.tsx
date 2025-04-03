import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe, Facebook, Instagram, Linkedin, Twitter, Calendar, Award, Verified as CheckVerified, Heart, Share2, MessageSquare, Clock, Home, Building, Tag, ChevronRight, Film, User, Users, ExternalLink, Map, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { formatDistance } from 'date-fns';
import toast from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import PropertyCard from '../../components/PropertyCard';

export default function AgencyProfile() {
  const { agencyName } = useParams<{ agencyName: string }>();
  const { user } = useAuthStore();
  const [agency, setAgency] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('featured');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (agencyName) {
      loadAgencyProfile();
    }
  }, [agencyName]);

  useEffect(() => {
    if (agency) {
      loadTeamMembers();
      loadListings();
      checkFollowStatus();
      checkSavedStatus();
    }
  }, [agency, activeTab]);

  const loadAgencyProfile = async () => {
    try {
      setLoading(true);
      
      // First try to find by slug
      let { data: agencyData, error: agencyError } = await supabase
        .from('agency_profiles')
        .select('*')
        .eq('slug', agencyName)
        .single();
      
      // If not found by slug, try by ID
      if (agencyError) {
        const { data: idData, error: idError } = await supabase
          .from('agency_profiles')
          .select('*')
          .eq('id', agencyName)
          .single();
          
        if (idError) {
          throw new Error('Agency not found');
        }
        
        agencyData = idData;
      }
      
      // If agency doesn't exist, generate mock data
      if (!agencyData) {
        const mockAgency = generateMockAgency();
        setAgency(mockAgency);
      } else {
        setAgency(agencyData);
      }
    } catch (error) {
      console.error('Error loading agency profile:', error);
      toast.error('Failed to load agency profile');
      
      // Generate mock data for demo purposes
      const mockAgency = generateMockAgency();
      setAgency(mockAgency);
    } finally {
      setLoading(false);
    }
  };

  const generateMockAgency = () => {
    return {
      id: 'mock-agency-id',
      name: agencyName || 'Real Estate Agency',
      slug: agencyName || 'real-estate-agency',
      logo_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=300&q=80',
      banner_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80',
      description: 'A leading real estate agency dedicated to helping clients find their perfect property. With years of experience in the market, our team of professionals provides exceptional service and expertise.',
      established_year: 2010,
      locations: [
        {
          address: '123 Main Street',
          city: 'Auckland',
          state: 'Auckland',
          postal_code: '1010',
          lat: -36.8509,
          lng: 174.7645,
          is_headquarters: true,
          phone: '(09) 123-4567'
        }
      ],
      contact_info: {
        email: 'info@agency.com',
        phone: '(09) 123-4567',
        website: 'https://www.agency.com'
      },
      social_links: {
        facebook: 'https://facebook.com/agency',
        instagram: 'https://instagram.com/agency',
        linkedin: 'https://linkedin.com/company/agency',
        twitter: 'https://twitter.com/agency'
      },
      team_members: [],
      specializations: ['Residential', 'Commercial', 'Property Management', 'New Developments'],
      awards: [
        {
          title: 'Agency of the Year',
          year: 2023,
          description: 'Recognized for outstanding service and sales performance'
        }
      ],
      stats: {
        listings_count: 45,
        sold_count: 120,
        rented_count: 85,
        rating: 4.8,
        reviews_count: 56
      },
      verified: true,
      featured: true
    };
  };

  const loadTeamMembers = async () => {
    if (!agency) return;
    
    try {
      // In a real implementation, this would query the database
      // For now, we'll generate mock team members
      const mockTeamMembers = [
        {
          id: 'team-member-1',
          user_id: 'user-1',
          full_name: 'Sarah Johnson',
          position: 'Principal Agent',
          avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          stats: {
            listings_count: 12,
            sold_count: 45
          }
        },
        {
          id: 'team-member-2',
          user_id: 'user-2',
          full_name: 'Michael Chen',
          position: 'Senior Agent',
          avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          stats: {
            listings_count: 8,
            sold_count: 32
          }
        },
        {
          id: 'team-member-3',
          user_id: 'user-3',
          full_name: 'Emma Wilson',
          position: 'Property Manager',
          avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          stats: {
            listings_count: 15,
            sold_count: 28
          }
        },
        {
          id: 'team-member-4',
          user_id: 'user-4',
          full_name: 'David Thompson',
          position: 'Commercial Specialist',
          avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          stats: {
            listings_count: 6,
            sold_count: 15
          }
        }
      ];
      
      setTeamMembers(mockTeamMembers);
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  const loadListings = async () => {
    if (!agency) return;
    
    try {
      // In a real implementation, this would query the database
      // For now, we'll generate mock listings
      const mockListings = [
        {
          id: 'listing-1',
          title: 'Modern 3-Bedroom House with Pool',
          price: 850000,
          status: 'active',
          category: 'real_estate',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          media: [
            {
              url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80',
              tag: 'Main Photo'
            }
          ],
          real_estate_metadata: {
            bedrooms: 3,
            bathrooms: 2,
            parking: 2,
            property_type: 'house'
          },
          location: {
            address: '123 Main St, Auckland'
          },
          metadata: {
            sale_type: 'for_sale'
          }
        },
        {
          id: 'listing-2',
          title: 'Luxury Waterfront Apartment',
          price: 1250000,
          status: 'active',
          category: 'real_estate',
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          media: [
            {
              url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80',
              tag: 'Main Photo'
            }
          ],
          real_estate_metadata: {
            bedrooms: 2,
            bathrooms: 2,
            parking: 1,
            property_type: 'apartment'
          },
          location: {
            address: '456 Harbor View, Auckland'
          },
          metadata: {
            sale_type: 'for_sale'
          }
        },
        {
          id: 'listing-3',
          title: 'Spacious Family Home with Garden',
          price: 925000,
          status: 'active',
          category: 'real_estate',
          created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          media: [
            {
              url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80',
              tag: 'Main Photo'
            }
          ],
          real_estate_metadata: {
            bedrooms: 4,
            bathrooms: 3,
            parking: 2,
            property_type: 'house'
          },
          location: {
            address: '789 Garden Road, Auckland'
          },
          metadata: {
            sale_type: 'for_sale'
          }
        },
        {
          id: 'listing-4',
          title: 'Modern Townhouse in Central Location',
          price: 695000,
          status: 'active',
          category: 'real_estate',
          created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
          media: [
            {
              url: 'https://images.unsplash.com/photo-1576941089067-2de3c901e126?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1350&q=80',
              tag: 'Main Photo'
            }
          ],
          real_estate_metadata: {
            bedrooms: 3,
            bathrooms: 2,
            parking: 1,
            property_type: 'townhouse'
          },
          location: {
            address: '101 Central Ave, Auckland'
          },
          metadata: {
            sale_type: 'for_sale'
          }
        }
      ];
      
      setListings(mockListings);
    } catch (error) {
      console.error('Error loading listings:', error);
    }
  };

  const checkFollowStatus = async () => {
    if (!user || !agency) return;
    
    try {
      const { data, error } = await supabase
        .from('agency_follows')
        .select('*')
        .eq('user_id', user.id)
        .eq('agency_id', agency.id)
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
    if (!user || !agency) return;
    
    try {
      const { data, error } = await supabase
        .from('saved_agencies')
        .select('*')
        .eq('user_id', user.id)
        .eq('agency_id', agency.id)
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
      toast.error('Please sign in to follow agencies');
      return;
    }
    
    if (!agency) return;
    
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('agency_follows')
          .delete()
          .eq('user_id', user.id)
          .eq('agency_id', agency.id);
        
        if (error) throw error;
        setIsFollowing(false);
        toast.success(`Unfollowed ${agency.name}`);
      } else {
        // Follow
        const { error } = await supabase
          .from('agency_follows')
          .insert({
            user_id: user.id,
            agency_id: agency.id
          });
        
        if (error) throw error;
        setIsFollowing(true);
        toast.success(`Following ${agency.name}`);
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast.error('Failed to update follow status');
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Please sign in to save agencies');
      return;
    }
    
    if (!agency) return;
    
    try {
      if (isSaved) {
        // Remove from saved
        const { error } = await supabase
          .from('saved_agencies')
          .delete()
          .eq('user_id', user.id)
          .eq('agency_id', agency.id);
        
        if (error) throw error;
        setIsSaved(false);
        toast.success(`Removed ${agency.name} from saved agencies`);
      } else {
        // Save
        const { error } = await supabase
          .from('saved_agencies')
          .insert({
            user_id: user.id,
            agency_id: agency.id
          });
        
        if (error) throw error;
        setIsSaved(true);
        toast.success(`Added ${agency.name} to saved agencies`);
      }
    } catch (error) {
      console.error('Error updating saved status:', error);
      toast.error('Failed to update saved status');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${agency?.name || 'Real Estate Agency'} - ListHouze`,
        text: `Check out ${agency?.name || 'this agency'}'s profile on ListHouze`,
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
      
      // In a real implementation, this would send a message to the agency
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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

  if (!agency) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Agency Not Found</h1>
          <p className="text-gray-600 mb-6">The agency you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Agency Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          {/* Banner */}
          <div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-500 to-purple-600">
            {agency.banner_url && (
              <img 
                src={agency.banner_url} 
                alt={agency.name} 
                className="w-full h-full object-cover"
              />
            )}
            
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
            
            {/* Logo */}
            <div className="absolute -bottom-12 left-6 w-24 h-24 md:w-32 md:h-32 bg-white rounded-xl shadow-lg flex items-center justify-center p-2">
              <img 
                src={agency.logo_url} 
                alt={agency.name} 
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
          
          <div className="pt-16 md:pt-6 md:ml-36 p-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{agency.name}</h1>
                {agency.verified && (
                  <span className="bg-blue-100 text-blue-800 p-1 rounded-full">
                    <CheckVerified className="w-5 h-5" />
                  </span>
                )}
                {agency.featured && (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium">
                    Featured
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Est. {agency.established_year}</span>
                </div>
                {agency.locations && agency.locations.length > 0 && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{agency.locations[0].city}, {agency.locations[0].state}</span>
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">About {agency.name}</h2>
              <p className="text-gray-600 whitespace-pre-line">
                {agency.description}
              </p>
              
              {agency.specializations && agency.specializations.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {agency.specializations.map((spec: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {agency.awards && agency.awards.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Awards & Recognition</h3>
                  <div className="space-y-3">
                    {agency.awards.map((award: any, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                        <Award className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-medium">{award.title}</p>
                          <p className="text-sm text-gray-600">{award.year}</p>
                          {award.description && (
                            <p className="text-sm text-gray-600 mt-1">{award.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Team Members */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Our Team</h2>
                <Link to="#" className="text-blue-600 hover:underline flex items-center gap-1">
                  <span>View All</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teamMembers.map((member) => (
                  <Link 
                    key={member.id}
                    to={`/lister/${member.user_id}`}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <img 
                      src={member.avatar_url} 
                      alt={member.full_name} 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold">{member.full_name}</h3>
                      <p className="text-gray-600 text-sm">{member.position}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>{member.stats.listings_count} listings</span>
                        <span>{member.stats.sold_count} sold</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Listings Tabs */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <Tabs defaultValue="featured" onValueChange={setActiveTab}>
                <TabsList className="w-full border-b p-0 h-auto">
                  <TabsTrigger 
                    value="featured" 
                    className="flex-1 py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none"
                  >
                    Featured
                  </TabsTrigger>
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
                </TabsList>
                
                {['featured', 'for-sale', 'for-rent', 'sold'].map((tab) => (
                  <TabsContent key={tab} value={tab} className="p-6">
                    {listings.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {listings.map((listing) => (
                          <PropertyCard key={listing.id} property={listing} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No listings available</h3>
                        <p className="text-gray-600">
                          {agency.name} doesn't have any {tab.replace('-', ' ')} properties at the moment.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Agency Stats</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{agency.stats?.listings_count || 0}</p>
                  <p className="text-sm text-gray-600">Listings</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{agency.stats?.sold_count || 0}</p>
                  <p className="text-sm text-gray-600">Sold</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{agency.stats?.rented_count || 0}</p>
                  <p className="text-sm text-gray-600">Rented</p>
                </div>
              </div>
              
              {/* Rating */}
              {agency.stats?.rating && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-5 h-5 ${i < Math.floor(agency.stats.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-gray-600">{agency.stats.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-gray-500">{agency.stats.reviews_count || 0} reviews</span>
                </div>
              )}
            </div>
            
            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
              <div className="space-y-4">
                {agency.contact_info?.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <a href={`mailto:${agency.contact_info.email}`} className="font-medium hover:text-blue-600">
                        {agency.contact_info.email}
                      </a>
                    </div>
                  </div>
                )}
                
                {agency.contact_info?.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <a href={`tel:${agency.contact_info.phone}`} className="font-medium hover:text-blue-600">
                        {agency.contact_info.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {agency.contact_info?.website && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Globe className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Website</p>
                      <a 
                        href={agency.contact_info.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-medium hover:text-blue-600 flex items-center gap-1"
                      >
                        <span>{agency.contact_info.website.replace(/^https?:\/\//, '')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Social Links */}
              {agency.social_links && Object.values(agency.social_links).some(link => !!link) && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-3">Social Media</h3>
                  <div className="flex gap-3">
                    {agency.social_links.facebook && (
                      <a 
                        href={agency.social_links.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                      >
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                    {agency.social_links.instagram && (
                      <a 
                        href={agency.social_links.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {agency.social_links.linkedin && (
                      <a 
                        href={agency.social_links.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {agency.social_links.twitter && (
                      <a 
                        href={agency.social_links.twitter} 
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
                  href={`tel:${agency.contact_info?.phone}`}
                  className="block w-full py-3 text-center border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                >
                  Call Agency
                </a>
              </div>
            </div>
            
            {/* Locations */}
            {agency.locations && agency.locations.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Locations</h2>
                  <button
                    onClick={() => setShowMap(!showMap)}
                    className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                  >
                    <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
                    <Map className="w-4 h-4" />
                  </button>
                </div>
                
                {showMap && (
                  <div className="h-48 bg-gray-200 rounded-lg mb-4">
                    {/* Map would go here - using placeholder for now */}
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">Map View</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4">
                  {agency.locations.map((location: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {location.is_headquarters && (
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full mr-2">
                              HQ
                            </span>
                          )}
                          {location.address}
                        </p>
                        <p className="text-sm text-gray-600">
                          {location.city}, {location.state} {location.postal_code}
                        </p>
                        {location.phone && (
                          <a href={`tel:${location.phone}`} className="text-sm text-blue-600 hover:underline mt-1 inline-block">
                            {location.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              <h2 className="text-xl font-semibold">Contact {agency.name}</h2>
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