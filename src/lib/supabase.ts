import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', { 
    url: supabaseUrl ? 'defined' : 'undefined', 
    key: supabaseAnonKey ? 'defined' : 'undefined' 
  });
  throw new Error('Missing Supabase environment variables. Please check your .env file or environment configuration.');
}

// Configure Supabase client with custom options
export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'listhouze-auth',
    },
    global: {
      headers: {
        'x-application-name': 'listhouze',
      },
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Auth helpers
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
};

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  return { data, error };
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  });
  return { data, error };
};

export const signOut = async () => {
  try {
    // Sign out from Supabase Auth
    const { error } = await supabase.auth.signOut();
    
    // Clear local storage items related to auth
    localStorage.removeItem('listhouze-auth');
    localStorage.removeItem('supabase.auth.token');
    
    // Clear any other auth-related items that might be in localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('supabase.auth.') || key.includes('token') || key.includes('refresh')) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear session storage as well
    sessionStorage.clear();
    
    // Force reload the page to ensure all auth state is cleared
    if (error) {
      console.error('Error during sign out:', error);
      // Even if there's an error, we'll still clear local storage and reload
      window.location.href = '/login';
      return { error };
    }
    
    return { error: null };
  } catch (error) {
    console.error('Exception during sign out:', error);
    // Ensure we still clear storage even if there's an exception
    localStorage.removeItem('listhouze-auth');
    window.location.href = '/login';
    return { error };
  }
};

// Listing helpers
export const createListing = async (listing: any) => {
  const { data, error } = await supabase
    .from('listings')
    .insert(listing)
    .select()
    .single();
  return { data, error };
};

export const updateListing = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('listings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteListing = async (id: string) => {
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id);
  return { error };
};

export const getListings = async (category?: string) => {
  let query = supabase
    .from('listings')
    .select(`
      *,
      media (*),
      users (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  return { data, error };
};

// Media helpers
export const uploadMedia = async (file: File, path: string) => {
  const { data, error } = await supabase.storage
    .from('media')
    .upload(path, file);
  return { data, error };
};

export const deleteMedia = async (path: string) => {
  const { error } = await supabase.storage
    .from('media')
    .remove([path]);
  return { error };
};