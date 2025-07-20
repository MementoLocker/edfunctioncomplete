import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth.tsx';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastNotification } from '../components/ToastNotification';
import { Calendar, Users, Edit, Save, X, Package, User as UserIcon, Plus, Trash2, CreditCard, Shield, Star, Music, Infinity, MessageCircle, CheckCircle } from 'lucide-react';

// NOTE: This interface can be simplified as we get the full profile from useAuth, but we'll leave it for now.
interface Capsule {
  id: string;
  user_id: string;
  title: string;
  message: string;
  recipients: { name: string; email: string }[];
  delivery_date: string;
  status: 'draft' | 'sealed' | 'delivered';
  created_at: string;
  updated_at: string;
}

export const Subscription: React.FC = () => {
  // FIXED: Get user AND profile directly from our corrected useAuth hook. This is the main fix.
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // DELETED: The separate, buggy profile fetching logic has been removed.
  // const [profile, setProfile] = useState<any>(null);
  // const [loading, setLoading] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [sponsorEmail, setSponsorEmail] = useState('');
  const [sponsorsList, setSponsorsList] = useState<any[]>([]);
  const [addingSponsor, setAddingSponsor] = useState(false);
  const [removingSponsor, setRemovingSponsor] = useState<string | null>(null);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'info' | 'warning' | 'error'>('success');
  const [cancellingSubscription, setCancellingSubscription] = useState(false);

  // This function maps the Stripe Price ID from the profile to a human-readable name
  const getPlanNameFromPriceId = (priceId: string | null) => {
    if (!priceId) return null;
    const priceIdMap: { [key: string]: string } = {
      'price_1RmO6mBOaon0OwkPSX25QVac': 'keepsake',
      'price_1RmO7rBOaon0OwkPc1i7XUW2': 'heirloom',
      'price_1RmO8nBOaon0OwkPk6qfS5RE': 'legacy',
      'price_1RmO9UBOaon0OwkPqJ8cIMZA': 'music'
    };
    return priceIdMap[priceId] || 'unknown';
  };

  const getSubscriptionStatus = () => {
    if (!profile) return '...'; // Return a loading state if profile is not yet available
    
    const planName = getPlanNameFromPriceId(profile.stripe_price_id);

    if (profile.subscription_status === 'active') {
        switch (planName) {
            case 'keepsake': return 'Keepsake Plan';
            case 'heirloom': return 'Heirloom Plan';
            case 'legacy': return 'Legacy Plan';
            case 'music': return 'Music Pro Plan';
            default: return 'Active Subscription'; // Fallback for active status
        }
    }
    
    // Fallback for other statuses like 'trial', 'free', 'cancelled'
    switch (profile.subscription_status) {
        case 'trial': return '30-Day Free Trial';
        case 'cancelled': return 'Cancelled';
        case 'free': return 'Free Plan';
        default: return 'No Active Subscription';
    }
  };

  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // This useEffect now just handles fetching sponsors if the user has an active sub
  useEffect(() => {
    if (user && profile) {
      if (profile.subscription_status === 'active') {
        fetchSponsors();
      }
      if (profile.trial_end_date) {
        const endDate = new Date(profile.trial_end_date);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setTrialDaysRemaining(Math.max(0, diffDays));
      }
    }
  }, [user, profile]); // Depend on the profile from useAuth

  const fetchSponsors = async () => {
    // ... (fetchSponsors function remains the same)
  };

  // ... (All other handler functions like handleAddSponsor, handleCancelSubscription, etc. remain the same)
  const handleCancelSubscription = async () => {
    if (!profile?.stripe_customer_id) {
      triggerToast('No active subscription found to cancel.', 'error');
      return;
    }
    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.')) {
      return;
    }
    setCancellingSubscription(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('User session not found. Please log in again.');

      // NOTE: You will need to create this 'create-billing-portal' function in Supabase
      const { data, error } = await supabase.functions.invoke('create-billing-portal', {
        body: { customerId: profile.stripe_customer_id },
      });

      if (error) throw error;
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No billing portal URL received');
      }
    } catch (error) {
      console.error('Error accessing billing portal:', error);
      triggerToast('Failed to access billing portal. Please contact support.', 'error');
    } finally {
      setCancellingSubscription(false);
    }
  };
  
  // All other functions like handleAvatarUpload, getCapsuleLimit, etc. should be here...
  // For brevity, I'm omitting them but they should be present in your final code.
  // The important part is that they all use the `profile` object from `useAuth`.

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: '#C0A172' }}></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to view your subscription.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Subscription</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p>Subscription content goes here...</p>
        </div>
      </div>
    </div>
  );
};
