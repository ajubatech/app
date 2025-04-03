import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Sparkles, Plus, MapPin, Home, Package, Car, Wrench, Cat } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useInView } from 'react-intersection-observer';
import PropertyCard from '../components/PropertyCard';
import ListingFilters from '../components/ListingFilters';
import MapToggle from '../components/MapToggle';
import PropertyMap from '../components/PropertyMap';
import toast from 'react-hot-toast';

type Category = 'all' | 'real_estate' | 'products' | 'services' | 'pets' | 'automotive';
type SortType = 'trending' | 'newest' | 'ai_suggested';
type ViewMode = 'list' | 'map';

interface Filters {
  priceRange: [number, number];
  category: Category;
  sort: SortType;
  location?: string;
  features?: string[];
  saleType?: string;
  propertyType?: string[];
  beds?: number | null;
  baths?: number | null;
  minLandSize?: number | null;
  minFloorArea?: number | null;
}

export default function Explore() {
  const [filters, setFilters] = useState<Filters>({
    priceRange: [0, 1000000],
    category: 'all',
    sort: 'newest'
  });
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const { ref: loadMoreRef, inView } = useInView();

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMore();
    }
  }, [inView]);

  useEffect(() => {
    // Reset and load when filters change
    setItems([]);
    setPage(1);
    setHasMore(true);
    loadItems();
  }, [filters, viewMode]);

  const loadItems = async () => {
    try {
      setLoading(true);

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
          real_estate_metadata (*),
          product_metadata (*),
          service_metadata (*),
          pet_metadata (*),
          automotive_metadata (*),
          users (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'active')
        .range((page - 1) * 20, page * 20 - 1);

      // Apply filters
      if (filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      if (searchQuery) {
        query = query.textSearch('title', searchQuery);
      }

      if (filters.priceRange) {
        query = query
          .gte('price', filters.priceRange[0])
          .lte('price', filters.priceRange[1]);
      }

      // Apply real estate specific filters
      if (filters.category === 'real_estate') {
        if (filters.propertyType && filters.propertyType.length > 0) {
          query = query.in('real_estate_metadata.property_type', filters.propertyType);
        }

        if (filters.beds) {
          query = query.gte('real_estate_metadata.bedrooms', filters.beds);
        }

        if (filters.baths) {
          query = query.gte('real_estate_metadata.bathrooms', filters.baths);
        }

        if (filters.minLandSize) {
          query = query.gte('real_estate_metadata.land_size', filters.minLandSize);
        }

        if (filters.minFloorArea) {
          query = query.gte('real_estate_metadata.floor_area', filters.minFloorArea);
        }
      }

      switch (filters.sort) {
        case 'trending':
          query = query.order('views', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'ai_suggested':
          // Get AI recommendations first
          const { data: aiRecs } = await supabase.functions.invoke('get-recommendations', {
            body: { user_id: 'current_user' }
          });
          if (aiRecs?.listing_ids) {
            query = query.in('id', aiRecs.listing_ids);
          }
          break;
      }

      const { data, error } = await query;

      if (error) throw error;

      setItems(prev => [...prev, ...(data || [])]);
      setHasMore(data?.length === 20);
    } catch (error) {
      console.error('Error loading items:', error);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
    loadItems();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setItems([]);
    setPage(1);
    setHasMore(true);
    loadItems();
  };

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      priceRange: [0, 1000000],
      category: 'all',
      sort: 'newest'
    });
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Explore</h1>
          <div className="flex items-center gap-4">
            <MapToggle view={viewMode} onChange={setViewMode} />
            <Link
              to="/create-listing"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Create Listing
            </Link>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search listings..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Search
                </button>
              </form>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, sort: 'ai_suggested' }))}
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100"
            >
              <Sparkles className="w-5 h-5" />
              AI Suggestions
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setFilters(prev => ({ ...prev, category: category.id as Category }))}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg whitespace-nowrap ${
                  filters.category === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon}
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="md:w-64 bg-white p-4 rounded-lg shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="md:hidden p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <ListingFilters 
                filters={{
                  saleType: filters.saleType || 'for_sale',
                  propertyType: filters.propertyType || [],
                  priceRange: filters.priceRange,
                  beds: filters.beds || null,
                  baths: filters.baths || null,
                  keywords: filters.features || [],
                  minLandSize: filters.minLandSize || null,
                  minFloorArea: filters.minFloorArea || null
                }}
                onChange={handleFilterChange}
                onClear={clearFilters}
              />
            </motion.div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {viewMode === 'map' && filters.category === 'real_estate' ? (
              <div className="h-[calc(100vh-200px)] bg-white rounded-lg shadow-sm overflow-hidden">
                <PropertyMap 
                  properties={items} 
                  loading={loading}
                />
              </div>
            ) : (
              <div>
                {/* Results Count */}
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-gray-600">
                    {loading ? 'Loading...' : `${items.length} listings found`}
                  </p>
                  <select 
                    value={filters.sort}
                    onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value as SortType }))}
                    className="px-3 py-1.5 border rounded-lg text-sm"
                  >
                    <option value="newest">Sort: Newest</option>
                    <option value="trending">Sort: Most Viewed</option>
                    <option value="ai_suggested">Sort: AI Suggested</option>
                  </select>
                </div>

                {/* Listing Grid */}
                {loading && items.length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                        <div className="h-48 bg-gray-200"></div>
                        <div className="p-4">
                          <div className="h-6 bg-gray-200 rounded mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                          <div className="flex gap-2">
                            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                      filters.category === 'real_estate' || item.category === 'real_estate' ? (
                        <PropertyCard key={item.id} property={item} />
                      ) : (
                        <motion.div
                          key={item.id}
                          whileHover={{ y: -5 }}
                          className="bg-white rounded-lg shadow-sm overflow-hidden"
                        >
                          <Link to={`/${item.category}/${item.id}`}>
                            <div className="relative">
                              <img
                                src={item.media?.[0]?.url || 'https://via.placeholder.com/400x300'}
                                alt={item.title}
                                className="w-full h-48 object-cover"
                              />
                              
                              {/* Banner */}
                              {item.metadata?.banner && (
                                <div className={`absolute top-3 left-0 ${
                                  item.metadata.banner.style === 'primary' 
                                    ? 'bg-blue-600 text-white' 
                                    : item.metadata.banner.style === 'success'
                                    ? 'bg-green-600 text-white'
                                    : item.metadata.banner.style === 'warning'
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-gray-800 text-white'
                                } px-4 py-1 text-sm font-medium`}>
                                  {item.metadata.banner.text}
                                </div>
                              )}
                              
                              {/* Price */}
                              <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-md font-bold">
                                ${item.price.toLocaleString()}
                              </div>
                            </div>
                            
                            <div className="p-4">
                              <h3 className="font-medium text-lg mb-1 line-clamp-1">{item.title}</h3>
                              
                              {item.location?.address && (
                                <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
                                  <MapPin className="w-4 h-4" />
                                  <span className="line-clamp-1">{item.location.address}</span>
                                </div>
                              )}
                              
                              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                {item.description}
                              </p>
                              
                              <div className="text-xs text-gray-500">
                                Listed {new Date(item.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      )
                    ))}
                  </div>
                )}

                {/* Load More */}
                {hasMore && (
                  <div ref={loadMoreRef} className="text-center mt-8">
                    {loading ? (
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : (
                      <button
                        onClick={loadMore}
                        className="px-6 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Load More
                      </button>
                    )}
                  </div>
                )}

                {/* Empty State */}
                {!loading && items.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No listings found</h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your filters or search criteria
                    </p>
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const categories = [
  { id: 'all', name: 'All', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'real_estate', name: 'Real Estate', icon: <Home className="w-4 h-4" /> },
  { id: 'products', name: 'Products', icon: <Package className="w-4 h-4" /> },
  { id: 'services', name: 'Services', icon: <Wrench className="w-4 h-4" /> },
  { id: 'pets', name: 'Pets', icon: <Cat className="w-4 h-4" /> },
  { id: 'automotive', name: 'Automotive', icon: <Car className="w-4 h-4" /> }
];