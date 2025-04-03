import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Instagram, Facebook, Twitter as TwitterIcon, Linkedin, BookText as TikTok, Image, Video, FileText, X, Check, Clock, Upload, Music, Sparkles } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, parseISO } from 'date-fns';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'week'>('month');
  
  // Mock scheduled posts data
  const scheduledPosts = [
    {
      id: 1,
      title: 'New Property Listing',
      date: '2025-04-05T10:00:00',
      platform: 'instagram',
      type: 'image',
      status: 'scheduled'
    },
    {
      id: 2,
      title: 'Weekend Open House',
      date: '2025-04-10T14:30:00',
      platform: 'facebook',
      type: 'image',
      status: 'scheduled'
    },
    {
      id: 3,
      title: 'Property Tour Video',
      date: '2025-04-15T16:00:00',
      platform: 'instagram',
      type: 'video',
      status: 'scheduled'
    },
    {
      id: 4,
      title: 'Market Update',
      date: '2025-04-20T09:00:00',
      platform: 'linkedin',
      type: 'blog',
      status: 'scheduled'
    }
  ];
  
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowPostModal(true);
  };
  
  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter(post => {
      const postDate = parseISO(post.date);
      return isSameDay(postDate, date);
    });
  };
  
  const getPlatformIcon = (platform: string, size = 5) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className={`w-${size} h-${size}`} />;
      case 'facebook':
        return <Facebook className={`w-${size} h-${size}`} />;
      case 'twitter':
        return <TwitterIcon className={`w-${size} h-${size}`} />;
      case 'linkedin':
        return <Linkedin className={`w-${size} h-${size}`} />;
      case 'tiktok':
        return <TikTok className={`w-${size} h-${size}`} />;
      default:
        return null;
    }
  };
  
  const getTypeIcon = (type: string, size = 5) => {
    switch (type) {
      case 'image':
        return <Image className={`w-${size} h-${size}`} />;
      case 'video':
        return <Video className={`w-${size} h-${size}`} />;
      case 'blog':
        return <FileText className={`w-${size} h-${size}`} />;
      default:
        return null;
    }
  };
  
  // Generate days for the current month view
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Add days from previous and next month to fill the calendar grid
  const startDay = monthStart.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const endDay = monthEnd.getDay();
  
  // Previous month days to display
  const prevMonthDays = [];
  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(monthStart);
    date.setDate(date.getDate() - (i + 1));
    prevMonthDays.push(date);
  }
  
  // Next month days to display
  const nextMonthDays = [];
  for (let i = 1; i <= 6 - endDay; i++) {
    const date = new Date(monthEnd);
    date.setDate(date.getDate() + i);
    nextMonthDays.push(date);
  }
  
  // Combine all days
  const calendarDays = [...prevMonthDays, ...days, ...nextMonthDays];
  
  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Content Calendar</h1>
          <p className="text-gray-600">Schedule and manage your social media posts</p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 ${
                view === 'month' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 ${
                view === 'week' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Week
            </button>
          </div>
          
          <button
            onClick={() => {
              setSelectedDate(new Date());
              setShowPostModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Post
          </button>
        </div>
      </div>
      
      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{format(currentDate, 'MMMM yyyy')}</h2>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 hover:bg-gray-100 rounded-lg text-sm"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-2 text-center font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7 auto-rows-fr">
          {calendarDays.map((date, index) => {
            const isCurrentMonth = isSameMonth(date, currentDate);
            const isSelectedDate = selectedDate ? isSameDay(date, selectedDate) : false;
            const isTodayDate = isToday(date);
            const postsForDate = getPostsForDate(date);
            
            return (
              <div 
                key={index}
                className={`min-h-[100px] border-b border-r p-1 ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isSelectedDate ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => handleDateClick(date)}
              >
                <div className="flex justify-between items-start">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm ${
                    isTodayDate 
                      ? 'bg-blue-600 text-white' 
                      : isCurrentMonth ? 'text-gray-700' : 'text-gray-400'
                  }`}>
                    {date.getDate()}
                  </span>
                  
                  {postsForDate.length > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                      {postsForDate.length}
                    </span>
                  )}
                </div>
                
                <div className="mt-1 space-y-1">
                  {postsForDate.slice(0, 2).map((post) => (
                    <div 
                      key={post.id}
                      className="text-xs p-1 rounded bg-gray-100 flex items-center gap-1 truncate"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Open post editor
                      }}
                    >
                      {getPlatformIcon(post.platform, 3)}
                      <span className="truncate">{post.title}</span>
                    </div>
                  ))}
                  
                  {postsForDate.length > 2 && (
                    <div className="text-xs text-gray-600">
                      +{postsForDate.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Create Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Create New Post</h2>
              <button
                onClick={() => setShowPostModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Post Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Post Title
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter post title"
                />
              </div>
              
              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform
                </label>
                <div className="grid grid-cols-5 gap-2">
                  <button className="p-3 bg-pink-100 text-pink-600 rounded-lg flex flex-col items-center gap-1">
                    <Instagram className="w-6 h-6" />
                    <span className="text-xs">Instagram</span>
                  </button>
                  <button className="p-3 bg-blue-100 text-blue-600 rounded-lg flex flex-col items-center gap-1">
                    <Facebook className="w-6 h-6" />
                    <span className="text-xs">Facebook</span>
                  </button>
                  <button className="p-3 bg-blue-100 text-blue-400 rounded-lg flex flex-col items-center gap-1">
                    <TwitterIcon className="w-6 h-6" />
                    <span className="text-xs">Twitter</span>
                  </button>
                  <button className="p-3 bg-blue-100 text-blue-700 rounded-lg flex flex-col items-center gap-1">
                    <Linkedin className="w-6 h-6" />
                    <span className="text-xs">LinkedIn</span>
                  </button>
                  <button className="p-3 bg-gray-100 text-gray-800 rounded-lg flex flex-col items-center gap-1">
                    <TikTok className="w-6 h-6" />
                    <span className="text-xs">TikTok</span>
                  </button>
                </div>
              </div>
              
              {/* Content Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button className="p-3 bg-blue-100 text-blue-600 rounded-lg flex flex-col items-center gap-1">
                    <Image className="w-6 h-6" />
                    <span className="text-xs">Image</span>
                  </button>
                  <button className="p-3 bg-gray-100 text-gray-700 rounded-lg flex flex-col items-center gap-1">
                    <Video className="w-6 h-6" />
                    <span className="text-xs">Video</span>
                  </button>
                  <button className="p-3 bg-gray-100 text-gray-700 rounded-lg flex flex-col items-center gap-1">
                    <FileText className="w-6 h-6" />
                    <span className="text-xs">Text</span>
                  </button>
                </div>
              </div>
              
              {/* Media Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Media
                </label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag & drop your media here, or click to browse
                  </p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Browse Files
                  </button>
                </div>
              </div>
              
              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Caption
                </label>
                <div className="relative">
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Write your caption..."
                  ></textarea>
                  <button
                    className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    title="Generate with AI"
                  >
                    <Sparkles className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Scheduling */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schedule
                </label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="date"
                      defaultValue={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="time"
                      defaultValue="09:00"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Clock className="w-5 h-5" />
                  Schedule Post
                </button>
                <button
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                >
                  Save as Draft
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}