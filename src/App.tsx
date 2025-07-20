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
import { signOut, supabase } from './lib/supabase';

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
  const { user, loading } = useAuth();
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'signin' | 'signup' }>({
    isOpen: false,
    mode: 'signin'
  });
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Check for first-time login and show welcome modal
  useEffect(() => {
    if (user && !loading) {
      checkFirstTimeLogin();
      fetchUserProfile();
    }
  }, [user, loading]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const checkFirstTimeLogin = async () => {
    if (!user) return;

    try {
      // Check if user has a profile and if it's their first login
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it and set up trial
        const trialStartDate = new Date();
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 30);

        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0],
            email: user.email,
            subscription_status: 'trial',
            trial_start_date: trialStartDate.toISOString(),
            trial_end_date: trialEndDate.toISOString(),
            capsules_sent: 0,
            social_shares_completed: 0
          });

        if (insertError) throw insertError;

        // Show welcome modal for new users
        setShowWelcomeModal(true);
      } else if (profile && profile.subscription_status === 'trial' && !profile.trial_start_date) {
        // Existing user but trial not set up properly
        const trialStartDate = new Date();
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 30);

        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'trial',
            trial_start_date: trialStartDate.toISOString(),
            trial_end_date: trialEndDate.toISOString()
          })
          .eq('id', user.id);

        if (updateError) throw updateError;

        setShowWelcomeModal(true);
      }
    } catch (error) {
      console.error('Error checking first time login:', error);
    }
  };

  const handleSignIn = () => {
    setAuthModal({ isOpen: true, mode: 'signin' });
  };

  const handleSignUp = () => {
    setAuthModal({ isOpen: true, mode: 'signup' });
  };

  const handleSignOut = async () => {
    await signOut();
    setUserProfile(null);
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
    setShowWelcomeModal(false);
    // Navigate to pricing section
    setTimeout(() => {
      window.location.href = '/#pricing';
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: '#C0A172' }}></div>
      </div>
    );
  }

  const userWithProfile = user ? {
    ...user,
    name: userProfile?.name || user.user_metadata?.name || user.email!.split('@')[0],
    email: user.email!,
    avatar_url: userProfile?.avatar_url
  } : null;

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header 
          user={userWithProfile}
          onSignIn={handleSignIn} 
          onSignOut={handleSignOut}
        />
        
        <main className="flex-1">
          <Routes>
            <Route 
              path="/" 
              element={<Home onGetStarted={handleGetStarted} onSignIn={handleSignIn} onSignUp={handleSignUp} />} 
            />
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