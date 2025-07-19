import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, CreditCard, Package } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscriptionUpdated, setSubscriptionUpdated] = useState(false);

  useEffect(() => {
    // Check if user's subscription was updated
    const checkSubscriptionStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Wait a moment for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));

        const { data, error } = await supabase
          .from('profiles')
          .select('subscription_status')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data?.subscription_status === 'active' || data?.subscription_status === 'legacy') {
          setSubscriptionUpdated(true);
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSubscriptionStatus();
  }, [user]);

  const handleContinue = () => {
    navigate('/subscription');
  };

  const handleCreateCapsule = () => {
    navigate('/create-capsule');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Please Sign In
          </h1>
          <p className="text-gray-600 mb-8">
            You need to be signed in to view this page.
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle className="w-12 h-12 text-green-600" />
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-12"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              Payment Successful!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Thank you for your purchase! Your subscription has been activated and you now have access to all premium features.
            </p>
          </motion.div>

          {/* Status Check */}
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-12"
            >
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-blue-700 font-medium">Activating your subscription...</span>
                </div>
              </div>
            </motion.div>
          ) : subscriptionUpdated ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-12"
            >
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="flex items-center justify-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-green-700 font-medium">Subscription activated successfully!</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-12"
            >
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-md mx-auto">
                <div className="flex items-center justify-center space-x-3">
                  <CreditCard className="w-6 h-6 text-amber-600" />
                  <span className="text-amber-700 font-medium">Payment received - subscription activating shortly</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* What's Next */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              What's Next?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Create Your First Capsule
                </h3>
                <p className="text-gray-600 text-sm">
                  Start preserving your precious memories with unlimited access to all features.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Manage Your Subscription
                </h3>
                <p className="text-gray-600 text-sm">
                  View your subscription details, billing history, and account settings.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={handleCreateCapsule}
              className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center group"
            >
              Create Your First Capsule
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={handleContinue}
              className="btn-outline text-lg px-8 py-4"
            >
              View Subscription Details
            </button>
          </motion.div>

          {/* Receipt Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-12 text-center"
          >
            <p className="text-gray-500 text-sm">
              A receipt has been sent to your email address. If you don't see it, please check your spam folder.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};