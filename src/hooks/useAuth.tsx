import { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  email: string;
  name?: string;
  stripe_customer_id?: string;
  stripe_price_id?: string;
  subscription_status?: string;
  trial_end_date?: string;
  avatar_url?: string;
  capsules_sent?: number;
  created_at?: string;
}

interface AuthContextType {
  user: any;
  profile: Profile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (currentUser: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } else {
      setProfile(data);
    }
  };

  const initialize = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session:', error);
      setLoading(false);
      return;
    }

    const currentUser = session?.user || null;
    setUser(currentUser);

    if (currentUser) {
      await fetchProfile(currentUser);
    } else {
      setProfile(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    initialize();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const currentUser = session?.user || null;
        if (currentUser) {
          setUser(currentUser);
          await fetchProfile(currentUser);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      listener.subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
