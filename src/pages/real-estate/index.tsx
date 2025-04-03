import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, List, Map as MapIcon, Filter, X, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PropertyMap from '../../components/PropertyMap';
import PropertyCard from '../../components/PropertyCard';
import ListingFilters from '../../components/ListingFilters';
import toast from 'react-hot-toast';

type ViewMode = 'list' | 'map';
type SaleType = 'for_sale' | 'for_rent' | 'sold';

interface Filters {
  saleType: SaleType;
  propertyType: string[];
  priceRange: [number, number];
  beds: number | null;
  baths: number | null;
  keywords: string[];
  minLandSize: number | null;
  minFloorArea: number | null;
}

export default function RealEstatePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    saleType: 'for_sale',
    propertyType: [],
    priceRange: [0, 10000000],
    beds: null,
    baths: null,
    keywords: [],
    minLandSize: null,
    minFloorArea: null
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProperties();
  }, [filters]);

  const loadProperties = async () => {
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
          real_estate_metadata (
            *
          ),
          users (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('category', 'real_estate')
        .eq('status', 'active');

      // Apply filters
      if (filters.propertyType.length > 0) {
        query = query.in('real_estate_metadata.property_type', filters.propertyType);
      }

      if (filters.priceRange) {
        query = query
          .gte('price', filters.priceRange[0])
          .lte('price', filters.priceRange[1]);
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

      // Apply search query
      if (searchQuery) {
        query = query.textSearch('title', searchQuery);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProperties();
  };

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      saleType: 'for_sale',
      propertyType: [],
      priceRange: [0, 10000000],
      beds: null,
      baths: null,
      keywords: [],
      minLandSize: null,
      minFloorArea: null
    });
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold">Real Estate</h1>
            
            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="bg-gray-100 p-1 rounded-lg flex">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1 ${
                    viewMode === 'list'
                      ? 'bg-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">List</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1 ${
                    viewMode === 'map'
                      ? 'bg-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MapIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Map</span>
                </button>
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1 px-3 py-1.5 border rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by location, title, or keywords..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
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
                filters={filters} 
                onChange={handleFilterChange} 
                onClear={clearFilters}
              />
            </motion.div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {viewMode === 'map' ? (
              <div className="h-[calc(100vh-200px)] bg-white rounded-lg shadow-sm overflow-hidden">
                <PropertyMap 
                  properties={properties} 
                  loading={loading}
                />
              </div>
            ) : (
              <div>
                {/* Results Count */}
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-gray-600">
                    {loading ? 'Loading...' : `${properties.length} properties found`}
                  </p>
                  <select className="px-3 py-1.5 border rounded-lg text-sm">
                    <option>Sort: Newest</option>
                    <option>Sort: Price (Low to High)</option>
                    <option>Sort: Price (High to Low)</option>
                  </select>
                </div>

                {/* Property Grid */}
                {loading ? (
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
                    {properties.map((property) => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {!loading && properties.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No properties found</h3>
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