import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Define the shape of your profile data
interface Profile {
  id: string;
  name: string;
  email: string;
  subscription_status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_start_date: string | null;
  trial_end_date: string | null;
  capsules_sent: number;
  social_shares_completed: number;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// Define the shape of the Auth context
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Create the Auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user profile from database
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('Fetching fresh profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          console.log('Profile not found, creating new profile for user:', userId);
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            const newProfile = {
              id: userId,
              name: userData.user.user_metadata?.name || userData.user.email?.split('@')[0] || 'User',
              email: userData.user.email || '',
              subscription_status: 'trial',
              trial_start_date: new Date().toISOString(),
              trial_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              capsules_sent: 0,
              social_shares_completed: 0
            };
            
            const { data: insertedProfile, error: insertError } = await supabase
              .from('profiles')
              .insert(newProfile)
              .select()
              .single();
              
            if (insertError) {
              console.error('Error creating profile:', insertError);
              return null;
            }
            
            console.log('Profile created successfully:', insertedProfile);
            return insertedProfile;
          }
        } else {
          console.error('Error fetching profile:', error);
        }
        return null;
      }

      console.log('Fresh profile data:', data);
      return data;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  // Function to refresh profile data
  const refreshProfile = async () => {
    if (user) {
      const freshProfile = await fetchProfile(user.id);
      setProfile(freshProfile);
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    console.log('Initializing auth...')

    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Initial session check:', { session: !!session, error })
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        if (session?.user && mounted) {
          console.log('Session found, setting user:', session.user.id);
          setUser(session.user);
          
          // Fetch profile data
          const profileData = await fetchProfile(session.user.id);
          if (mounted) {
            setProfile(profileData);
            console.log('Initial auth setup complete - user and profile set');
          }
        } else if (mounted) {
          console.log('No session found')
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          console.log('Auth initialization complete')
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || !session?.user) {
        console.log('User signed out, clearing state');
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('User signed in/token refreshed:', session.user.id);
        setUser(session.user);
        
        // Fetch fresh profile data
        const profileData = await fetchProfile(session.user.id);
        if (mounted) {
          setProfile(profileData);
          console.log('Profile set, auth process complete');
          setLoading(false);
        }
      }

    });

    // Cleanup function
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign out function
  const signOut = async () => {
    try {
      console.log('Signing out user...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }

      // Clear state immediately
      setUser(null);
      setProfile(null);
      
      console.log('Sign out successful');
    } catch (error) {
      console.error('Error in signOut:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};