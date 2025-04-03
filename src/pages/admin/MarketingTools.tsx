import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Calendar, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function MarketingTools() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScheduledPosts();
  }, []);

  const loadScheduledPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select(`
          *,
          listings (
            id,
            title,
            category
          )
        `)
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading scheduled posts:', error);
      toast.error('Failed to load scheduled posts');
    } finally {
      setLoading(false);
    }
  };

  const generatePost = async (listingId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-social-post', {
        body: { listingId }
      });

      if (error) throw error;

      // Create scheduled post
      const { error: postError } = await supabase
        .from('scheduled_posts')
        .insert({
          listing_id: listingId,
          platform: data.platform,
          content: data.content,
          hashtags: data.hashtags,
          scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
        });

      if (postError) throw postError;

      toast.success('Post generated and scheduled');
      loadScheduledPosts();
    } catch (error) {
      console.error('Error generating post:', error);
      toast.error('Failed to generate post');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Marketing Tools</h1>
          <p className="text-gray-600">Manage social media posts and communications</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-5 h-5" />
          Create Post
        </button>
      </div>

      {/* Scheduled Posts */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold capitalize">{post.platform}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(post.scheduled_for).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  post.posted
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {post.posted ? 'Posted' : 'Scheduled'}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-gray-800">{post.content}</p>
              
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 rounded-lg text-sm text-gray-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Edit
                </button>
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Reschedule
                </button>
                <button
                  onClick={() => generatePost(post.listing_id)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                >
                  <Sparkles className="w-4 h-4" />
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}