import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Video, Upload, Sparkles, Music, Sticker, 
  Type, Sliders, Share2, Save, Loader2, X, Check, 
  Camera, Mic, Play, Pause, Trash2, Plus, Instagram, 
  Facebook, Twitter, Linkedin, TikTok, ChevronRight
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useReelStore } from '../../store/reelStore';
import toast from 'react-hot-toast';
import { Slider } from '../ui/slider';
import MusicSelector from './MusicSelector';
import StickerSelector from './StickerSelector';
import TextOverlayEditor from './TextOverlayEditor';
import FilterSelector from './FilterSelector';
import CaptionGenerator from './CaptionGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface ReelCreatorProps {
  listingId?: string;
  onClose?: () => void;
}

export default function ReelCreator({ listingId, onClose }: ReelCreatorProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userRole } = useAuthStore();
  const { createReel, publishReel, setDraftReel, draftReel } = useReelStore();
  
  const [step, setStep] = useState<'record' | 'edit' | 'publish'>('record');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [selectedMusic, setSelectedMusic] = useState<any>(null);
  const [selectedStickers, setSelectedStickers] = useState<any[]>([]);
  const [textOverlays, setTextOverlays] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<any>(null);
  const [showMusicSelector, setShowMusicSelector] = useState(false);
  const [showStickerSelector, setShowStickerSelector] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [showFilterSelector, setShowFilterSelector] = useState(false);
  const [showCaptionGenerator, setShowCaptionGenerator] = useState(false);
  const [listing, setListing] = useState<any>(null);
  const [socialPlatforms, setSocialPlatforms] = useState<{
    instagram: boolean;
    facebook: boolean;
    twitter: boolean;
    tiktok: boolean;
    linkedin: boolean;
  }>({
    instagram: false,
    facebook: false,
    twitter: false,
    tiktok: false,
    linkedin: false
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  
  // Get listing ID from URL if not provided as prop
  useEffect(() => {
    if (!listingId) {
      const params = new URLSearchParams(location.search);
      const id = params.get('listingId');
      if (id) {
        loadListing(id);
      }
    } else {
      loadListing(listingId);
    }
    
    // Load draft reel if exists
    if (draftReel) {
      if (draftReel.caption) setCaption(draftReel.caption);
      if (draftReel.hashtags) setHashtags(draftReel.hashtags);
      // Other draft properties would be loaded here
    }
    
    return () => {
      // Clean up
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const loadListing = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setListing(data);
      
      // Pre-populate hashtags based on listing
      const listingHashtags = [
        `#${data.category}`,
        `#ListHouze`,
        `#${data.category === 'real_estate' ? 'RealEstate' : data.category}`
      ];
      
      setHashtags(listingHashtags);
      
      // Pre-populate caption
      setCaption(`Check out this amazing ${data.title} on ListHouze!`);
    } catch (error) {
      console.error('Error loading listing:', error);
      toast.error('Failed to load listing details');
    }
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.webm']
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file));
        setStep('edit');
      }
    }
  });
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/mp4' });
        const file = new File([blob], 'recorded-video.mp4', { type: 'video/mp4' });
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(blob));
        chunksRef.current = [];
        setStep('edit');
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      let time = 0;
      timerRef.current = window.setInterval(() => {
        time += 1;
        setRecordingTime(time);
        
        // Auto-stop after 60 seconds
        if (time >= 60) {
          stopRecording();
        }
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to access camera. Please check permissions.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setIsRecording(false);
    setRecordingTime(0);
  };
  
  const handleBack = () => {
    if (step === 'edit') {
      // Confirm going back to record step will lose edits
      if (confirm('Going back will discard your edits. Continue?')) {
        setVideoFile(null);
        setVideoPreview(null);
        setStep('record');
      }
    } else if (step === 'publish') {
      setStep('edit');
    } else if (onClose) {
      // Confirm closing will lose progress
      if (confirm('Are you sure you want to exit? Your progress will be lost.')) {
        onClose();
      }
    } else {
      navigate(-1);
    }
  };
  
  const handleNext = () => {
    if (step === 'record') {
      if (!videoFile) {
        toast.error('Please record or upload a video first');
        return;
      }
      setStep('edit');
    } else if (step === 'edit') {
      setStep('publish');
    }
  };
  
  const handleAddHashtag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const input = e.currentTarget;
      const value = input.value.trim().replace(/^#/, '');
      
      if (value && !hashtags.includes(`#${value}`)) {
        setHashtags([...hashtags, `#${value}`]);
        input.value = '';
      }
    }
  };
  
  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };
  
  const handlePublish = async () => {
    if (!videoFile || !user) return;
    
    try {
      setIsPublishing(true);
      
      // 1. Upload video to storage
      const videoFileName = `reels/${user.id}/${Date.now()}-${videoFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(videoFileName, videoFile);
      
      if (uploadError) throw uploadError;
      
      // 2. Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('videos')
        .getPublicUrl(videoFileName);
      
      const videoUrl = publicUrlData.publicUrl;
      
      // 3. Create media entry
      const { data: mediaData, error: mediaError } = await supabase
        .from('media')
        .insert({
          url: videoUrl,
          type: 'video',
          listing_id: listing?.id,
          tag: 'Reel'
        })
        .select()
        .single();
      
      if (mediaError) throw mediaError;
      
      // 4. Create reel
      const reelData = {
        user_id: user.id,
        listing_id: listing?.id,
        media_id: mediaData.id,
        title: listing?.title || 'My Reel',
        caption,
        hashtags,
        music: selectedMusic,
        effects: {
          filters: selectedFilter ? [selectedFilter.id] : [],
          stickers: selectedStickers,
          text_overlays: textOverlays
        },
        status: 'published',
        published_at: new Date().toISOString()
      };
      
      const { data: reelResult, error: reelError } = await supabase
        .from('reels')
        .insert(reelData)
        .select()
        .single();
      
      if (reelError) throw reelError;
      
      // 5. Create social shares if selected
      const selectedPlatforms = Object.entries(socialPlatforms)
        .filter(([_, selected]) => selected)
        .map(([platform]) => platform);
      
      if (selectedPlatforms.length > 0) {
        const sharePromises = selectedPlatforms.map(platform => 
          supabase
            .from('social_shares')
            .insert({
              reel_id: reelResult.id,
              user_id: user.id,
              platform,
              status: 'pending'
            })
        );
        
        await Promise.all(sharePromises);
      }
      
      toast.success('Reel published successfully!');
      
      // Navigate to the reel view
      navigate(`/reels?id=${reelResult.id}`);
    } catch (error) {
      console.error('Error publishing reel:', error);
      toast.error('Failed to publish reel');
    } finally {
      setIsPublishing(false);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Only allow lister or business users to create reels
  if (userRole !== 'lister' && userRole !== 'business') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
          <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Reels Creation</h2>
          <p className="text-gray-600 mb-6">
            Reels creation is only available for Lister and Business accounts.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-800 rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <h1 className="text-xl font-bold">
          {step === 'record' ? 'Create Reel' : 
           step === 'edit' ? 'Edit Reel' : 
           'Publish Reel'}
        </h1>
        
        {step !== 'publish' && (
          <button
            onClick={handleNext}
            disabled={!videoFile}
            className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 'record' ? 'Next' : 'Continue'}
          </button>
        )}
      </div>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-4">
        {step === 'record' && (
          <div className="space-y-8">
            {/* Video Preview */}
            <div className="aspect-[9/16] bg-black rounded-xl overflow-hidden relative">
              {isRecording ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-red-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    <span>REC {formatTime(recordingTime)}</span>
                  </div>
                </>
              ) : videoPreview ? (
                <video
                  src={videoPreview}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  {...getRootProps()}
                  className={`w-full h-full flex flex-col items-center justify-center ${
                    isDragActive ? 'bg-blue-900/30' : 'bg-gray-800/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-center text-gray-300 mb-2">
                    {isDragActive
                      ? 'Drop the video here'
                      : 'Drag & drop a video, or click to select'}
                  </p>
                  <p className="text-sm text-gray-400">
                    Max 60 seconds, up to 100MB
                  </p>
                </div>
              )}
            </div>
            
            {/* Recording Controls */}
            <div className="flex justify-center gap-4">
              {isRecording ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={stopRecording}
                  className="p-4 bg-red-600 rounded-full"
                >
                  <Square className="w-6 h-6" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startRecording}
                  className="p-4 bg-red-600 rounded-full"
                >
                  <Camera className="w-6 h-6" />
                </motion.button>
              )}
              
              {videoPreview && !isRecording && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setVideoFile(null);
                    setVideoPreview(null);
                  }}
                  className="p-4 bg-gray-700 rounded-full"
                >
                  <Trash2 className="w-6 h-6" />
                </motion.button>
              )}
            </div>
            
            {/* Tips */}
            <div className="bg-gray-800 p-4 rounded-xl">
              <h3 className="font-medium mb-2">Tips for Great Reels</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Keep it short and engaging (15-30 seconds)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Highlight key features of your listing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Use good lighting and steady camera movements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Add music and text to enhance your reel</span>
                </li>
              </ul>
            </div>
          </div>
        )}
        
        {step === 'edit' && videoPreview && (
          <div className="space-y-6">
            {/* Video Preview with Editing */}
            <div className="aspect-[9/16] bg-black rounded-xl overflow-hidden relative">
              <video
                src={videoPreview}
                controls
                className="w-full h-full object-cover"
              />
              
              {/* Overlays would be rendered here */}
              {selectedStickers.map((sticker, index) => (
                <div
                  key={index}
                  className="absolute"
                  style={{
                    top: `${sticker.position.y}%`,
                    left: `${sticker.position.x}%`,
                    transform: `scale(${sticker.scale}) rotate(${sticker.rotation}deg)`
                  }}
                >
                  <img src={sticker.url} alt={sticker.name} className="w-16 h-16" />
                </div>
              ))}
              
              {textOverlays.map((text, index) => (
                <div
                  key={index}
                  className="absolute"
                  style={{
                    top: `${text.position.y}%`,
                    left: `${text.position.x}%`,
                    color: text.style.color,
                    backgroundColor: text.style.background,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: `${text.style.size}px`,
                    fontFamily: text.style.font
                  }}
                >
                  {text.text}
                </div>
              ))}
              
              {/* Filter overlay */}
              {selectedFilter && (
                <div 
                  className="absolute inset-0"
                  style={{
                    backgroundColor: selectedFilter.color,
                    opacity: selectedFilter.strength,
                    mixBlendMode: 'overlay'
                  }}
                ></div>
              )}
            </div>
            
            {/* Editing Tools */}
            <div className="bg-gray-800 rounded-xl p-4">
              <Tabs defaultValue="effects">
                <TabsList className="w-full grid grid-cols-4 mb-4">
                  <TabsTrigger value="effects" className="data-[state=active]:bg-blue-600">
                    <div className="flex flex-col items-center gap-1">
                      <Sliders className="w-5 h-5" />
                      <span className="text-xs">Effects</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="music" className="data-[state=active]:bg-blue-600">
                    <div className="flex flex-col items-center gap-1">
                      <Music className="w-5 h-5" />
                      <span className="text-xs">Music</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="text" className="data-[state=active]:bg-blue-600">
                    <div className="flex flex-col items-center gap-1">
                      <Type className="w-5 h-5" />
                      <span className="text-xs">Text</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="stickers" className="data-[state=active]:bg-blue-600">
                    <div className="flex flex-col items-center gap-1">
                      <Sticker className="w-5 h-5" />
                      <span className="text-xs">Stickers</span>
                    </div>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="effects">
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowFilterSelector(true)}
                      className="w-full py-3 bg-gray-700 rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2"
                    >
                      <Sliders className="w-5 h-5" />
                      {selectedFilter ? 'Change Filter' : 'Add Filter'}
                    </button>
                    
                    {selectedFilter && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Filter Strength</span>
                          <span>{Math.round(selectedFilter.strength * 100)}%</span>
                        </div>
                        <Slider
                          value={[selectedFilter.strength * 100]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(value) => {
                            setSelectedFilter({
                              ...selectedFilter,
                              strength: value[0] / 100
                            });
                          }}
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="music">
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowMusicSelector(true)}
                      className="w-full py-3 bg-gray-700 rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2"
                    >
                      <Music className="w-5 h-5" />
                      {selectedMusic ? 'Change Music' : 'Add Music'}
                    </button>
                    
                    {selectedMusic && (
                      <div className="bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                            <Music className="w-6 h-6 text-gray-300" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{selectedMusic.title}</p>
                            <p className="text-sm text-gray-300">{selectedMusic.artist}</p>
                          </div>
                          <button
                            onClick={() => setSelectedMusic(null)}
                            className="p-2 hover:bg-gray-600 rounded-full"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="text">
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowTextEditor(true)}
                      className="w-full py-3 bg-gray-700 rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2"
                    >
                      <Type className="w-5 h-5" />
                      Add Text
                    </button>
                    
                    {textOverlays.length > 0 && (
                      <div className="space-y-2">
                        <p className="font-medium">Text Overlays</p>
                        <div className="space-y-2">
                          {textOverlays.map((text, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded-lg">
                              <span className="truncate">{text.text}</span>
                              <button
                                onClick={() => {
                                  setTextOverlays(textOverlays.filter((_, i) => i !== index));
                                }}
                                className="p-1 hover:bg-gray-600 rounded-full"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="stickers">
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowStickerSelector(true)}
                      className="w-full py-3 bg-gray-700 rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2"
                    >
                      <Sticker className="w-5 h-5" />
                      Add Stickers
                    </button>
                    
                    {selectedStickers.length > 0 && (
                      <div className="space-y-2">
                        <p className="font-medium">Applied Stickers</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedStickers.map((sticker, index) => (
                            <div key={index} className="relative">
                              <img 
                                src={sticker.url} 
                                alt={sticker.name} 
                                className="w-12 h-12 object-contain"
                              />
                              <button
                                onClick={() => {
                                  setSelectedStickers(selectedStickers.filter((_, i) => i !== index));
                                }}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
        
        {step === 'publish' && videoPreview && (
          <div className="space-y-6">
            {/* Video Preview */}
            <div className="aspect-[9/16] bg-black rounded-xl overflow-hidden">
              <video
                src={videoPreview}
                controls
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Caption & Hashtags */}
            <div className="bg-gray-800 rounded-xl p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Caption
                </label>
                <div className="relative">
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    placeholder="Write a caption..."
                  ></textarea>
                  <button
                    onClick={() => setShowCaptionGenerator(true)}
                    className="absolute right-2 bottom-2 p-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <Sparkles className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Hashtags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {hashtags.map((tag, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 rounded-full text-sm"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => handleRemoveHashtag(tag)}
                        className="hover:text-gray-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  placeholder="Add hashtags (press Enter)"
                  onKeyDown={handleAddHashtag}
                />
              </div>
            </div>
            
            {/* Social Sharing */}
            <div className="bg-gray-800 rounded-xl p-4 space-y-4">
              <h3 className="font-medium">Share to Social Media</h3>
              <div className="grid grid-cols-5 gap-2">
                <button
                  onClick={() => setSocialPlatforms(prev => ({ ...prev, instagram: !prev.instagram }))}
                  className={`p-3 rounded-lg flex flex-col items-center gap-1 ${
                    socialPlatforms.instagram ? 'bg-gradient-to-br from-purple-600 to-pink-500' : 'bg-gray-700'
                  }`}
                >
                  <Instagram className="w-6 h-6" />
                  <span className="text-xs">Instagram</span>
                </button>
                
                <button
                  onClick={() => setSocialPlatforms(prev => ({ ...prev, facebook: !prev.facebook }))}
                  className={`p-3 rounded-lg flex flex-col items-center gap-1 ${
                    socialPlatforms.facebook ? 'bg-blue-600' : 'bg-gray-700'
                  }`}
                >
                  <Facebook className="w-6 h-6" />
                  <span className="text-xs">Facebook</span>
                </button>
                
                <button
                  onClick={() => setSocialPlatforms(prev => ({ ...prev, twitter: !prev.twitter }))}
                  className={`p-3 rounded-lg flex flex-col items-center gap-1 ${
                    socialPlatforms.twitter ? 'bg-blue-400' : 'bg-gray-700'
                  }`}
                >
                  <Twitter className="w-6 h-6" />
                  <span className="text-xs">Twitter</span>
                </button>
                
                <button
                  onClick={() => setSocialPlatforms(prev => ({ ...prev, tiktok: !prev.tiktok }))}
                  className={`p-3 rounded-lg flex flex-col items-center gap-1 ${
                    socialPlatforms.tiktok ? 'bg-black' : 'bg-gray-700'
                  }`}
                >
                  <TikTok className="w-6 h-6" />
                  <span className="text-xs">TikTok</span>
                </button>
                
                <button
                  onClick={() => setSocialPlatforms(prev => ({ ...prev, linkedin: !prev.linkedin }))}
                  className={`p-3 rounded-lg flex flex-col items-center gap-1 ${
                    socialPlatforms.linkedin ? 'bg-blue-700' : 'bg-gray-700'
                  }`}
                >
                  <Linkedin className="w-6 h-6" />
                  <span className="text-xs">LinkedIn</span>
                </button>
              </div>
            </div>
            
            {/* Publish Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePublish}
              disabled={isPublishing}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Share2 className="w-6 h-6" />
                  Publish Reel
                </>
              )}
            </motion.button>
            
            {/* Save Draft Button */}
            <button
              onClick={() => {
                // Save draft
                setDraftReel({
                  caption,
                  hashtags,
                  music: selectedMusic,
                  effects: {
                    filters: selectedFilter ? [selectedFilter.id] : [],
                    stickers: selectedStickers,
                    text_overlays: textOverlays
                  }
                });
                toast.success('Draft saved');
              }}
              className="w-full py-3 border border-gray-600 rounded-xl font-medium hover:bg-gray-800 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save as Draft
            </button>
          </div>
        )}
      </div>
      
      {/* Modals */}
      <AnimatePresence>
        {showMusicSelector && (
          <MusicSelector
            onSelect={(music) => {
              setSelectedMusic(music);
              setShowMusicSelector(false);
            }}
            onClose={() => setShowMusicSelector(false)}
          />
        )}
        
        {showStickerSelector && (
          <StickerSelector
            onSelect={(sticker) => {
              setSelectedStickers([...selectedStickers, {
                ...sticker,
                position: { x: 50, y: 50 },
                scale: 1,
                rotation: 0
              }]);
              setShowStickerSelector(false);
            }}
            onClose={() => setShowStickerSelector(false)}
          />
        )}
        
        {showTextEditor && (
          <TextOverlayEditor
            onAdd={(text) => {
              setTextOverlays([...textOverlays, text]);
              setShowTextEditor(false);
            }}
            onClose={() => setShowTextEditor(false)}
          />
        )}
        
        {showFilterSelector && (
          <FilterSelector
            onSelect={(filter) => {
              setSelectedFilter(filter);
              setShowFilterSelector(false);
            }}
            onClose={() => setShowFilterSelector(false)}
          />
        )}
        
        {showCaptionGenerator && (
          <CaptionGenerator
            listing={listing}
            onSelect={(generatedCaption, generatedHashtags) => {
              setCaption(generatedCaption);
              setHashtags(generatedHashtags);
              setShowCaptionGenerator(false);
            }}
            onClose={() => setShowCaptionGenerator(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}