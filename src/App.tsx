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
import { supabase } from './lib/supabase';

// This component scrolls the window to the top on navigation
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  // Use our single, reliable source of truth for user data
  const { user, profile, loading, signOut } = useAuth();
  
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'signin' | 'signup' }>({
    isOpen: false,
    mode: 'signin'
  });
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // When a new user signs in for the first time, create their profile
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
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header 
          user={user}
          profile={profile}
          onSignIn={handleSignIn} 
          onSignOut={handleSignOut}
        />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home onGetStarted={handleGetStarted} onSignIn={handleSignIn} onSignUp={handleSignUp} />} />
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
