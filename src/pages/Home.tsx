import React from 'react';
import { Hero } from '../components/Hero';
import { WhyMementoLocker } from '../components/WhyMementoLocker';
import { HowItWorks } from '../components/HowItWorks';
import { InstrumentalMusicSection } from '../components/InstrumentalMusicSection';
import { PricingSection } from '../components/pricing/PricingSection';
import { CustomSongSection } from '../components/CustomSongSection';
import { Testimonials } from '../components/Testimonials';

interface HomeProps {
  onGetStarted?: () => void;
  onSignIn?: () => void;
  onSignUp?: () => void;
}

export const Home: React.FC<HomeProps> = ({ onGetStarted, onSignIn, onSignUp }) => {
  const handleLearnMore = () => {
    window.location.href = '/about';
  };

  return (
    <div>
      <Hero onGetStarted={onGetStarted} onSignIn={onSignIn} onSignUp={onSignUp} />
      <WhyMementoLocker onGetStarted={onGetStarted} onLearnMore={handleLearnMore} onSignUp={onSignUp} />
      <HowItWorks />
      <InstrumentalMusicSection />
      <PricingSection onSignIn={onSignIn} onSignUp={onSignUp} />
      <CustomSongSection />
      <Testimonials onSignIn={onSignIn} />
    </div>
  );
};