import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Define the shape of your profile data
interface Profile {
  id: string;
  name: string;
  email: string;
  subscription_status: string | null;
  stripe_customer_id: string | null;
  avatar_url?: string;
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

  useEffect(() => {
    // Get initial session and profile just once on load
    const fetchInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const initialUser = session?.user ?? null;
      setUser(initialUser);

      if (initialUser) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', initialUser.id)
          .single();
        setProfile(profileData);
      }
      setLoading(false);
    };

    fetchInitialSession();

    // Set up a listener for future auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        // Only clear the profile on SIGNED_OUT event.
        // For all other events (like SIGNED_IN or TOKEN_REFRESHED), we fetch the profile.
        if (event === 'SIGNED_OUT') {
          setProfile(null);
        } else if (currentUser) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
          setProfile(profileData);
        }
      }
    );

    // Return the cleanup function
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

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
