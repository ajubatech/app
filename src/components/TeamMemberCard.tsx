import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Verified as CheckVerified } from 'lucide-react';

interface TeamMemberCardProps {
  member: {
    id: string;
    user_id: string;
    full_name: string;
    position: string;
    avatar_url: string;
    stats: {
      listings_count: number;
      sold_count: number;
    };
    verified?: boolean;
  };
}

export default function TeamMemberCard({ member }: TeamMemberCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-sm overflow-hidden border"
    >
      <Link to={`/lister/${member.user_id}`} className="block">
        <div className="p-6">
          <div className="flex items-center gap-4">
            <img 
              src={member.avatar_url} 
              alt={member.full_name} 
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-1">
                <h3 className="font-semibold">{member.full_name}</h3>
                {member.verified && (
                  <CheckVerified className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <p className="text-gray-600 text-sm">{member.position}</p>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="p-2 bg-gray-50 rounded text-center">
              <p className="text-lg font-semibold">{member.stats.listings_count}</p>
              <p className="text-xs text-gray-600">Listings</p>
            </div>
            <div className="p-2 bg-gray-50 rounded text-center">
              <p className="text-lg font-semibold">{member.stats.sold_count}</p>
              <p className="text-xs text-gray-600">Sold</p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}