import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Notifications() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, filter]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (filter === 'unread') {
        query = query.eq('read', false);
      } else if (filter === 'read') {
        query = query.eq('read', true);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id)
        .eq('read', false);

      if (error) throw error;
      
      // Update local state
      setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
      
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to update notifications');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'listing_published':
        return <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><Check className="w-5 h-5 text-green-600" /></div>;
      case 'listing_viewed':
        return <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><Eye className="w-5 h-5 text-blue-600" /></div>;
      case 'listing_liked':
        return <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"><Heart className="w-5 h-5 text-red-600" /></div>;
      case 'message_received':
        return <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center"><MessageSquare className="w-5 h-5 text-purple-600" /></div>;
      case 'draft_saved':
        return <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center"><Save className="w-5 h-5 text-yellow-600" /></div>;
      default:
        return <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"><Bell className="w-5 h-5 text-gray-600" /></div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex items-center gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Check className="w-5 h-5" />
            Mark All Read
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse bg-white p-6 rounded-xl shadow-sm">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white p-6 rounded-xl shadow-sm ${!notification.read ? 'border-l-4 border-blue-500' : ''}`}
            >
              <div className="flex items-start gap-4">
                {getNotificationIcon(notification.type)}
                <div className="flex-1">
                  <p className={`${!notification.read ? 'font-medium' : ''}`}>{notification.message}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                      title="Mark as read"
                    >
                      <Check className="w-5 h-5 text-blue-600" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No notifications</h2>
          <p className="text-gray-600">
            You're all caught up! We'll notify you when there's something new.
          </p>
        </div>
      )}
    </div>
  );
}

// Import these at the top of the file
import { Eye, Heart, MessageSquare, Save } from 'lucide-react';