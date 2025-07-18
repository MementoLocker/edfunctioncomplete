import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Mail, MapPin } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface FooterProps {
  onSignIn?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSignIn }) => {
  const { user } = useAuth();

  const handleDigitalTimeCapsuleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      // User is logged in, navigate to their capsules dashboard
      window.location.href = '/create-capsule';
    } else {
      // User is not logged in, open sign-in modal
      onSignIn?.();
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-max section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="text-white">
              <Logo className="text-white" />
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Based in Glasgow, Scotland, we're passionate about helping people preserve 
              their most precious moments for future generations with our elegant digital memory service.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4" style={{ color: '#C0A172' }} />
                <span className="text-gray-300">Glasgow, Scotland</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4" style={{ color: '#C0A172' }} />
                <a href="mailto:support@mementolocker.com" className="text-gray-300 hover:text-white transition-colors">
                  support@mementolocker.com
                </a>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-6 text-white uppercase tracking-wider" style={{ fontFamily: 'Playfair Display, serif' }}>Services</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={handleDigitalTimeCapsuleClick}
                  className="text-gray-300 hover:text-white transition-colors uppercase tracking-wider text-left"
                >
                  Digital Time Capsules
                </button>
              </li>
              <li>
                <Link to="/custom-song" className="text-gray-300 hover:text-white transition-colors uppercase tracking-wider">
                  Custom Songs
                </Link>
              </li>
              <li>
                <Link to="/capsule-examples" className="text-gray-300 hover:text-white transition-colors uppercase tracking-wider">
                  Capsule Examples
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-6 text-white uppercase tracking-wider" style={{ fontFamily: 'Playfair Display, serif' }}>Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-white transition-colors uppercase tracking-wider">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors uppercase tracking-wider">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors uppercase tracking-wider">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-serif text-lg font-semibold mb-6 text-white uppercase tracking-wider" style={{ fontFamily: 'Playfair Display, serif' }}>Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors uppercase tracking-wider">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-white transition-colors uppercase tracking-wider">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-gray-300 hover:text-white transition-colors uppercase tracking-wider">
                  Security
                </Link>
              </li>
              <li>
                <Link to="/copyright" className="text-gray-300 hover:text-white transition-colors uppercase tracking-wider">
                  Copyright
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 MementoLocker. All rights reserved. Made with ❤️ in Glasgow, Scotland.</p>
          <p className="mt-2 uppercase tracking-wider">Elegant Legacy</p>
        </div>
      </div>
    </footer>
  );
};