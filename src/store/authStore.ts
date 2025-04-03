import { create } from 'zustand';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  userRole: 'buyer' | 'lister' | 'business' | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setUserRole: (role: 'buyer' | 'lister' | 'business' | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  upgradeToLister: () => Promise<void>;
  upgradeToBusiness: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  userRole: null,
  setUser: (user) => {
    set({ user });
    // Set user role based on user data
    if (user) {
      const userTypes = user.user_types || [];
      if (userTypes.includes('business')) {
        set({ userRole: 'business' });
      } else if (userTypes.includes('lister')) {
        set({ userRole: 'lister' });
      } else {
        set({ userRole: 'buyer' });
      }
    } else {
      set({ userRole: null });
    }
  },
  setLoading: (loading) => set({ isLoading: loading }),
  setUserRole: (role) => set({ userRole: role }),
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    if (data.user) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        // If user doesn't exist in the users table, create a new record
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || null,
            avatar_url: data.user.user_metadata?.avatar_url || null,
            role: 'user',
            subscription_type: 'free',
            ai_credits: 10,
            listing_credits: 5
          })
          .select()
          .single();
            
        if (createError) throw createError;
        
        // Set user in store
        set({ user: newUser });
      } else {
        // Set user in store
        set({ user: userData });
      }

      // Set user role based on user data
      const userTypes = userData?.user_types || data.user.user_metadata?.user_types || ['buyer'];
      if (userTypes.includes('business')) {
        set({ userRole: 'business' });
      } else if (userTypes.includes('lister')) {
        set({ userRole: 'lister' });
      } else {
        set({ userRole: 'buyer' });
      }
    }
  },
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    if (data.user) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{ 
          id: data.user.id, 
          email: data.user.email, 
          user_types: ['buyer'],
          role: 'user',
          subscription_type: 'free',
          ai_credits: 10,
          listing_credits: 5
        }])
        .select()
        .single();
        
      if (userError) throw userError;
      set({ user: userData, userRole: 'buyer' });
    }
  },
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear all auth-related data from localStorage
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
      
      // Clear user state
      set({ user: null, userRole: null });
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, clear the user state
      set({ user: null, userRole: null });
      throw error;
    }
  },
  upgradeToLister: async () => {
    const { user } = get();
    if (!user) return;
    
    try {
      // Update user_types in auth metadata
      await supabase.auth.updateUser({
        data: {
          user_types: ['buyer', 'lister']
        }
      });
      
      // Update user record in database
      const { data, error } = await supabase
        .from('users')
        .update({ 
          user_types: ['buyer', 'lister'],
          // Add any additional fields that should be updated
        })
        .eq('id', user.id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Update local state
      set({ 
        user: {
          ...user,
          user_types: ['buyer', 'lister']
        }, 
        userRole: 'lister' 
      });
    } catch (error) {
      console.error('Error upgrading to lister:', error);
      throw error;
    }
  },
  upgradeToBusiness: async () => {
    const { user } = get();
    if (!user) return;
    
    try {
      // Update user_types in auth metadata
      await supabase.auth.updateUser({
        data: {
          user_types: ['buyer', 'lister', 'business']
        }
      });
      
      // Update user record in database
      const { data, error } = await supabase
        .from('users')
        .update({ 
          user_types: ['buyer', 'lister', 'business'],
          role: 'business'
        })
        .eq('id', user.id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Update local state
      set({ 
        user: {
          ...user,
          user_types: ['buyer', 'lister', 'business'],
          role: 'business'
        }, 
        userRole: 'business' 
      });
    } catch (error) {
      console.error('Error upgrading to business:', error);
      throw error;
    }
  }
}));

// Initialize auth state
const initializeAuth = async () => {
  try {
    useAuthStore.getState().setLoading(true);
    
    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      useAuthStore.getState().setUser(null);
      useAuthStore.getState().setLoading(false);
      return;
    }
    
    if (!session) {
      // No active session
      useAuthStore.getState().setUser(null);
      useAuthStore.getState().setLoading(false);
      return;
    }
    
    // Session exists, get user data
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (userError) {
        // If user doesn't exist in the database, create a new record
        console.log('User not found in database, creating new record');
        
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || null,
            avatar_url: session.user.user_metadata?.avatar_url || null,
            role: session.user.user_metadata?.user_types?.includes('business') ? 'business' : 'user',
            subscription_type: 'free',
            ai_credits: 10,
            listing_credits: 5,
            user_types: session.user.user_metadata?.user_types || ['buyer']
          })
          .select()
          .single();
          
        if (createError) {
          console.error('Error creating user record:', createError);
          useAuthStore.getState().setUser(null);
        } else {
          useAuthStore.getState().setUser(newUser);
        }
      } else {
        useAuthStore.getState().setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      useAuthStore.getState().setUser(null);
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
    useAuthStore.getState().setUser(null);
  } finally {
    useAuthStore.getState().setLoading(false);
  }
};

// Initialize auth on module load
initializeAuth();

// Set up auth state change listener
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('Auth state changed:', event);
  
  if (event === 'SIGNED_OUT') {
    useAuthStore.getState().setUser(null);
    useAuthStore.getState().setLoading(false);
    return;
  }
  
  if (session?.user) {
    try {
      useAuthStore.getState().setLoading(true);
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (userError) {
        // If user doesn't exist in the database, create a new record
        console.log('User not found in database, creating new record');
        
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || null,
            avatar_url: session.user.user_metadata?.avatar_url || null,
            role: session.user.user_metadata?.user_types?.includes('business') ? 'business' : 'user',
            subscription_type: 'free',
            ai_credits: 10,
            listing_credits: 5,
            user_types: session.user.user_metadata?.user_types || ['buyer']
          })
          .select()
          .single();
          
        if (createError) {
          console.error('Error creating user record:', createError);
          useAuthStore.getState().setUser(null);
        } else {
          useAuthStore.getState().setUser(newUser);
        }
      } else {
        useAuthStore.getState().setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      useAuthStore.getState().setUser(null);
    } finally {
      useAuthStore.getState().setLoading(false);
    }
  }
});