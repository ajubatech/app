import React from 'react';
import { List, Map as MapIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface MapToggleProps {
  view: 'list' | 'map';
  onChange: (view: 'list' | 'map') => void;
}

export default function MapToggle({ view, onChange }: MapToggleProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-full shadow-md p-1 inline-flex"
    >
      <button
        onClick={() => onChange('list')}
        className={`px-4 py-2 rounded-full flex items-center gap-2 ${
          view === 'list'
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <List className="w-4 h-4" />
        <span>List</span>
      </button>
      <button
        onClick={() => onChange('map')}
        className={`px-4 py-2 rounded-full flex items-center gap-2 ${
          view === 'map'
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <MapIcon className="w-4 h-4" />
        <span>Map</span>
      </button>
    </motion.div>
  );
}