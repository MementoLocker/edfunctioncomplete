@@ -2,7 +2,6 @@ import { useState, useEffect, createContext, useContext, ReactNode } from 'react
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Define the shape of your profile data
interface Profile {
  id: string;
  name: string;
@@ -12,75 +11,82 @@ interface Profile {
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
    // onAuthStateChange fires immediately with the current session, so it handles the initial state
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setProfile(null); // Reset profile while we fetch the new one
    // This function runs only once to get the initial user and set up the listener
    const setupAuth = async () => {
      // 1. Get the initial user session
      const { data: { session } } = await supabase.auth.getSession();
      const initialUser = session?.user ?? null;
      setUser(initialUser);

      if (currentUser) {
      // 2. Fetch the profile if there is an initial user
      if (initialUser) {
        try {
          const { data: profileData, error } = await supabase
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .eq('id', initialUser.id)
            .single();
          setProfile(profileData);
        } catch (error) {
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

          if (error) {
            console.error('Error fetching profile:', error);
          } else {
          if (currentUser) {
            // Fetch profile for the new user
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .single();
            setProfile(profileData);
          }
        } catch (e) {
          console.error('An unexpected error occurred while fetching the profile:', e);
        }
      }
      
      setLoading(false);
    });
      );

    return () => {
      authListener.subscription.unsubscribe();
      // 5. Return the cleanup function
      return () => {
        subscription.unsubscribe();
      };
    };

    setupAuth();
  }, []);

  // Define the signOut function
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    await supabase.auth.signOut();
  };

  const value = {
    user,
    profile,
    loading,
    signOut,
  };
  const value = { user, profile, loading, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create the useAuth hook for components to use
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
