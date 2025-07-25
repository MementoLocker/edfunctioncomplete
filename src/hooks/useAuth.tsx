import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Define the shape of your profile data
interface Profile {
  id: string;
  name: string;
  email: string;
  subscription_status: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  avatar_url?: string;
  trial_start_date?: string;
  trial_end_date?: string;
  capsules_sent?: number;
  created_at?: string;
  updated_at?: string;
}

// Define the shape of the Auth context
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

// Create the Auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Use refs to prevent unnecessary re-renders and track initialization
  const initialized = useRef(false);
  const profileFetched = useRef(false);

  // Memoized profile fetcher to prevent recreation on every render
  const fetchProfile = useCallback(async (userId: string) => {
    // Prevent multiple simultaneous profile fetches
    if (profileFetched.current) return;
    profileFetched.current = true;

    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(profileData);
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  }, []);

  // Memoized sign out function
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      profileFetched.current = false;
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  useEffect(() => {
    // Prevent multiple initializations
    if (initialized.current) return;
    initialized.current = true;

    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        const currentUser = session?.user ?? null;
        
        if (mounted) {
          setUser(currentUser);
          
          // Fetch profile if user exists
          if (currentUser) {
            await fetchProfile(currentUser.id);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initialize auth state
    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        // Reset profile fetch flag when user changes
        profileFetched.current = false;
        
        if (currentUser) {
          // Fetch profile for new user
          await fetchProfile(currentUser.id);
        } else {
          // Clear profile when user logs out
          setProfile(null);
        }
      }
    );

    // Cleanup function
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - this effect should only run once

  // Handle visibility change to refresh data when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && user && !loading) {
        try {
          // Re-validate session when tab becomes visible
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user && session.user.id === user.id) {
            // User is still valid, refresh profile if needed
            if (!profile) {
              profileFetched.current = false;
              await fetchProfile(session.user.id);
            }
          }
        } catch (error) {
          console.error('Visibility change session check error:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, profile, loading, fetchProfile]);

  const value = { user, profile, loading, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create the useAuth hook for components to use
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};