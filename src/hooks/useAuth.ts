import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface UserProfile {
  id: string
  name: string | null
  email: string | null
  subscription_status: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_price_id: string | null
  trial_start_date: string | null
  trial_end_date: string | null
  capsules_sent: number
  social_shares_completed: number
  avatar_url: string | null
  created_at: string
  updated_at: string
}

interface ExtendedUser extends User {
  profile?: UserProfile
}

export const useAuth = () => {
  const [user, setUser] = useState<ExtendedUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Function to fetch user profile data from profiles table
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Function to create extended user object with profile data
  const createExtendedUser = async (authUser: User): Promise<ExtendedUser> => {
    const profile = await fetchUserProfile(authUser.id);
    return {
      ...authUser,
      profile
    };
  };

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setUser(null);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          const extendedUser = await createExtendedUser(session.user);
          setUser(extendedUser);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setLoading(false);
      }
    };
    
    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          const extendedUser = await createExtendedUser(session.user);
          setUser(extendedUser);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
        setLoading(false);
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Function to refresh user profile data (can be called from components)
  const refreshUserProfile = async () => {
    if (user) {
      try {
        const profile = await fetchUserProfile(user.id);
        setUser(prevUser => prevUser ? { ...prevUser, profile } : null);
      } catch (error) {
        console.error('Error refreshing user profile:', error);
      }
    }
  };

  return { user, loading, refreshUserProfile }
}