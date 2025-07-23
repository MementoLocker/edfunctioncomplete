import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  name: string;
  email: string;
  subscription_status: string | null;
  stripe_customer_id: string | null;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This function runs only once to get the initial user and set up the listener
    const setupAuth = async () => {
      // 1. Get the initial user session
      const { data: { session } } = await supabase.auth.getSession();
      const initialUser = session?.user ?? null;
      setUser(initialUser);

      // 2. Fetch the profile if there is an initial user
      if (initialUser) {
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', initialUser.id)
            .single();
          setProfile(profileData);
        } catch (error: unknown) {
          console.error("Initial profile fetch error:", error);
        }
      }

      // 3. The initial load is complete
      setLoading(false);

      // 4. Set up a listener for future auth changes (login/logout)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          setProfile(null); // Always reset profile on auth change

          if (currentUser) {
            // Fetch profile for the new user
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .single();
            setProfile(profileData);
          }
        }
      );

      // 5. Return the cleanup function
      return () => {
        subscription.unsubscribe();
      };
    };

    setupAuth();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = { user, profile, loading, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
