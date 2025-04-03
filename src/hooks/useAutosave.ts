import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface AutosaveOptions {
  category: string;
  debounceMs?: number;
}

export function useAutosave(options: AutosaveOptions) {
  const { category, debounceMs = 2000 } = options;
  const { user } = useAuthStore();
  const timeoutRef = useRef<number>();
  const draftIdRef = useRef<string>();

  const saveDraft = async (content: any) => {
    if (!user) return;

    try {
      if (draftIdRef.current) {
        // Update existing draft
        const { error } = await supabase
          .from('listing_drafts')
          .update({
            content,
            last_saved: new Date().toISOString()
          })
          .eq('id', draftIdRef.current);

        if (error) throw error;
      } else {
        // Create new draft
        const { data, error } = await supabase
          .from('listing_drafts')
          .insert({
            user_id: user.id,
            category,
            content
          })
          .select()
          .single();

        if (error) throw error;
        draftIdRef.current = data.id;

        // Create notification
        await supabase
          .from('notifications')
          .insert({
            user_id: user.id,
            type: 'draft_saved',
            message: 'Your listing has been saved as a draft.'
          });
      }

      toast.success('Draft saved', { id: 'draft-save' });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Failed to save draft');
    }
  };

  const debouncedSave = (content: any) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      saveDraft(content);
    }, debounceMs);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    debouncedSave,
    saveDraft,
    draftId: draftIdRef.current
  };
}