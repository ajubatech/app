import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles, ArrowRight, ShoppingBag, Building2, Car, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import ListAIOnboardingWidget from '../components/ListAIOnboardingWidget';
import { supabase } from '../lib/supabase';
import PropertyCard from '../components/PropertyCard';
import TeamMemberCard from '../components/TeamMemberCard';
import AgencyCard from '../components/AgencyCard';

export default function Home() {
  const [featuredListings, setFeaturedListings] = useState<any[]>([]);
  const [featuredAgents, setFeaturedAgents] = useState<any[]>([]);
  const [featuredAgencies, setFeaturedAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedContent();
  }, []);

  const loadFeaturedContent = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would fetch from Supabase
      // For now, we'll use mock data
      
      // Mock featured listings
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
        }
      ];
      
      // Mock featured agents
      const mockAgents = [
        {
          id: 'agent-1',
          user_id: 'user-1',
          full_name: 'Sarah Johnson',
          position: 'Principal Agent',
          avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          verified: true,
          stats: {
            listings_count: 12,
            sold_count: 45
          }
        },
        {
          id: 'agent-2',
          user_id: 'user-2',
          full_name: 'Michael Chen',
          position: 'Senior Agent',
          avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          verified: true,
          stats: {
            listings_count: 8,
            sold_count: 32
          }
        },
        {
          id: 'agent-3',
          user_id: 'user-3',
          full_name: 'Emma Wilson',
          position: 'Property Manager',
          avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          stats: {
            listings_count: 15,
            sold_count: 28
          }
        }
      ];
      
      // Mock featured agencies
      const mockAgencies = [
        {
          id: 'agency-1',
          name: 'Premier Real Estate',
          slug: 'premier-real-estate',
          logo_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=300&q=80',
          locations: [
            {
              city: 'Auckland',
              state: 'Auckland'
            }
          ],
          team_members: ['user-1', 'user-2', 'user-3'],
          stats: {
            listings_count: 45,
            sold_count: 120
          },
          verified: true,
          featured: true
        },
        {
          id: 'agency-2',
          name: 'City Living Realty',
          slug: 'city-living-realty',
          logo_url: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=300&q=80',
          locations: [
            {
              city: 'Wellington',
              state: 'Wellington'
            }
          ],
          team_members: ['user-4', 'user-5'],
          stats: {
            listings_count: 32,
            sold_count: 87
          },
          verified: true
        }
      ];
      
      setFeaturedListings(mockListings);
      setFeaturedAgents(mockAgents);
      setFeaturedAgencies(mockAgencies);
    } catch (error) {
      console.error('Error loading featured content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTryFullExperience = () => {
    // Open the ListAI chat widget
    const listAIWidget = document.getElementById('listai-widget-button');
    if (listAIWidget) {
      listAIWidget.click();
    } else {
      // Fallback - scroll to the categories section
      const categoriesSection = document.getElementById('categories-section');
      if (categoriesSection) {
        categoriesSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="text-center py-16 px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Your AI-Powered<br />Community Marketplace
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Buy, sell, rent, and discover with the power of AI at your fingertips.
        </p>
        
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products, properties, services..."
              className="w-full px-6 py-4 pr-32 rounded-full text-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 px-6 py-2 rounded-full text-white hover:opacity-90 transition-opacity">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* AI Assistant Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">AI-Powered Experience</span>
              </div>
              
              <h2 className="text-3xl font-bold mb-4">
                Your Personal Marketplace Assistant
              </h2>
              <p className="text-gray-600 mb-6">
                Our AI helps you find exactly what you're looking for, create better listings,
                and connect with the right people. It's like having a personal shopping and
                selling companion.
              </p>
              
              <ul className="space-y-3 mb-8">
                {[
                  'Get tailored recommendations based on your preferences',
                  'Generate professional descriptions for your listings',
                  'Analyze market prices to optimize your listings',
                  'Receive insights on trending items and categories'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-blue-600" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTryFullExperience}
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Try the Full AI Experience
              </motion.button>
            </div>

            <div className="flex-1 bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold">ListAI</h3>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-gray-600">
                  Hi there! I'm your ListAI assistant. How can I help you today?
                </p>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask about products, properties, or services..."
                  className="w-full px-4 py-3 pr-12 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleTryFullExperience();
                    }
                  }}
                />
                <button 
                  onClick={handleTryFullExperience}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-700"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings Section */}
      {featuredListings.length > 0 && (
        <section className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Featured Properties</h2>
            <Link to="/real-estate/category/all" className="text-blue-600 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <PropertyCard key={listing.id} property={listing} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Agents Section */}
      {featuredAgents.length > 0 && (
        <section className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Featured Agents</h2>
            <Link to="/explore?type=agents" className="text-blue-600 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredAgents.map((agent) => (
              <TeamMemberCard key={agent.id} member={agent} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Agencies Section */}
      {featuredAgencies.length > 0 && (
        <section className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Featured Agencies</h2>
            <Link to="/explore?type=agencies" className="text-blue-600 hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredAgencies.map((agency) => (
              <AgencyCard key={agency.id} agency={agency} />
            ))}
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section id="categories-section" className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">Explore Categories</h2>
        <p className="text-gray-600 text-center mb-12">
          Discover everything our marketplace has to offer
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div key={category.name} className="bg-white rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className={`w-12 h-12 rounded-xl ${category.bgColor} flex items-center justify-center mb-4`}>
                {category.icon}
              </div>
              
              <h3 className="text-xl font-semibold mb-4">{category.name}</h3>
              
              <div className="space-y-3">
                {category.subcategories.map((sub) => (
                  <Link
                    key={sub.name}
                    to={sub.link}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
                  >
                    {sub.icon}
                    <span>{sub.name}</span>
                  </Link>
                ))}
              </div>

              <Link
                to={category.viewAllLink}
                className="inline-flex items-center gap-2 text-blue-600 font-medium mt-6 hover:text-blue-700"
              >
                <span>Browse All {category.name}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ListAI Onboarding Widget */}
      <ListAIOnboardingWidget />
    </div>
  );
}

const categories = [
  {
    name: 'Products',
    icon: <ShoppingBag className="w-6 h-6 text-blue-600" />,
    bgColor: 'bg-blue-50',
    viewAllLink: '/products/category/all',
    subcategories: [
      { name: 'Fashion', icon: <ShoppingBag className="w-4 h-4" />, link: '/products/category/fashion' },
      { name: 'Electronics', icon: <ShoppingBag className="w-4 h-4" />, link: '/products/category/electronics' },
      { name: 'Home & Garden', icon: <ShoppingBag className="w-4 h-4" />, link: '/products/category/home-garden' },
      { name: 'Food & Drink', icon: <ShoppingBag className="w-4 h-4" />, link: '/products/category/food-drink' }
    ]
  },
  {
    name: 'Real Estate',
    icon: <Building2 className="w-6 h-6 text-green-600" />,
    bgColor: 'bg-green-50',
    viewAllLink: '/real-estate/category/all',
    subcategories: [
      { name: 'For Sale', icon: <Building2 className="w-4 h-4" />, link: '/real-estate/category/for-sale' },
      { name: 'For Rent', icon: <Building2 className="w-4 h-4" />, link: '/real-estate/category/for-rent' },
      { name: 'Commercial', icon: <Building2 className="w-4 h-4" />, link: '/real-estate/category/commercial' },
      { name: 'Land', icon: <Building2 className="w-4 h-4" />, link: '/real-estate/category/land' }
    ]
  },
  {
    name: 'Automotive',
    icon: <Car className="w-6 h-6 text-orange-600" />,
    bgColor: 'bg-orange-50',
    viewAllLink: '/automotive/category/all',
    subcategories: [
      { name: 'Vehicles', icon: <Car className="w-4 h-4" />, link: '/automotive/category/vehicles' },
      { name: 'Parts', icon: <Car className="w-4 h-4" />, link: '/automotive/category/parts' },
      { name: 'Repairs', icon: <Car className="w-4 h-4" />, link: '/automotive/category/repairs' }
    ]
  },
  {
    name: 'Services',
    icon: <Wrench className="w-6 h-6 text-purple-600" />,
    bgColor: 'bg-purple-50',
    viewAllLink: '/services/category/all',
    subcategories: [
      { name: 'Home Services', icon: <Wrench className="w-4 h-4" />, link: '/services/category/home' },
      { name: 'Creative', icon: <Wrench className="w-4 h-4" />, link: '/services/category/creative' },
      { name: 'Personal Care', icon: <Wrench className="w-4 h-4" />, link: '/services/category/personal-care' },
      { name: 'Health', icon: <Wrench className="w-4 h-4" />, link: '/services/category/health' },
      { name: 'Education', icon: <Wrench className="w-4 h-4" />, link: '/services/category/education' }
    ]
  }
];