import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, ExternalLink, Pause, Play, VolumeX, Volume2, Music, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface ReelPlayerProps {
  reel: {
    id: string;
    url: string;
    caption?: string;
    hashtags?: string[];
    user?: {
      id: string;
      full_name: string;
      avatar_url: string;
    };
    listing?: {
      id: string;
      title: string;
      category: string;
      price: number;
    };
    music?: {
      title: string;
      artist: string;
    };
    likes: number;
    comments: number;
  };
  onLike?: () => void;
  onComment?: () => void;
  autoPlay?: boolean;
  inView?: boolean;
}

export default function ReelPlayer({ reel, onLike, onComment, autoPlay = true, inView = true }: ReelPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [comment, setComment] = useState('');
  const [progress, setProgress] = useState(0);
  const { user } = useAuthStore();

  useEffect(() => {
    if (videoRef.current) {
      if (inView && isPlaying) {
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [inView, isPlaying]);

  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('reel_engagements')
          .select('id')
          .eq('reel_id', reel.id)
          .eq('user_id', user.id)
          .eq('type', 'like')
          .single();
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        setIsLiked(!!data);
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };
    
    checkLikeStatus();
  }, [reel.id, user]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like reels');
      return;
    }

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('reel_engagements')
          .delete()
          .eq('reel_id', reel.id)
          .eq('user_id', user.id)
          .eq('type', 'like');
        
        if (error) throw error;
        
        setIsLiked(false);
      } else {
        // Like
        const { error } = await supabase
          .from('reel_engagements')
          .insert({
            reel_id: reel.id,
            user_id: user.id,
            type: 'like'
          });
        
        if (error) throw error;
        
        setIsLiked(true);
      }
      
      onLike?.();
    } catch (error) {
      console.error('Error liking/unliking reel:', error);
      toast.error('Failed to update like status');
    }
  };

  const handleComment = async () => {
    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!comment.trim()) return;

    try {
      const { error } = await supabase
        .from('reel_engagements')
        .insert({
          reel_id: reel.id,
          user_id: user.id,
          type: 'comment',
          comment_text: comment.trim()
        });

      if (error) throw error;

      setComment('');
      onComment?.();
      toast.success('Comment added!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleShare = async (platform: string) => {
    if (!user) {
      toast.error('Please sign in to share reels');
      return;
    }

    try {
      const { error } = await supabase
        .from('social_shares')
        .insert({
          reel_id: reel.id,
          user_id: user.id,
          platform,
          status: 'pending'
        });

      if (error) throw error;

      toast.success(`Sharing to ${platform}...`);
      setShowShare(false);
    } catch (error) {
      console.error('Error sharing reel:', error);
      toast.error('Failed to share reel');
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  return (
    <div className="relative aspect-[9/16] bg-black">
      {/* Video */}
      <video
        ref={videoRef}
        src={reel.url}
        className="w-full h-full object-cover"
        loop
        muted={isMuted}
        playsInline
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
        <div 
          className="h-full bg-white"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            className="p-4 bg-white/20 backdrop-blur-sm rounded-full"
          >
            <Play className="w-8 h-8 text-white" fill="white" />
          </motion.button>
        </div>
      )}

      {/* Top Gradient */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none"></div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>

      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        {reel.user && (
          <Link to={`/lister/${reel.user.id}`} className="flex items-center gap-2">
            <img 
              src={reel.user.avatar_url || 'https://via.placeholder.com/40'} 
              alt={reel.user.full_name} 
              className="w-10 h-10 rounded-full border-2 border-white"
            />
            <span className="font-medium text-white">{reel.user.full_name}</span>
          </Link>
        )}
        
        <button
          onClick={toggleMute}
          className="p-2 bg-black/30 rounded-full"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-white" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="absolute right-4 bottom-20 flex flex-col gap-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLike}
          className="p-3 rounded-full bg-black/30 backdrop-blur-sm flex flex-col items-center"
        >
          <Heart className={`w-7 h-7 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          <span className="text-xs text-white mt-1">{reel.likes}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowComments(true)}
          className="p-3 rounded-full bg-black/30 backdrop-blur-sm flex flex-col items-center"
        >
          <MessageCircle className="w-7 h-7 text-white" />
          <span className="text-xs text-white mt-1">{reel.comments}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowShare(true)}
          className="p-3 rounded-full bg-black/30 backdrop-blur-sm"
        >
          <Share2 className="w-7 h-7 text-white" />
        </motion.button>
      </div>

      {/* Caption & Info */}
      <div className="absolute left-4 right-16 bottom-20">
        {reel.listing && (
          <Link 
            to={`/${reel.listing.category}/${reel.listing.id}`}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg mb-3 w-fit"
          >
            <span>${reel.listing.price.toLocaleString()}</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        )}
        
        {reel.caption && (
          <p className="text-white mb-2 line-clamp-2">{reel.caption}</p>
        )}
        
        {reel.hashtags && reel.hashtags.length > 0 && (
          <p className="text-blue-300 text-sm">
            {reel.hashtags.join(' ')}
          </p>
        )}
        
        {reel.music && (
          <div className="flex items-center gap-2 mt-3">
            <Music className="w-4 h-4 text-white" />
            <div className="overflow-hidden">
              <div className="animate-marquee whitespace-nowrap">
                <span className="text-sm text-white">{reel.music.title} · {reel.music.artist}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comments Drawer */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute inset-x-0 bottom-0 bg-gray-900 rounded-t-2xl p-4 h-2/3 z-10"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Comments</h3>
                <button
                  onClick={() => setShowComments(false)}
                  className="p-2 hover:bg-gray-800 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto">
                {/* Sample Comment */}
                <div className="flex items-start gap-3 p-3">
                  <div className="w-8 h-8 bg-gray-700 rounded-full" />
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-gray-400">Great reel! Love the property.</p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>
              </div>

              {/* Comment Input */}
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleComment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700"
                >
                  Post
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Drawer */}
      <AnimatePresence>
        {showShare && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute inset-x-0 bottom-0 bg-gray-900 rounded-t-2xl p-4 z-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Share to</h3>
              <button
                onClick={() => setShowShare(false)}
                className="p-2 hover:bg-gray-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleShare('instagram')}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-500 rounded-full flex items-center justify-center">
                  <Instagram className="w-8 h-8 text-white" />
                </div>
                <span>Instagram</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleShare('facebook')}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <Facebook className="w-8 h-8 text-white" />
                </div>
                <span>Facebook</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleShare('twitter')}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center">
                  <Twitter className="w-8 h-8 text-white" />
                </div>
                <span>Twitter</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleShare('tiktok')}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                  <TikTok className="w-8 h-8 text-white" />
                </div>
                <span>TikTok</span>
              </motion.button>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied to clipboard');
                  setShowShare(false);
                }}
                className="px-6 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
              >
                Copy Link
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Import these at the top of the file
import { Instagram, Facebook, Twitter, TikTok, Square } from 'lucide-react';