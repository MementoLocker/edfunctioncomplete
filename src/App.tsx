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
import { LeaveReview } from './pages/LeaveReview';
import { CapsuleExamples } from './pages/CapsuleExamples';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { Copyright } from './pages/Copyright';
import { Security } from './pages/Security';
import { Subscription } from './pages/Subscription';
import { MyCapsules } from './pages/MyCapsules';
import { ClientReviews } from './pages/ClientReviews';
import { MusicLibrary } from './pages/MusicLibrary';
import { SponsorDashboard } from './pages/SponsorDashboard';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { useAuth } from './hooks/useAuth';
import { ExitIntentModal } from './components/ExitIntentModal';

// Scroll to top component
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // If there's a hash, scroll to that element after a brief delay
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          const headerHeight = 80;
          const elementPosition = element.offsetTop - headerHeight;
          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    } else {
      // No hash, scroll to top
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}

function App() {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'signin' | 'signup' }>({
    isOpen: false,
    mode: 'signin'
  });
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Show welcome modal for new users
  useEffect(() => {
    if (user && profile && !loading) {
      // Check if this is a new user (just created profile)
      const profileCreatedAt = new Date(profile.created_at);
      const now = new Date();
      const timeDiff = now.getTime() - profileCreatedAt.getTime();
      const minutesDiff = timeDiff / (1000 * 60);
      
      // If profile was created within the last 5 minutes, show welcome modal
      if (minutesDiff < 5 && profile.subscription_status === 'trial') {
        setShowWelcomeModal(true);
      }
    }
  }, [user, profile, loading]);

  const handleSignIn = () => {
    console.log('handleSignIn called - opening modal');
    setAuthModal({ isOpen: true, mode: 'signin' });
  };

  const handleSignUp = () => {
    console.log('handleSignUp called - opening modal');
    setAuthModal({ isOpen: true, mode: 'signup' });
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  const handleGetStarted = () => {
    if (user) {
      // User is logged in, redirect to create capsule or dashboard
      window.location.href = '/create-capsule';
    } else {
      // User is not logged in, open sign up modal
      setAuthModal({ isOpen: true, mode: 'signup' });
    }
  };

  const handleUpgradeClick = () => {
    window.location.href = '/subscription';
  };

  // Create user object with profile data for Header component
  const userWithProfile = user && profile ? {
    name: profile.name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    email: user.email || '',
    avatar_url: profile.avatar_url
  } : null;

  console.log('App render - user:', !!user, 'profile:', !!profile, 'userWithProfile:', !!userWithProfile);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <ScrollToTop />
        
        <Header
          user={userWithProfile}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
        />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home onGetStarted={handleGetStarted} />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/create-capsule" element={<CreateCapsule />} />
            <Route path="/custom-song" element={<CustomSong />} />
            <Route path="/leave-review" element={<LeaveReview />} />
            <Route path="/capsule-examples" element={<CapsuleExamples />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/my-capsules" element={<MyCapsules />} />
            <Route path="/client-reviews" element={<ClientReviews />} />
            <Route path="/sponsor-dashboard" element={<SponsorDashboard />} />
            <Route path="/music-library" element={<MusicLibrary />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/copyright" element={<Copyright />} />
            <Route path="/security" element={<Security />} />
          </Routes>
        </main>
        
        <Footer onSignIn={handleSignIn} />
        <CookieConsent />
        <ExitIntentModal />
        
        <AuthModal
          isOpen={authModal.isOpen}
          onClose={() => setAuthModal({ ...authModal, isOpen: false })}
          mode={authModal.mode}
          onModeChange={(mode) => setAuthModal({ ...authModal, mode })}
        />
        
        <WelcomeModal
          isOpen={showWelcomeModal}
          onClose={() => setShowWelcomeModal(false)}
          onUpgradeClick={handleUpgradeClick}
        />
      </div>
    </Router>
  );
}

export default App;