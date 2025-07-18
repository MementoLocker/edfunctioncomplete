import React from 'react';
import { Mail, MapPin, MessageCircle, Clock, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-max section-padding">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl lg:text-6xl font-bold gradient-text mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We'd love to hear from you. Reach out to us directly using the information below.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
          >
            <div className="card p-8">
              <div className="contact-item">
                <div className="contact-icon">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Email Us</h3>
                  <a 
                    href="mailto:support@mementolocker.com"
                    className="text-lg text-blue-600 hover:text-blue-800 transition-colors font-medium"
                  >
                    support@mementolocker.com
                  </a>
                  <p className="text-gray-500 text-sm mt-1">
                    Click to open your email client
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-8">
              <div className="contact-item">
                <div className="contact-icon bg-purple-100">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Location</h3>
                  <p className="text-gray-600">
                    Glasgow, Scotland<br />
                    United Kingdom
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-8">
              <div className="contact-item">
                <div className="contact-icon bg-green-100">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Response Time</h3>
                  <p className="text-gray-600">
                    We typically respond within 24 hours
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-8">
              <div className="contact-item">
                <div className="contact-icon bg-orange-100">
                  <MessageCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Support Hours</h3>
                  <p className="text-gray-600">
                    Monday - Friday<br />
                    9:00 AM - 5:00 PM GMT
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-16"
          >
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                Ready to Get Started?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Whether you have questions about our service, need technical support, or want to share feedback, 
                we're here to help. Send us an email and we'll get back to you as soon as possible.
              </p>
              
              <a
                href="mailto:support@mementolocker.com?subject=Inquiry from MementoLocker Website"
                className="btn-primary inline-flex items-center group text-lg px-8 py-4"
              >
                <Mail className="w-6 h-6 mr-3" />
                Send Us an Email
                <ExternalLink className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
              
              <p className="text-sm text-gray-500 mt-4">
                This will open your default email client with our address pre-filled
              </p>
            </div>
          </motion.div>

          {/* FAQ Reference */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Frequently Asked Questions
              </h3>
              <p className="text-gray-600 mb-6">
                Before reaching out, you might find your answer in our comprehensive FAQ section.
              </p>
              <button
                onClick={() => window.location.href = '/faq'}
                className="btn-outline"
              >
                Visit FAQ
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};