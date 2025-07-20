import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Calendar, Upload, CreditCard, User, Camera, Package, Clock, CheckCircle, Mail, Trash2, UserCheck, UserX, Shield, Star, Music, Infinity, HeadphonesIcon, MessageCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastNotification } from '../components/ToastNotification';

export const Subscription: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  // Map Stripe Price IDs to plan names
  const getPlanNameFromPriceId = (priceId: string) => {
    const priceIdMap: { [key: string]: string } = {
      'price_1RmO6mBOaon0OwkPSX25QVac': 'keepsake',
      'price_1RmO7rBOaon0OwkPc1i7XUW2': 'heirloom', 
      'price_1RmO8nBOaon0OwkPk6qfS5RE': 'legacy',
      'price_1RmO9UBOaon0OwkPqJ8cIMZA': 'music'
    };
    return priceIdMap[priceId] || 'unknown';
  };

  const getSubscriptionStatus = () => {
    if (!profile) return '30-Day Free Trial';
    
    // If we have a stripe_price_id, use that to determine the plan
    if (profile.stripe_price_id) {
      const planName = getPlanNameFromPriceId(profile.stripe_price_id);
      switch (planName) {
        case 'keepsake':
          return 'Keepsake Plan';
        case 'heirloom':
          return 'Heirloom Plan';
        case 'legacy':
          return 'Legacy Plan';
        case 'music':
          return 'Music Pro Plan';
        default:
          return 'Premium Plan';
      }
    }
    
    // Fallback to subscription_status
    switch (profile.subscription_status) {
      case 'active':
        return 'Premium Plan';
      case 'legacy':
        return 'Legacy Plan';
      case 'trial':
        return '30-Day Free Trial';
      case 'cancelled':
        return 'Cancelled';
      default:
        return '30-Day Free Trial';
    }
  };

  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, location.pathname]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      setProfile(data);

      if (data.trial_end_date) {
        const endDate = new Date(data.trial_end_date);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setTrialDaysRemaining(Math.max(0, diffDays));
      }
      
      if (data.subscription_status === 'active') {
        fetchSponsors();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSponsors = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .eq('subscriber_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSponsorsList(data || []);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
      triggerToast('Failed to load sponsors list.', 'error');
    }
  };

  const handleAddSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !sponsorEmail.trim()) return;
    
    setAddingSponsor(true);
    try {
      const { error } = await supabase
        .from('sponsors')
        .insert({ 
          subscriber_id: user.id, 
          sponsor_email: sponsorEmail.trim().toLowerCase() 
        });

      if (error) {
        if (error.code === '23505') {
          triggerToast('This email is already added as a sponsor.', 'warning');
        } else {
          throw error;
        }
      } else {
        setSponsorEmail('');
        fetchSponsors();
        triggerToast('Sponsor added successfully!', 'success');
      }
    } catch (error) {
      console.error('Error adding sponsor:', error);
      triggerToast('Failed to add sponsor. Please try again.', 'error');
    } finally {
      setAddingSponsor(false);
    }
  };

  const handleRemoveSponsor = async (sponsorId: string) => {
    if (!window.confirm('Are you sure you want to remove this sponsor? They will no longer be able to modify your time capsules.')) return;
    
    setRemovingSponsor(sponsorId);
    try {
      const { error } = await supabase
        .from('sponsors')
        .delete()
        .eq('id', sponsorId);
        
      if (error) throw error;
      
      fetchSponsors();
      triggerToast('Sponsor removed successfully.', 'success');
    } catch (error) {
      console.error('Error removing sponsor:', error);
      triggerToast('Failed to remove sponsor. Please try again.', 'error');
    } finally {
      setRemovingSponsor(null);
    }
  };

  const handleUpgradeClick = () => {
    navigate('/#pricing');
  };

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

      const { data, error } = await supabase.functions.invoke('create-billing-portal', {
        body: {
          customerId: profile.stripe_customer_id
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      if (updateError) {
        throw updateError;
      }

      await fetchProfile();
    } catch (error: any) {
      alert('Error uploading avatar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-serif font-bold text-gray-800 mb-4">
            Sign In Required
          </h1>
          <p className="text-gray-600 mb-8">
            Please sign in to view your subscription details.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: '#C0A172' }}></div>
      </div>
    );
  }

  const getSubscriptionColor = () => {
    if (!profile) return 'text-gray-600';
    
    switch (profile.subscription_status) {
      case 'active':
        return 'text-green-600';
      case 'legacy':
        return 'text-purple-600';
      case 'trial':
        return 'text-blue-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const getNextPaymentDate = () => {
    if (profile?.subscription_status === 'legacy') {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth.toLocaleDateString();
    } else if (profile?.subscription_status === 'active') {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth.toLocaleDateString();
    }
    return null;
  };

  const getStorageLimit = () => {
    if (profile?.stripe_price_id) {
      const planName = getPlanNameFromPriceId(profile.stripe_price_id);
      switch (planName) {
        case 'keepsake':
          return '10GB';
        case 'heirloom':
          return '25GB';
        case 'legacy':
          return '100GB';
        default:
          return '25GB';
      }
    }
    
    switch (profile?.subscription_status) {
      case 'active':
        return '25GB';
      case 'legacy':
        return '100GB';
      case 'trial':
        return '5GB';
      default:
        return '5GB';
    }
  };

  const getCapsuleLimit = () => {
    if (profile?.stripe_price_id) {
      const planName = getPlanNameFromPriceId(profile.stripe_price_id);
      switch (planName) {
        case 'keepsake':
          return '5 per month';
        case 'heirloom':
          return '8 per month';
        case 'legacy':
          return 'Unlimited';
        default:
          return '8 per month';
      }
    }
    
    switch (profile?.subscription_status) {
      case 'legacy':
        return 'Unlimited';
      case 'active':
        return '8 per month';
      case 'trial':
        return '1 total';
      default:
        return '1 total';
    }
  };

  const handleContactSupport = () => {
    navigate('/contact');
  };

  const userWithProfile = user ? {
    ...user,
    name: profile?.name || user.user_metadata?.name || user.email!.split('@')[0],
    email: user.email!,
    avatar_url: profile?.avatar_url
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Elegant Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-serif font-light text-gray-800 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Account Overview
          </h1>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-light">
            Manage your subscription and account preferences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card - Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-fit">
              <div className="text-center mb-8">
                <div className="relative inline-block mb-6">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={userWithProfile?.name || 'Profile'}
                      className="w-24 h-24 rounded-full object-cover shadow-md border-4 border-white"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-md border-4 border-white">
                      <User className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                  
                  <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-amber-600 transition-colors shadow-lg">
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
                
                {uploading && (
                  <p className="text-sm text-gray-500 mb-4">Uploading...</p>
                )}

                <h2 className="text-2xl font-serif font-medium text-gray-800 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {userWithProfile?.name}
                </h2>
                <p className="text-gray-500 mb-6">{user.email}</p>
                
                <div className="text-sm text-gray-400">
                  Member since {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Capsules Limit</span>
                  </div>
                  <span className="font-semibold text-gray-800 flex items-center">
                    {getCapsuleLimit() === 'Unlimited' ? (
                      <>
                        <Infinity className="w-4 h-4 mr-1 text-purple-600" />
                        Unlimited
                      </>
                    ) : (
                      getCapsuleLimit()
                    )}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600">Storage Used</span>
                  </div>
                  <span className="font-semibold text-gray-800">0.2GB / {getStorageLimit()}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content - Right Columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Subscription Status Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-serif font-medium text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Current Plan
                  </h3>
                  <Crown className="w-7 h-7 text-amber-500" />
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`text-2xl font-semibold ${getSubscriptionColor()}`}>
                      {getSubscriptionStatus()}
                    </h4>
                    {profile?.subscription_status === 'trial' && (
                      <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                        {trialDaysRemaining} days left
                      </div>
                    )}
                  </div>

                  {profile?.subscription_status === 'trial' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-blue-700">
                        <span>Trial Progress</span>
                        <span>{30 - trialDaysRemaining} of 30 days used</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${((30 - trialDaysRemaining) / 30) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {(profile?.subscription_status === 'active' || profile?.subscription_status === 'legacy') && getNextPaymentDate() && (
                    <div className="flex items-center space-x-3 text-green-700">
                      <Calendar className="w-5 h-5" />
                      <span>Next payment: {getNextPaymentDate()}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleUpgradeClick}
                      className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg"
                    >
                      {profile?.subscription_status === 'trial' ? 'Upgrade Plan' : 'Change Plan'}
                    </button>
                    
                    {(profile?.subscription_status === 'active' || profile?.subscription_status === 'legacy') && (
                      <button
                        onClick={handleCancelSubscription}
                        disabled={cancellingSubscription}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancellingSubscription ? 'Opening Portal...' : 'Manage Billing'}
                      </button>
                    )}
                  </div>
                  
                  {/* Cancel Subscription Button for Paid Users */}
                  {(profile?.subscription_status === 'active' || profile?.subscription_status === 'legacy' || 
                    (profile?.stripe_price_id && getPlanNameFromPriceId(profile.stripe_price_id) !== 'unknown')) && (
                    <div className="border-t border-gray-200 pt-4">
                      <button
                        onClick={handleCancelSubscription}
                        disabled={cancellingSubscription}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-medium py-3 px-6 rounded-xl transition-all duration-300 border border-red-200 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {cancellingSubscription ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700 mr-2"></div>
                            Opening Billing Portal...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5 mr-2" />
                            Cancel Subscription
                          </>
                        )}
                      </button>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        You'll retain access until the end of your current billing period
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Legacy Plan Benefits */}
            {(profile?.subscription_status === 'legacy' || (profile?.stripe_price_id && getPlanNameFromPriceId(profile.stripe_price_id) === 'legacy')) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <div className="flex items-center mb-6">
                    <Crown className="w-6 h-6 mr-3 text-purple-600" />
                    <h3 className="text-xl font-serif font-medium text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Legacy Plan Benefits
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Infinity className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Unlimited Time Capsules</div>
                        <div className="text-sm text-gray-500">Create as many as you need</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Upload className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">100GB Storage</div>
                        <div className="text-sm text-gray-500">Premium storage capacity</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Advanced Scheduling</div>
                        <div className="text-sm text-gray-500">Modify delivery dates anytime</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Music className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Music Library Access</div>
                        <div className="text-sm text-gray-500">Coming soon - Full access included</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Keepsake Plan Benefits */}
            {(profile?.stripe_price_id && getPlanNameFromPriceId(profile.stripe_price_id) === 'keepsake') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <div className="flex items-center mb-6">
                    <Star className="w-6 h-6 mr-3 text-amber-600" />
                    <h3 className="text-xl font-serif font-medium text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Keepsake Plan Benefits
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">5 Time Capsules per Month</div>
                        <div className="text-sm text-gray-500">Perfect for individuals</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Upload className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">10GB Storage</div>
                        <div className="text-sm text-gray-500">Secure cloud storage</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">All Customization Features</div>
                        <div className="text-sm text-gray-500">Full design control</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Customer Support</div>
                        <div className="text-sm text-gray-500">Email support included</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Heirloom Plan Benefits */}
            {(profile?.stripe_price_id && getPlanNameFromPriceId(profile.stripe_price_id) === 'heirloom') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <div className="flex items-center mb-6">
                    <Crown className="w-6 h-6 mr-3 text-orange-600" />
                    <h3 className="text-xl font-serif font-medium text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Heirloom Plan Benefits
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">8 Time Capsules per Month</div>
                        <div className="text-sm text-gray-500">Great for families</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Upload className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">25GB Storage</div>
                        <div className="text-sm text-gray-500">Generous storage capacity</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">All Customization Features</div>
                        <div className="text-sm text-gray-500">Full design control</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Customer Support</div>
                        <div className="text-sm text-gray-500">Priority email support</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {/* Trial Benefits */}
            {profile?.subscription_status === 'trial' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <h3 className="text-xl font-serif font-medium text-gray-800 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Your Free Trial Includes
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      'Full design preview mode',
                      'Upload and organize content',
                      'Test all customization features',
                      'Send 1 time capsule',
                      '5GB secure storage',
                      '30-day trial period'
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Advanced Scheduling - Sponsors Section */}
            {(profile?.subscription_status === 'active' || profile?.subscription_status === 'legacy' || (profile?.stripe_price_id && getPlanNameFromPriceId(profile.stripe_price_id) === 'legacy')) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <div className="flex items-center mb-6">
                    <Shield className="w-6 h-6 mr-3 text-amber-500" />
                    <h3 className="text-xl font-serif font-medium text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Advanced Scheduling
                    </h3>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                    <h4 className="font-semibold text-amber-800 mb-2">Sponsor Management</h4>
                    <p className="text-amber-700 text-sm">
                      Designate trusted individuals who can modify delivery dates and recipients of your time capsules. 
                      Perfect for uncertain future events or when dealing with changing circumstances.
                    </p>
                  </div>

                  <form onSubmit={handleAddSponsor} className="mb-6">
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                          placeholder="sponsor@example.com"
                          value={sponsorEmail}
                          onChange={(e) => setSponsorEmail(e.target.value)}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={addingSponsor}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {addingSponsor ? 'Adding...' : 'Add Sponsor'}
                      </button>
                    </div>
                  </form>

                  {sponsorsList.length > 0 ? (
                    <div>
                      <h4 className="text-lg font-medium text-gray-700 mb-4">
                        Current Sponsors ({sponsorsList.length})
                      </h4>
                      <div className="space-y-3">
                        {sponsorsList.map((sponsor) => (
                          <div key={sponsor.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                            <div className="flex items-center space-x-3">
                              {sponsor.sponsor_user_id ? (
                                <UserCheck className="w-5 h-5 text-green-500" />
                              ) : (
                                <UserX className="w-5 h-5 text-amber-500" />
                              )}
                              <div>
                                <span className="text-gray-800 font-medium">{sponsor.sponsor_email}</span>
                                <div className="text-sm text-gray-500">
                                  {sponsor.sponsor_user_id ? (
                                    <span className="text-green-600">✓ Account Linked</span>
                                  ) : (
                                    <span className="text-amber-600">⏳ Pending Setup</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveSponsor(sponsor.id)}
                              disabled={removingSponsor === sponsor.id}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {removingSponsor === sponsor.id ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                              ) : (
                                <Trash2 className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <UserX className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="font-medium">No sponsors added yet</p>
                      <p className="text-sm">Add trusted individuals to manage your capsule delivery details</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Customer Support Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-serif font-medium text-gray-800 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Need Help?
                    </h3>
                    <p className="text-gray-600">
                      Our support team is here to help with any questions or issues you may have.
                    </p>
                  </div>
                  <button
                    onClick={handleContactSupport}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg flex items-center space-x-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Contact Support</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Legacy Plan Benefits */}
            {(profile?.subscription_status === 'legacy' || (profile?.stripe_price_id && getPlanNameFromPriceId(profile.stripe_price_id) === 'legacy')) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <div className="flex items-center mb-6">
                    <Crown className="w-6 h-6 mr-3 text-purple-600" />
                    <h3 className="text-xl font-serif font-medium text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Legacy Plan Benefits
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Infinity className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Unlimited Time Capsules</div>
                        <div className="text-sm text-gray-500">Create as many as you need</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Upload className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">100GB Storage</div>
                        <div className="text-sm text-gray-500">Premium storage capacity</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Advanced Scheduling</div>
                        <div className="text-sm text-gray-500">Modify delivery dates anytime</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Music className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Music Library Access</div>
                        <div className="text-sm text-gray-500">Coming soon - Full access included</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Keepsake Plan Benefits */}
            {(profile?.stripe_price_id && getPlanNameFromPriceId(profile.stripe_price_id) === 'keepsake') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <div className="flex items-center mb-6">
                    <Star className="w-6 h-6 mr-3 text-amber-600" />
                    <h3 className="text-xl font-serif font-medium text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Keepsake Plan Benefits
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">5 Time Capsules per Month</div>
                        <div className="text-sm text-gray-500">Perfect for individuals</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Upload className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">10GB Storage</div>
                        <div className="text-sm text-gray-500">Secure cloud storage</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">All Customization Features</div>
                        <div className="text-sm text-gray-500">Full design control</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Customer Support</div>
                        <div className="text-sm text-gray-500">Email support included</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Heirloom Plan Benefits */}
            {(profile?.stripe_price_id && getPlanNameFromPriceId(profile.stripe_price_id) === 'heirloom') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <div className="flex items-center mb-6">
                    <Crown className="w-6 h-6 mr-3 text-orange-600" />
                    <h3 className="text-xl font-serif font-medium text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Heirloom Plan Benefits
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">8 Time Capsules per Month</div>
                        <div className="text-sm text-gray-500">Great for families</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Upload className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">25GB Storage</div>
                        <div className="text-sm text-gray-500">Generous storage capacity</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">All Customization Features</div>
                        <div className="text-sm text-gray-500">Full design control</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">Customer Support</div>
                        <div className="text-sm text-gray-500">Priority email support</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            {/* Trial Benefits */}
            {profile?.subscription_status === 'trial' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <h3 className="text-xl font-serif font-medium text-gray-800 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Your Free Trial Includes
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      'Full design preview mode',
                      'Upload and organize content',
                      'Test all customization features',
                      'Send 1 time capsule',
                      '5GB secure storage',
                      '30-day trial period'
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Advanced Scheduling - Sponsors Section */}
            {(profile?.subscription_status === 'active' || profile?.subscription_status === 'legacy' || (profile?.stripe_price_id && getPlanNameFromPriceId(profile.stripe_price_id) === 'legacy')) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <div className="flex items-center mb-6">
                    <Shield className="w-6 h-6 mr-3 text-amber-500" />
                    <h3 className="text-xl font-serif font-medium text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Advanced Scheduling
                    </h3>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                    <h4 className="font-semibold text-amber-800 mb-2">Sponsor Management</h4>
                    <p className="text-amber-700 text-sm">
                      Designate trusted individuals who can modify delivery dates and recipients of your time capsules. 
                      Perfect for uncertain future events or when dealing with changing circumstances.
                    </p>
                  </div>

                  <form onSubmit={handleAddSponsor} className="mb-6">
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                          placeholder="sponsor@example.com"
                          value={sponsorEmail}
                          onChange={(e) => setSponsorEmail(e.target.value)}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={addingSponsor}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {addingSponsor ? 'Adding...' : 'Add Sponsor'}
                      </button>
                    </div>
                  </form>

                  {sponsorsList.length > 0 ? (
                    <div>
                      <h4 className="text-lg font-medium text-gray-700 mb-4">
                        Current Sponsors ({sponsorsList.length})
                      </h4>
                      <div className="space-y-3">
                        {sponsorsList.map((sponsor) => (
                          <div key={sponsor.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                            <div className="flex items-center space-x-3">
                              {sponsor.sponsor_user_id ? (
                                <UserCheck className="w-5 h-5 text-green-500" />
                              ) : (
                                <UserX className="w-5 h-5 text-amber-500" />
                              )}
                              <div>
                                <span className="text-gray-800 font-medium">{sponsor.sponsor_email}</span>
                                <div className="text-sm text-gray-500">
                                  {sponsor.sponsor_user_id ? (
                                    <span className="text-green-600">✓ Account Linked</span>
                                  ) : (
                                    <span className="text-amber-600">⏳ Pending Setup</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveSponsor(sponsor.id)}
                              disabled={removingSponsor === sponsor.id}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {removingSponsor === sponsor.id ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                              ) : (
                                <Trash2 className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <UserX className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="font-medium">No sponsors added yet</p>
                      <p className="text-sm">Add trusted individuals to manage your capsule delivery details</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Customer Support Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-serif font-medium text-gray-800 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Need Help?
                    </h3>
                    <p className="text-gray-600">
                      Our support team is here to help with any questions or issues you may have.
                    </p>
                  </div>
                  <button
                    onClick={handleContactSupport}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg flex items-center space-x-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Contact Support</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <ToastNotification
        message={toastMessage}
        isVisible={showToast}
        onHide={() => setShowToast(false)}
        type={toastType}
      />
    </div>
  );
};