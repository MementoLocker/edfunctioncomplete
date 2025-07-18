import React, { useState, useEffect } from 'react';
import { X, Heart, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ExitIntentModal: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
      }
    };

    // Also trigger on scroll to bottom
    const handleScroll = () => {
      if (!hasShown && window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        setIsVisible(true);
        setHasShown(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasShown]);

  const handleShare = (platform: string) => {
    const url = window.location.origin;
    const text = 'Check out MementoLocker - a beautiful way to preserve and share precious memories with loved ones!';
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="exit-intent-modal">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="modal-content"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Not ready yet?
              </h3>
              
              <p className="text-gray-600 mb-8">
                Maybe you know someone who would love to preserve their precious memories. 
                Please consider sharing MementoLocker with a friend or family member.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => handleShare('facebook')}
                  className="social-share-button w-full"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share on Facebook</span>
                </button>
                
                <button
                  onClick={() => handleShare('twitter')}
                  className="social-share-button w-full"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share on Twitter</span>
                </button>
                
                <button
                  onClick={() => handleShare('linkedin')}
                  className="social-share-button w-full"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share on LinkedIn</span>
                </button>
              </div>

              <button
                onClick={handleClose}
                className="mt-6 text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                No thanks, I'll continue browsing
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};