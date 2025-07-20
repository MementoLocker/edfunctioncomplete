import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, ArrowRight } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeClick?: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onUpgradeClick,
}) => {
  const handleUpgradeClick = () => {
    onClose();
    onUpgradeClick?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-serif font-bold text-gray-800 mb-4">
                Welcome to MementoLocker!
              </h2>
              
              <p className="text-xl text-gray-600 mb-6">
                Your 30-day free trial has begun.
              </p>

              <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-amber-800 mb-3">
                  🎉 What's included in your free trial:
                </h3>
                <ul className="text-sm text-amber-700 space-y-2 text-left">
                  <li>• Full access to all design tools</li>
                  <li>• Upload and organize your content</li>
                  <li>• Create and customize time capsules</li>
                  <li>• Send 1 complete time capsule</li>
                  <li>• 5GB of secure storage</li>
                </ul>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleUpgradeClick}
                  className="w-full btn-primary py-3 text-lg flex items-center justify-center group"
                >
                  View Upgrade Options
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full btn-outline py-3 text-lg"
                >
                  Start Creating My First Capsule
                </button>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                No credit card required during trial period
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};