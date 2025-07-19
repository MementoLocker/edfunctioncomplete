import React, { useState } from 'react';
import { Check, Star, Crown, Gem, Music } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

interface PricingSectionProps {
  onSignIn?: () => void;
  onSignUp?: () => void;
}

const pricingTiers = [
  {
    name: 'Free Trial',
    icon: Star,
    price: { monthly: 0, yearly: 0 },
    description: 'Perfect for trying out MementoLocker',
    features: [
      'Full design preview mode',
      'Upload and organize content',
      'Test all customization features',
      'Share on 3 social platforms to unlock sending',
      'Send 1 time capsule during trial',
      '30-day trial period'
    ],
    cta: 'Start Free Trial',
    popular: false,
    color: 'green',
    storage: '3GB',
    capsules: '1 capsule',
    priceId: null // No price ID for free tier
  },
  {
    name: 'Keepsake',
    icon: Check,
    price: { monthly: 6.99, yearly: 5.59 },
    description: 'For individuals and small families',
    features: [
      'Send 5 time capsules per month',
      'All customization features',
      'Multiple recipient management',
      'Customer support'
    ],
    cta: 'Choose Keepsake',
    popular: false,
    color: 'amber',
    storage: '10GB',
    capsules: '5 capsules/month',
    priceId: 'price_1RmO6mBOaon0OwkPSX25QVac' // Your Live Price ID
  },
  {
    name: 'Heirloom',
    icon: Crown,
    price: { monthly: 12.99, yearly: 10.39 },
    description: 'Most popular for families',
    features: [
      'Send 8 time capsules per month',
      'All customization features',
      'Multiple recipient management',
      'Customer support'
    ],
    cta: 'Choose Heirloom',
    popular: true,
    color: 'orange',
    storage: '25GB',
    capsules: '8 capsules/month',
    priceId: 'price_1RmO7rBOaon0OwkPc1i7XUW2' // Your Live Price ID
  },
  {
    name: 'Legacy',
    icon: Gem,
    price: { monthly: 19.99, yearly: 15.99 },
    description: 'For large families and organizations',
    features: [
      'Unlimited time capsules',
      'All customization features',
      'Advanced scheduling (modify send dates)',
      'Multiple recipient management',
      'Full Access to Instrumental Music Library',
      'Customer support'
    ],
    cta: 'Choose Legacy',
    popular: false,
    color: 'red',
    storage: '100GB',
    capsules: 'Unlimited capsules',
    priceId: 'price_1RmO8nBOaon0OwkPk6qfS5RE' // Your Live Price ID
  }
];

const musicTier = {
  name: 'Music Licensing Pro',
  icon: Music,
  price: { monthly: 14.99, yearly: 11.99 },
  description: 'Professional music licensing for creators',
  features: [
    'Unlimited Music Downloads',
    'Full Personal & Commercial Use Rights',
    'Royalty-Free Licensing',
    'New Tracks Added Monthly',
    'Dedicated Music Support'
  ],
  cta: 'Get Music Access',
  popular: false,
  color: 'purple',
  storage: 'Unlimited Downloads',
  capsules: 'Music Library Access',
  priceId: 'price_1RmO9UBOaon0OwkPqJ8cIMZA' // Your Live Price ID
};

const currencies = [
  { code: 'GBP', symbol: '£', rate: 1, flag: '🇬🇧' },
  { code: 'USD', symbol: '$', rate: 1.27, flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', rate: 1.08, flag: '🇪🇺' },
  { code: 'CAD', symbol: 'C$', rate: 1.59, flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', rate: 1.71, flag: '🇦🇺' },
];

export const PricingSection: React.FC<PricingSectionProps> = ({ onSignIn, onSignUp }) => {
  const { user } = useAuth();
  const [isYearly, setIsYearly] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0]);

  const formatPrice = (price: number) => {
    const convertedPrice = price * selectedCurrency.rate;
    return `${selectedCurrency.symbol}${convertedPrice.toFixed(2)}`;
  };

  const getSavingsPercentage = () => {
    return Math.round(((1 - 0.8) * 100)); // 20% savings
  };

  const handleSubscribe = async (tierName: string, priceId?: string | null) => {
    if (tierName === 'Free Trial') {
      if (user) {
        window.location.href = '/create-capsule';
      } else {
        onSignUp?.();
      }
      return;
    }

    if (!user) {
      alert("Please sign up or log in to subscribe.");
      onSignUp?.();
      return;
    }

    if (!priceId) {
      console.error('Missing price ID for tier:', tierName);
      alert('Configuration error: This plan is missing a Price ID. Please contact support.');
      return;
    }

    // Temporary fallback while Edge Function is being configured
    alert(`Stripe integration is being configured. You selected: ${tierName}\nPrice ID: ${priceId}\n\nPlease contact support to complete your subscription.`);
    return;

    // Original Edge Function code (commented out temporarily)
    /*
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('User session not found. Please log in again.');

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: priceId,
          successUrl: `${window.location.origin}/subscription?success=true`,
          cancelUrl: window.location.href
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received from payment service');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      let errorMessage = 'An unknown error occurred.';
      if (error instanceof Error) {
          errorMessage = error.message;
      }
      alert(`Payment error: ${errorMessage}. Please try again or contact support.`);
    }
    */
  };

  return (
    <section id="pricing" className="section-padding bg-gray-50">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="section-title">
            Choose Your Memory Plan
          </h2>
          <p className="section-subtitle mb-12">
            Choose the plan that best fits your memory preservation needs.
          </p>

          <div className="flex justify-center mb-12">
            <div className="flex items-center space-x-4 bg-white rounded-none p-3 shadow-sm border border-gray-200">
              <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">Currency:</span>
              <select 
                value={selectedCurrency.code}
                onChange={(e) => setSelectedCurrency(currencies.find(c => c.code === e.target.value) || currencies[0])}
                className="bg-transparent border-none text-gray-700 font-medium cursor-pointer uppercase tracking-wider"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.flag} {currency.code} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-6 mb-16">
            <span className={`text-lg font-medium tracking-wide uppercase ${!isYearly ? 'text-gray-800' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`toggle-switch ${isYearly ? 'enabled' : ''}`}
            >
              <span className={`toggle-knob ${isYearly ? 'enabled' : ''}`} />
            </button>
            <span className={`text-lg font-medium tracking-wide uppercase ${isYearly ? 'text-gray-800' : 'text-gray-500'}`}>
              Yearly
            </span>
            {isYearly && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center px-4 py-2 rounded-none text-sm font-medium bg-green-100 text-green-700 tracking-wide uppercase"
              >
                Save {getSavingsPercentage()}%
              </motion.span>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Time Capsule Plans
          </h3>
          <p className="text-gray-600">
            Preserve and share your precious memories with loved ones
          </p>
        </motion.div>

        <div className="pricing-grid">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`pricing-card ${tier.popular ? 'popular' : ''} flex flex-col`}
            >
              <div className="text-center mb-10">
                <div className={`w-16 h-16 bg-amber-100 rounded-none flex items-center justify-center mx-auto mb-6`} style={{ backgroundColor: '#C0A172', color: 'white' }}>
                  <tier.icon className="w-8 h-8" />
                </div>
                
                <h3 className="text-2xl font-semibold text-gray-800 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {tier.name}
                </h3>
                
                <p className="text-gray-600 mb-6">
                  {tier.description}
                </p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {tier.price.monthly > 0 ? formatPrice(isYearly ? tier.price.yearly : tier.price.monthly) : 'Free'}
                  </span>
                  {tier.price.monthly > 0 && (
                    <span className="text-gray-500 ml-2">
                      /{isYearly ? 'year' : 'month'}
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-8">
                  <div className="text-sm text-gray-500 tracking-wide uppercase">
                    {tier.storage} secure storage
                  </div>
                  <div className="text-sm text-gray-500 tracking-wide uppercase">
                    {tier.capsules}
                  </div>
                </div>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5 mr-4" style={{ color: feature.includes('Music Library') ? '#C0A172' : '#10B981' }} />
                    <span className="text-gray-600 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <button
                  onClick={() => handleSubscribe(tier.name, tier.priceId)}
                  className={`w-full py-4 px-6 rounded-none font-medium transition-all duration-500 tracking-wide uppercase text-sm ${
                    tier.popular
                      ? 'btn-primary'
                      : 'btn-secondary'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-20 mb-12"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Music Licensing - Coming Soon
          </h3>
          <p className="text-gray-600">
            Professional instrumental music for your creative projects (launching soon)
          </p>
        </motion.div>

        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            viewport={{ once: true }}
            className="pricing-card flex flex-col max-w-sm opacity-75 relative"
          >
            <div className="absolute inset-0 bg-white bg-opacity-90 rounded-lg flex items-center justify-center z-10">
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Music className="w-8 h-8 text-amber-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Coming Soon
                </h4>
                <p className="text-gray-600 text-sm">
                  We're curating an amazing collection of professional instrumental music for you
                </p>
              </div>
            </div>

            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-none flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#C0A172', color: 'white' }}>
                <musicTier.icon className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-semibold text-gray-800 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                {musicTier.name}
              </h3>
              
              <p className="text-gray-600 mb-6">
                {musicTier.description}
              </p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {formatPrice(isYearly ? musicTier.price.yearly : musicTier.price.monthly)}
                </span>
                <span className="text-gray-500 ml-2">
                  /{isYearly ? 'year' : 'month'}
                </span>
              </div>

              <div className="space-y-2 mb-8">
                <div className="text-sm text-gray-500 tracking-wide uppercase">
                  {musicTier.storage}
                </div>
                <div className="text-sm text-gray-500 tracking-wide uppercase">
                  {musicTier.capsules}
                </div>
              </div>
            </div>

            <ul className="space-y-4 mb-10 flex-grow">
              {musicTier.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5 mr-4" />
                  <span className="text-gray-600 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              <button
                // The Music Pro plan is not yet active
                onClick={() => handleSubscribe(musicTier.name, musicTier.priceId)}
                disabled={true}
                className="w-full py-4 px-6 rounded-none font-medium transition-all duration-500 tracking-wide uppercase text-sm btn-secondary opacity-50 cursor-not-allowed"
              >
                {musicTier.cta}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};