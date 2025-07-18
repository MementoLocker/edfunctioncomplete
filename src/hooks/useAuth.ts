import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false)
      
      // Link sponsor account if user just logged in
      if (currentUser) {
        linkSponsorAccount(currentUser.id, currentUser.email);
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false)
      
      // Link sponsor account if user just logged in
      if (currentUser) {
        linkSponsorAccount(currentUser.id, currentUser.email);
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Function to link sponsor account when user logs in
  const linkSponsorAccount = async (userId: string, userEmail: string | undefined) => {
    if (!userEmail) return;
    
    try {
      // Check if this email exists as a sponsor_email with no linked user_id
      const { data, error } = await supabase
        .from('sponsors')
        .select('id')
        .eq('sponsor_email', userEmail.toLowerCase())
        .is('sponsor_user_id', null);
        
      if (error) {
        console.error('Error checking sponsor entries:', error);
        return;
      }
        
      // If found, link all matching entries to this user
      if (data && data.length > 0) {
        for (const sponsorEntry of data) {
          const { error: updateError } = await supabase
            .from('sponsors')
            .update({ sponsor_user_id: userId })
            .eq('id', sponsorEntry.id);
            
          if (updateError) {
            console.error('Error linking sponsor account:', updateError);
          }
        }
        console.log(`Successfully linked sponsor account for ${userEmail}`);
      }
    } catch (error) {
      console.error('Error in linkSponsorAccount:', error);
    }
  };

  return { user, loading }
}