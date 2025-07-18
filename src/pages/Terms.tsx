import React from 'react';
import { motion } from 'framer-motion';

export const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-max section-padding">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl lg:text-5xl font-bold mb-8 text-center" style={{ fontFamily: 'Playfair Display, serif', color: '#2D2D2D' }}>
            Terms & Conditions
          </h1>
          
          <div className="bg-white rounded-none p-8 shadow-lg">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-8">
                Last updated: January 1, 2025
              </p>

              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>1. Acceptance of Terms</h2>
              <p className="mb-6">
                By accessing and using MementoLocker's services, you accept and agree to be bound by the terms and provision of this agreement.
              </p>

              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>2. Service Description</h2>
              <p className="mb-6">
                MementoLocker provides digital time capsule services that allow users to store and schedule delivery of digital content including photos, videos, audio files, and text messages to designated recipients at future dates.
              </p>

              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>3. User Responsibilities</h2>
              <ul className="mb-6 space-y-2">
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must provide accurate and complete information when creating your account</li>
                <li>You are solely responsible for all content uploaded to our service</li>
                <li>You must not upload content that violates any laws or infringes on third-party rights</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>4. Content Ownership and License</h2>
              <p className="mb-6">
                You retain ownership of all content you upload. By using our service, you grant MementoLocker a limited license to store, process, and deliver your content according to your instructions.
              </p>

              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>5. Privacy and Data Protection</h2>
              <p className="mb-6">
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.
              </p>

              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>6. Payment Terms</h2>
              <p className="mb-6">
                Subscription fees are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law or as specified in our refund policy.
              </p>

              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>7. Service Availability</h2>
              <p className="mb-6">
                While we strive for 99.9% uptime, we cannot guarantee uninterrupted service. We are not liable for any damages resulting from service interruptions.
              </p>

              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>8. Limitation of Liability</h2>
              <p className="mb-6">
                MementoLocker's liability is limited to the amount paid for the service in the 12 months preceding any claim. We are not liable for indirect, incidental, or consequential damages.
              </p>

              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>9. Termination</h2>
              <p className="mb-6">
                Either party may terminate this agreement at any time. Upon termination, your access to the service will cease, and your data may be deleted according to our data retention policy.
              </p>

              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>10. Changes to Terms</h2>
              <p className="mb-6">
                We reserve the right to modify these terms at any time. Changes will be effective upon posting to our website. Continued use of the service constitutes acceptance of modified terms.
              </p>

              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>11. Contact Information</h2>
              <p className="mb-6">
                If you have any questions about these Terms & Conditions, please contact us at support@mementolocker.com.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};