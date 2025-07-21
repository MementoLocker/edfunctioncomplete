import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import { Footer } from './components/Footer';
import { CookieConsent } from './components/CookieConsent';
import { AuthModal } from './components/auth/AuthModal';
import { WelcomeModal } from './components/WelcomeModal';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { FAQ } from './pages/FAQ';
import { CreateCapsule } from './pages/CreateCapsule';
import { CustomSong } from './pages/CustomSong';
import { Subscription } from './pages/Subscription';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';

// A simple component to scroll to the top on page navigation
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  const { user, profile, loading, signOut } = useAuth();
  
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'signin' | 'signup' }>({
    isOpen: false,
    mode: 'signin'
  });
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Check for first-time login to create a profile and show a welcome modal
  useEffect(() => {
    if (user && !profile && !loading) {
      const createProfileForNewUser = async () => {
        try {
          const { error } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              name: user.user_metadata?.name || user.email?.split('@')[0],
              email: user.email,
              subscription_status: 'trial',
            });
          if (error) throw error;
          setShowWelcomeModal(true);
        } catch (error) {
          console.error('Error creating profile for first-time login:', error);
        }
      };
      createProfileForNewUser();
    }
  }, [user, profile, loading]);

  const handleSignIn = () => setAuthModal({ isOpen: true, mode: 'signin' });
  const handleSignUp = () => setAuthModal({ isOpen: true, mode: 'signup' });
  const handleSignOut = async () => await signOut();

  const handleGetStarted = () => {
    if (user) {
      window.location.href = '/create-capsule';
    } else {
      setAuthModal({ isOpen: true, mode: 'signup' });
    }
  };

  const handleUpgradeClick = () => {
    setShowWelcomeModal(false);
    window.location.href = '/#pricing';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: '#C0A172' }}></div>
      </div>
    );
  }

  return (
