import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, MapPin, Verified as CheckVerified, Users } from 'lucide-react';

interface AgencyCardProps {
  agency: {
    id: string;
    name: string;
    slug: string;
    logo_url: string;
    locations: {
      city: string;
      state: string;
    }[];
    team_members: string[];
    stats: {
      listings_count: number;
      sold_count: number;
    };
    verified?: boolean;
    featured?: boolean;
  };
}

export default function AgencyCard({ agency }: AgencyCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-sm overflow-hidden border"
    >
      <Link to={`/agency/${agency.slug}`} className="block">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center p-2">
              <img 
                src={agency.logo_url} 
                alt={agency.name} 
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <h3 className="font-semibold">{agency.name}</h3>
                {agency.verified && (
                  <CheckVerified className="w-4 h-4 text-blue-600" />
                )}
              </div>
              {agency.locations && agency.locations.length > 0 && (
                <div className="flex items-center gap-1 text-gray-600 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{agency.locations[0].city}, {agency.locations[0].state}</span>
                </div>
              )}
              {agency.featured && (
                <span className="inline-block mt-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                  Featured
                </span>
              )}
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="p-2 bg-gray-50 rounded text-center">
              <p className="text-lg font-semibold">{agency.stats.listings_count}</p>
              <p className="text-xs text-gray-600">Listings</p>
            </div>
            <div className="p-2 bg-gray-50 rounded text-center">
              <p className="text-lg font-semibold">{agency.stats.sold_count}</p>
              <p className="text-xs text-gray-600">Sold</p>
            </div>
            <div className="p-2 bg-gray-50 rounded text-center">
              <div className="flex items-center justify-center gap-1">
                <Users className="w-4 h-4 text-gray-600" />
                <p className="text-lg font-semibold">{agency.team_members.length}</p>
              </div>
              <p className="text-xs text-gray-600">Agents</p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}