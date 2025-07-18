import React from 'react';
import { motion } from 'framer-motion';

export const Privacy: React.FC = () => {
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
            Privacy Policy
          </h1>
          
          <div className="bg-white rounded-none p-8 shadow-lg">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-8">
                Last updated: January 1, 2025
              </p>

              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>1. Information We Collect</h2>
              <p className="mb-6">
                We collect information you provide directly to us, such as when you create an account, upload content, or contact us for support. This includes your name, email address, and any content you choose to store in your time capsules.
              </p>

              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>2. How We Use Your Information</h2>
              <ul className="mb-6 space-y-2">
                <li>To provide and maintain our service</li>
                <li>To process your transactions and send you related information</li>
                <li>To send you technical notices and support messages</li>
                <li>To communicate with you about products, services, and events</li>
                <li>To monitor and analyze trends and usage</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>3. Information Sharing</h2>
              <p className="mb-6">
                We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this policy. We may share your information with service providers who assist us in operating our service, conducting our business, or serving our users.
              </p>

              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>4. Data Security</h2>
              <p className="mb-6">
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your content is encrypted both in transit and at rest using industry-standard encryption protocols.
              </p>

              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>5. Data Retention</h2>
              <p className="mb-6">
                We retain your personal information for as long as your account is active or as needed to provide you services. We will retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.
              </p>

              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>6. Your Rights</h2>
              <p className="mb-6">
                You have the right to access, update, or delete your personal information. You may also request that we restrict or stop processing your personal information. To exercise these rights, please contact us using the information provided below.
              </p>

              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>7. Cookies and Tracking</h2>
              <p className="mb-6">
                We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>

              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>8. Children's Privacy</h2>
              <p className="mb-6">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </p>

              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>9. Changes to This Policy</h2>
              <p className="mb-6">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>

              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>10. Contact Us</h2>
              <p className="mb-6">
                If you have any questions about this Privacy Policy, please contact us at support@mementolocker.com or by mail at our Glasgow, Scotland office.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};