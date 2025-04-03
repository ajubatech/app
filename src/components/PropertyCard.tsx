import React from 'react';
import { Link } from 'react-router-dom';
import { Bed, Bath, Car, Ruler, Heart, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistance } from 'date-fns';

interface PropertyCardProps {
  property: any;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const mainImage = property.media?.find((m: any) => m.tag === 'Main Photo')?.url || 
                    property.media?.[0]?.url || 
                    'https://via.placeholder.com/400x300';
  
  const metadata = property.real_estate_metadata || {};
  
  // Banner styles
  const getBannerStyle = (style: string) => {
    switch (style) {
      case 'primary':
        return 'bg-blue-600 text-white';
      case 'success':
        return 'bg-green-600 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'danger':
        return 'bg-red-600 text-white';
      case 'info':
        return 'bg-purple-600 text-white';
      default:
        return 'bg-gray-800 text-white';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-sm overflow-hidden"
    >
      <Link to={`/real-estate/${property.id}`} className="block">
        <div className="relative">
          <img 
            src={mainImage} 
            alt={property.title} 
            className="w-full h-48 object-cover"
          />
          
          {/* Banner */}
          {property.status === 'sold' && (
            <div className="absolute top-3 left-0 bg-red-600 text-white px-4 py-1 text-sm font-medium">
              Sold
            </div>
          )}
          
          {/* Custom Banner */}
          {property.banner_text && property.banner_style && (
            <div className={`absolute top-3 left-0 ${
              getBannerStyle(property.banner_style)
            } px-4 py-1 text-sm font-medium`}>
              {property.banner_text}
            </div>
          )}
          
          {/* Legacy Banner Support */}
          {property.metadata?.banner && !property.banner_text && (
            <div className={`absolute top-3 left-0 ${
              getBannerStyle(property.metadata.banner.style)
            } px-4 py-1 text-sm font-medium`}>
              {property.metadata.banner.text}
            </div>
          )}
          
          {/* Price */}
          <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-md font-bold">
            ${property.price.toLocaleString()}
          </div>
          
          {/* Save Button */}
          <button className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white">
            <Heart className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        <div className="p-4">
          <h3 className="font-medium text-lg mb-1 line-clamp-1">{property.title}</h3>
          
          {property.location?.address && (
            <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{property.location.address}</span>
            </div>
          )}
          
          {/* Property Features */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {metadata.bedrooms !== undefined && (
              <div className="flex items-center gap-1">
                <Bed className="w-4 h-4" />
                <span>{metadata.bedrooms}</span>
              </div>
            )}
            
            {metadata.bathrooms !== undefined && (
              <div className="flex items-center gap-1">
                <Bath className="w-4 h-4" />
                <span>{metadata.bathrooms}</span>
              </div>
            )}
            
            {metadata.parking !== undefined && (
              <div className="flex items-center gap-1">
                <Car className="w-4 h-4" />
                <span>{metadata.parking}</span>
              </div>
            )}
            
            {metadata.floor_area !== undefined && (
              <div className="flex items-center gap-1">
                <Ruler className="w-4 h-4" />
                <span>{metadata.floor_area}m²</span>
              </div>
            )}
          </div>
          
          {/* Listed Time */}
          <div className="mt-3 text-xs text-gray-500">
            Listed {formatDistance(new Date(property.created_at), new Date(), { addSuffix: true })}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}