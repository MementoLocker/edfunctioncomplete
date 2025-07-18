import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Share2, CreditCard, Package } from 'lucide-react';
import { Logo } from './Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastNotification } from './ToastNotification';

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    avatar_url?: string;
  } | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
  onShare?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onSignIn, onSignOut, onShare }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigationLinks = [
    { name: 'Home', href: '/' },
    { name: 'Custom Song', href: '/custom-song' },
    { name: 'Music', href: '/music-library' },
    { name: 'FAQs', href: '/faq' },
    { name: 'Contact', href: '/contact' },
    { name: 'Price', href: '/#pricing' },
    { name: 'About', href: '/about' }
  ];

  const handleNavClick = (href: string) => {
    if (href.startsWith('/#')) {
      const section = href.substring(2);
      if (location.pathname === '/') {
        // If we're already on the homepage, scroll to the section
        const element = document.getElementById(section);
        if (element) {
          const headerHeight = 80;
          const elementPosition = element.offsetTop - headerHeight;
          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
          });
        }
      } else {
        // If we're on a different page, navigate to homepage and then scroll
        navigate('/');
        // Use a more reliable method to wait for the page to load
        const checkAndScroll = () => {
          const element = document.getElementById(section);
          if (element) {
            const headerHeight = 80;
            const elementPosition = element.offsetTop - headerHeight;
            window.scrollTo({
              top: elementPosition,
              behavior: 'smooth'
            });
          } else {
            // If element not found, try again after a short delay
            setTimeout(checkAndScroll, 50);
          }
        };
        // Start checking after a brief delay to allow navigation to complete
        setTimeout(checkAndScroll, 100);
      }
    }
    setIsMenuOpen(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'MementoLocker - Preserve Your Precious Memories',
        text: 'Check out MementoLocker - a beautiful way to preserve and share precious memories with loved ones!',
        url: window.location.origin,
      }).catch((error) => {
        console.log('Error sharing:', error);
        // Fallback to copying URL to clipboard
        navigator.clipboard.writeText(window.location.origin);
        setShowToast(true);
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.origin);
      setShowToast(true);
    }
  };

  const handleCustomSongClick = () => {
    // Navigate to custom song page and scroll to top
    navigate('/custom-song');
    // Ensure we scroll to the top of the page
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <>
      <header className="bg-white sticky top-0 z-50 border-b border-gray-200">
        <div className="container-max">
          <div className="flex justify-between items-center py-6 h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <Logo />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationLinks.map((link) => (
                link.href.startsWith('/') && !link.href.startsWith('/#') ? (
                  link.name === 'Custom Song' ? (
                    <button
                      key={link.name}
                      onClick={handleCustomSongClick}
                      className="nav-link relative group"
                    >
                      {link.name}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 transition-all duration-300 group-hover:w-full" style={{ backgroundColor: '#C0A172' }}></span>
                    </button>
                  ) : link.name === 'Music' ? (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="nav-link relative group"
                    >
                      {link.name}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 transition-all duration-300 group-hover:w-full" style={{ backgroundColor: '#C0A172' }}></span>
                    </Link>
                  ) : (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="nav-link relative group"
                    >
                      {link.name}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 transition-all duration-300 group-hover:w-full" style={{ backgroundColor: '#C0A172' }}></span>
                    </Link>
                  )
                ) : (
                  <button
                    key={link.name}
                    onClick={() => handleNavClick(link.href)}
                    className="nav-link relative group"
                  >
                    {link.name}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 transition-all duration-300 group-hover:w-full" style={{ backgroundColor: '#C0A172' }}></span>
                  </button>
                )
              ))}
            </nav>

            {/* Desktop Share Icon and User Menu */}
            <div className="hidden lg:flex items-center space-x-6">
              <button 
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-amber-600 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
              
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 bg-gray-50 px-4 py-2 h-12 rounded-none shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200"
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-gray-600" />
                    )}
                    <span className="font-medium text-gray-700 text-sm">{user.name}</span>
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-none shadow-lg py-2 z-10 border border-gray-100"
                      >
                        <Link
                          to="/create-capsule"
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4 mr-3" />
                          Create Capsule
                        </Link>
                        <Link
                          to="/my-capsules"
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Package className="w-4 h-4 mr-3" />
                          My Capsules
                        </Link>
                        <Link
                          to="/subscription"
                          className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <CreditCard className="w-4 h-4 mr-3" />
                          My Subscription
                        </Link>
                        <button
                          onClick={() => {
                            onSignOut?.();
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={onSignIn}
                  className="btn-primary"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-white border-t border-gray-100"
            >
              <div className="px-6 py-6 space-y-2">
                {navigationLinks.map((link) => (
                  link.href.startsWith('/') && !link.href.startsWith('/#') ? (
                    link.name === 'Custom Song' ? (
                      <button
                        key={link.name}
                        onClick={() => {
                          handleCustomSongClick();
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-gray-700 hover:text-amber-600 font-normal transition-colors hover:bg-gray-50 text-sm rounded-none uppercase tracking-wider"
                      >
                        {link.name}
                      </button>
                    ) : (
                      <Link
                        key={link.name}
                        to={link.href}
                        className="block w-full text-left px-4 py-3 text-gray-700 hover:text-amber-600 font-normal transition-colors hover:bg-gray-50 text-sm rounded-none uppercase tracking-wider"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.name}
                      </Link>
                    )
                  ) : (
                    <button
                      key={link.name}
                      onClick={() => handleNavClick(link.href)}
                      className="block w-full text-left px-4 py-3 text-gray-700 hover:text-amber-600 font-normal transition-colors hover:bg-gray-50 text-sm rounded-none uppercase tracking-wider"
                    >
                      {link.name}
                    </button>
                  )
                ))}
                
                <div className="pt-6 border-t border-gray-100 space-y-3">
                  <button
                    onClick={() => {
                      handleShare();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-none"
                  >
                    <Share2 className="w-4 h-4 mr-3" />
                    Share MementoLocker
                  </button>
                  
                  {user ? (
                    <div className="space-y-3">
                      <Link
                        to="/create-capsule"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-none"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        {user.name}
                      </Link>
                      <Link
                        to="/my-capsules"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-none"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Package className="w-4 h-4 mr-3" />
                        My Capsules
                      </Link>
                      <Link
                        to="/subscription"
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-none"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <CreditCard className="w-4 h-4 mr-3" />
                        My Subscription
                      </Link>
                      <button
                        onClick={() => {
                          onSignOut?.();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-none"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        onSignIn?.();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-center rounded-none uppercase tracking-wider"
                    >
                      Sign In
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <ToastNotification
        message="Link Copied!"
        isVisible={showToast}
        onHide={() => setShowToast(false)}
      />
    </>
  );
};

export default Header;