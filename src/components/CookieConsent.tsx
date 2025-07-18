import React, { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setTimeout(() => setIsVisible(true), 2000); // Show after 2 seconds
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
        >
          <div className="bg-white rounded-lg shadow-xl border border-cream-200 p-6">
            <div className="flex items-start space-x-3">
              <Cookie className="w-6 h-6 text-sepia-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-serif font-semibold text-dusty-800 mb-2">
                  We use cookies
                </h3>
                <p className="text-sm text-dusty-600 mb-4">
                  We use cookies to enhance your browsing experience and analyze our traffic. 
                  By clicking "Accept", you consent to our use of cookies.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAccept}
                    className="btn-primary text-sm py-2 px-4"
                  >
                    Accept
                  </button>
                  <button
                    onClick={handleDecline}
                    className="btn-outline text-sm py-2 px-4"
                  >
                    Decline
                  </button>
                </div>
              </div>
              <button
                onClick={handleDecline}
                className="text-dusty-400 hover:text-dusty-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};