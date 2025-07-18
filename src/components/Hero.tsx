import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface HeroProps {
  onGetStarted?: () => void;
  onSignIn?: () => void;
  onSignUp?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onGetStarted, onSignIn, onSignUp }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStartJourney = () => {
    if (user) {
      // User is logged in, redirect to create capsule page
      navigate('/create-capsule');
    } else {
      // User is not logged in, open sign up modal
      onSignUp?.();
    }
  };

  return (
    <section className="hero-section">
      <div className="container-max section-padding">
        <div className="two-column">
          {/* Left Column - Hero Images (Now Smaller) */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative"
          >
            {/* Gold-themed decorative box */}
            <div 
              className="absolute -top-4 -left-4 w-full h-full rounded-lg opacity-20 z-0"
              style={{ 
                background: 'linear-gradient(135deg, #C0A172 0%, #A68B5B 100%)',
                transform: 'rotate(-2deg)'
              }}
            ></div>
            
            {/* Main image container - made smaller */}
            <div className="relative z-10 w-full h-72 rounded-lg overflow-hidden shadow-xl border-4 border-opacity-30" style={{ borderColor: '#C0A172' }}>
              <img
                src="https://umrxpbudpexhgpnynstb.supabase.co/storage/v1/object/public/avatars//Gemini_Generated_Image_y0ydgky0ydgky0yd.jpeg"
                alt="Precious family memories being preserved for future generations"
                className="w-full h-full object-cover"
              />
              
              {/* Gold overlay accent */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black opacity-20"
                style={{ background: 'linear-gradient(135deg, rgba(192, 161, 114, 0.1) 0%, transparent 50%, rgba(192, 161, 114, 0.2) 100%)' }}
              ></div>
            </div>

            {/* Gold accent box with elegant styling */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute -bottom-6 -right-6 z-20"
            >
              <div 
                className="px-6 py-4 rounded-lg shadow-lg border-2"
                style={{ 
                  background: 'linear-gradient(135deg, #C0A172 0%, #A68B5B 100%)',
                  borderColor: '#A68B5B'
                }}
              >
                <div className="text-white text-center">
                  <div className="text-sm font-medium uppercase tracking-wider opacity-90">
                    Preserve
                  </div>
                  <div className="text-lg font-bold" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Forever
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <h1 className="hero-title">
                Some memories are for now.
                <br />
                Others are for tomorrow.
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                MementoLocker helps you preserve your most precious digital memories and deliver them 
                as a beautiful, lasting gift on a future date you choose.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleStartJourney}
                className="btn-primary flex items-center justify-center group"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={onSignIn}
                className="btn-secondary flex items-center justify-center"
              >
                Sign In
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};