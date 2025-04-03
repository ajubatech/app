import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useCredits } from './useCredits';
import toast from 'react-hot-toast';

interface PublishOptions {
  onSuccess?: (listingId: string) => void;
  onError?: (error: Error) => void;
  onModeration?: (result: any) => void;
}

export function usePublish(options: PublishOptions = {}) {
  const [isPublishing, setIsPublishing] = useState(false);
  const { user } = useAuthStore();
  const { checkListingQuota } = useCredits();

  const publish = async (listing: any, draftId?: string) => {
    if (!user) return;

    try {
      setIsPublishing(true);

      // Check if user has listing credits
      const hasQuota = await checkListingQuota();
      if (!hasQuota) {
        toast.error('You have reached your listing limit for this month');
        return;
      }

      // Moderate listing content
      const { data: moderationResult, error: moderationError } = await supabase.functions.invoke('moderate-listing-ai', {
        body: {
          title: listing.title,
          description: listing.description,
          tags: listing.tags || [],
          category: listing.category,
          price: listing.price,
          userId: user.id,
          listingId: draftId
        }
      });

      if (moderationError) throw moderationError;

      // If moderation callback is provided, call it
      if (options.onModeration) {
        options.onModeration(moderationResult);
      }

      // If content is not approved, notify user and stop
      if (!moderationResult.approved) {
        toast.error(`Listing not published: ${moderationResult.reason}`);
        
        // If category mismatch, suggest correct category
        if (!moderationResult.category_match && moderationResult.suggested_category) {
          toast.info(`This might be better listed as ${moderationResult.suggested_category}`);
        }
        
        return;
      }

      // Create listing
      const { data: publishedListing, error: listingError } = await supabase
        .from('listings')
        .insert({
          ...listing,
          user_id: user.id,
          status: 'active'
        })
        .select()
        .single();

      if (listingError) throw listingError;

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'listing_published',
          listing_id: publishedListing.id,
          message: '🎉 Your listing is now live on ListHouze!'
        });

      // Delete draft if it exists
      if (draftId) {
        await supabase
          .from('listing_drafts')
          .delete()
          .eq('id', draftId);
      }

      // Generate social posts
      const { data: socialPosts } = await supabase.functions.invoke('generate-social-post', {
        body: { listing: publishedListing }
      });

      if (socialPosts) {
        // Save generated posts
        await supabase
          .from('scheduled_posts')
          .insert(
            socialPosts.map((post: any) => ({
              listing_id: publishedListing.id,
              platform: post.platform,
              content: post.caption,
              hashtags: post.hashtags,
              scheduled_for: new Date(Date.now() + Math.random() * 86400000 * 7) // Random time in next 7 days
            }))
          );
      }

      // Send email notification
      await supabase.functions.invoke('send-email', {
        body: {
          to: user.email,
          template: 'listing_published',
          data: {
            listingTitle: listing.title,
            listingUrl: `${window.location.origin}/${listing.category}/${publishedListing.id}`
          }
        }
      });

      toast.success('Listing published successfully!');
      options.onSuccess?.(publishedListing.id);
    } catch (error) {
      console.error('Error publishing listing:', error);
      toast.error('Failed to publish listing');
      options.onError?.(error as Error);
    } finally {
      setIsPublishing(false);
    }
  };

  return {
    publish,
    isPublishing
  };
}