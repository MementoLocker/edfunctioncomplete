import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastNotification } from '../components/ToastNotification';
import { Calendar, Users, Edit, Save, X, Package, User as UserIcon, Plus, Trash2, CreditCard, Shield, Star, Music, Infinity, MessageCircle, CheckCircle, Upload, Camera } from 'lucide-react';

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
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
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
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
    if (!profile) return '...';
    
    // Check for trial or free status first
    if (profile.subscription_status === 'trial' || profile.subscription_status === 'free') {
      return '30-Day Free Trial';
    }
    
    const planName = getPlanNameFromPriceId(profile.stripe_price_id);

    if (profile.subscription_status === 'active') {
        switch (planName) {
            case 'keepsake': return 'Keepsake Plan';
            case 'heirloom': return 'Heirloom Plan';
            case 'legacy': return 'Legacy Plan';
            case 'music': return 'Music Pro Plan';
            default: return 'Active Subscription';
        }
    }
    
    // Handle other statuses
    if (profile.subscription_status === 'cancelled') return 'Cancelled';
    return 'No Active Subscription';
  };

  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

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
  }, [user, profile]);

  const fetchSponsors = async () => {
    try {
      const { data, error } = await supabase
        .from('sponsors')
        .select('*')
        .eq('subscriber_id', user?.id);

      if (error) throw error;
      setSponsorsList(data || []);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
    }
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      triggerToast('Please select an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      triggerToast('Image must be smaller than 5MB', 'error');
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      triggerToast('Profile picture updated successfully!', 'success');
      
      // Refresh the page to show new avatar
      window.location.reload();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      triggerToast('Failed to upload profile picture', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const getCapsuleLimit = () => {
    if (!profile) return 0;
    
    // Check for trial status first
    if (profile.subscription_status === 'trial' || profile.subscription_status === 'free') {
      return 1; // Trial gets 1 capsule
    }
    
    if (profile.subscription_status === 'active') {
      const planName = getPlanNameFromPriceId(profile.stripe_price_id);
      
      switch (planName) {
        case 'keepsake': return 5;
        case 'heirloom': return 8;
        case 'legacy': return 999; // Unlimited
        default: return 0;
      }
    }
    
    return 0; // Free or other statuses
  };

  const getStorageLimit = () => {
    if (!profile) return '0GB';
    
    // Check for trial status first  
    if (profile.subscription_status === 'trial' || profile.subscription_status === 'free') {
      return '3GB'; // Trial gets 3GB
    }
    
    if (profile.subscription_status === 'active') {
      const planName = getPlanNameFromPriceId(profile.stripe_price_id);
      
      switch (planName) {
        case 'keepsake': return '10GB';
        case 'heirloom': return '25GB';
        case 'legacy': return '100GB';
        default: return '0GB';
      }
    }
    
    return '0GB'; // Free or other statuses
  };

  const isPaidUser = () => {
    return profile?.subscription_status === 'active' || 
           profile?.subscription_status === 'legacy' ||
           profile?.stripe_price_id;
  };

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

  // Debug logging for mobile issues
  console.log('Subscription page - Profile data:', {
    subscription_status: profile?.subscription_status,
    stripe_price_id: profile?.stripe_price_id,
    capsuleLimit: getCapsuleLimit(),
    storageLimit: getStorageLimit()
  });
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
            My Subscription
          </h1>

          {/* Current Plan Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Current Plan</h2>
                <p className="text-2xl font-bold" style={{ color: '#C0A172' }}>
                  {getSubscriptionStatus()}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Storage</div>
                <div className="text-lg font-semibold">{getStorageLimit()}</div>
              </div>
            </div>

            {profile?.subscription_status === 'trial' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-blue-800 font-medium">
                      Free Trial Active - {trialDaysRemaining} days remaining
                    </p>
                    <p className="text-blue-600 text-sm">
                      Upgrade anytime to unlock unlimited features
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Package className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <div className="text-lg font-semibold text-gray-800">
                  {getCapsuleLimit() === 999 ? 'Unlimited' : getCapsuleLimit()}
                </div>
                <div className="text-sm text-gray-500">Capsules/month</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Shield className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <div className="text-lg font-semibold text-gray-800">Secure</div>
                <div className="text-sm text-gray-500">Encrypted storage</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <div className="text-lg font-semibold text-gray-800">Unlimited</div>
                <div className="text-sm text-gray-500">Recipients</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/#pricing')}
                className="btn-primary flex-1"
              >
                {profile?.subscription_status === 'trial' ? 'Upgrade Plan' : 'Change Plan'}
              </button>
              
              {isPaidUser() && (
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancellingSubscription}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
                >
                  {cancellingSubscription ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Opening Portal...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Manage Subscription
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Information</h2>
            
            {/* Profile Picture Section */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Profile Picture</h3>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                      <UserIcon className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    id="avatar-upload"
                    disabled={uploadingAvatar}
                  />
                  <label
                    htmlFor="avatar-upload"
                    className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer ${
                      uploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {uploadingAvatar ? 'Uploading...' : 'Change Picture'}
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <div className="text-gray-900">{profile?.name || 'Not set'}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="text-gray-900">{profile?.email || user.email}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                <div className="text-gray-900">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capsules Sent</label>
                <div className="text-gray-900">{profile?.capsules_sent || 0}</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/create-capsule')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Plus className="w-6 h-6 text-blue-600 mb-2" />
                <div className="font-medium text-gray-800">Create Capsule</div>
                <div className="text-sm text-gray-500">Start a new time capsule</div>
              </button>
              
              <button
                onClick={() => navigate('/my-capsules')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Package className="w-6 h-6 text-green-600 mb-2" />
                <div className="font-medium text-gray-800">My Capsules</div>
                <div className="text-sm text-gray-500">View all capsules</div>
              </button>
              
              <button
                onClick={() => navigate('/contact')}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <MessageCircle className="w-6 h-6 text-purple-600 mb-2" />
                <div className="font-medium text-gray-800">Get Support</div>
                <div className="text-sm text-gray-500">Contact our team</div>
              </button>
            </div>
          </div>
        </motion.div>
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
