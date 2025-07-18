import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface WhyMementoLockerProps {
  onGetStarted?: () => void;
  onLearnMore?: () => void;
  onSignUp?: () => void;
}

export const WhyMementoLocker: React.FC<WhyMementoLockerProps> = ({ onGetStarted, onLearnMore, onSignUp }) => {
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
    <section id="why-mementolocker" className="section-padding bg-white">
      <div className="container-max">
        <div className="two-column">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              More Than Storage. A Bridge to the Future.
            </h2>
            
            <div className="space-y-6 text-lg leading-relaxed text-gray-600">
              <p>
                In a world where digital memories scatter across devices and platforms, MementoLocker creates something profound: 
                a way to send love across time. Whether you're a grandparent wanting to share wisdom with grandchildren on their 
                21st birthday, or a parent preserving childhood magic for your child's wedding day, we understand that some messages 
                are meant for tomorrow.
              </p>

              <p>
                Our platform doesn't just store your memories—it delivers them with the emotional weight 
                and perfect timing they deserve, creating moments of connection that transcend time itself. 
                This is your digital legacy, preserved with the elegance and security it deserves.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={handleStartJourney}
                className="btn-primary"
              >
                Start Your Journey
              </button>
              <button 
                onClick={onLearnMore}
                className="btn-secondary"
              >
                Learn More
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="w-full h-96 rounded-none overflow-hidden shadow-lg">
              <img
                src="https://umrxpbudpexhgpnynstb.supabase.co/storage/v1/object/public/avatars//Gemini_Generated_Image_sewna0sewna0sewn.jpeg"
                alt="Older person's hands holding a glowing polaroid photo"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};