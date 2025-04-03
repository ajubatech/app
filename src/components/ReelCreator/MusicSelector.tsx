import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Music, Play, Pause, Crown } from 'lucide-react';
import { useReelStore } from '../../store/reelStore';
import { MusicTrack } from '../../types';
import { Slider } from '../ui/slider';

interface MusicSelectorProps {
  onSelect: (music: MusicTrack) => void;
  onClose: () => void;
}

export default function MusicSelector({ onSelect, onClose }: MusicSelectorProps) {
  const { musicLibrary, loadMusicLibrary, isLoading } = useReelStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTracks, setFilteredTracks] = useState<MusicTrack[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    loadMusicLibrary();
  }, []);
  
  useEffect(() => {
    // Filter tracks based on search term and category
    let filtered = [...musicLibrary];
    
    if (searchTerm) {
      filtered = filtered.filter(track => 
        track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(track => track.category === selectedCategory);
    }
    
    setFilteredTracks(filtered);
  }, [musicLibrary, searchTerm, selectedCategory]);
  
  const handlePlayPause = (trackId: string, url: string) => {
    if (playingTrack === trackId) {
      // Pause current track
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingTrack(null);
    } else {
      // Play new track
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      audioRef.current = new Audio(url);
      audioRef.current.play();
      setPlayingTrack(trackId);
      
      // Add ended event listener
      audioRef.current.addEventListener('ended', () => {
        setPlayingTrack(null);
      });
    }
  };
  
  // Get unique categories
  const categories = ['All', ...Array.from(new Set(musicLibrary.map(track => track.category)))];
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-gray-800 rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Select Music</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="relative mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search music..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        <div className="max-h-[50vh] overflow-y-auto p-4 pt-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredTracks.length === 0 ? (
            <div className="text-center py-8">
              <Music className="w-12 h-12 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400">No music tracks found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTracks.map((track) => (
                <div
                  key={track.id}
                  className={`p-3 rounded-lg ${
                    playingTrack === track.id ? 'bg-blue-900/50' : 'bg-gray-700'
                  } hover:bg-gray-600 transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePlayPause(track.id, track.url)}
                      className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center"
                    >
                      {playingTrack === track.id ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{track.title}</p>
                        {track.isPremium && (
                          <Crown className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                    </div>
                    
                    <button
                      onClick={() => onSelect(track)}
                      className="px-3 py-1 bg-blue-600 rounded-lg text-sm hover:bg-blue-700"
                    >
                      Select
                    </button>
                  </div>
                  
                  {playingTrack === track.id && (
                    <div className="mt-3">
                      <Slider
                        defaultValue={[0]}
                        max={track.duration}
                        step={1}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-xs mt-1">
                        <span>0:00</span>
                        <span>{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}