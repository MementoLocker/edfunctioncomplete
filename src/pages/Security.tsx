import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Database, Server, Eye, Key } from 'lucide-react';

export const Security: React.FC = () => {
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
            Your Security is Our Priority
          </h1>
          
          <div className="bg-white rounded-none p-8 shadow-lg mb-12">
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-600 mb-8 text-center">
                At MementoLocker, we understand that your memories are irreplaceable. That's why we've built our platform 
                with enterprise-grade security measures to ensure your precious content remains safe, private, and accessible only to you.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    Built on Supabase
                  </h3>
                  <p className="text-gray-600">
                    Our platform is built on Supabase, a secure and reliable backend-as-a-service that provides 
                    enterprise-grade infrastructure with built-in security features.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                    End-to-End Encryption
                  </h3>
                  <p className="text-gray-600">
                    All your data is encrypted both in transit and at rest using industry-standard AES-256 encryption, 
                    ensuring your memories remain private and secure.
                  </p>
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Security Features</h2>

              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Database className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Secure Database with Row-Level Security
                    </h3>
                    <p className="text-gray-600">
                      Our database implements Row-Level Security (RLS) policies, ensuring that users can only access their own data. 
                      This means your time capsules and personal information are completely isolated from other users' data.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Key className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Secure Authentication
                    </h3>
                    <p className="text-gray-600">
                      We use Supabase's robust authentication system with secure password hashing, email verification, 
                      and protection against common attacks like brute force and credential stuffing.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Server className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Secure File Storage
                    </h3>
                    <p className="text-gray-600">
                      Your photos, videos, and audio files are stored in Supabase's secure storage system with 
                      access controls and automatic backups to prevent data loss.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Eye className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                      Privacy by Design
                    </h3>
                    <p className="text-gray-600">
                      We follow privacy-by-design principles, meaning we collect only the minimum data necessary 
                      and never share your personal information with third parties without your explicit consent.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-6 mt-12" style={{ fontFamily: 'Playfair Display, serif' }}>Compliance & Standards</h2>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center">
                    <Shield className="w-5 h-5 text-green-600 mr-3" />
                    <span><strong>GDPR Compliant:</strong> We adhere to European data protection regulations</span>
                  </li>
                  <li className="flex items-center">
                    <Shield className="w-5 h-5 text-green-600 mr-3" />
                    <span><strong>SOC 2 Type II:</strong> Supabase maintains SOC 2 Type II compliance</span>
                  </li>
                  <li className="flex items-center">
                    <Shield className="w-5 h-5 text-green-600 mr-3" />
                    <span><strong>ISO 27001:</strong> Following international security management standards</span>
                  </li>
                  <li className="flex items-center">
                    <Shield className="w-5 h-5 text-green-600 mr-3" />
                    <span><strong>Regular Security Audits:</strong> Continuous monitoring and vulnerability assessments</span>
                  </li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>Your Data Rights</h2>
              
              <p className="text-gray-600 mb-6">
                You have complete control over your data. You can:
              </p>
              
              <ul className="space-y-2 text-gray-600 mb-8">
                <li>• Access and download all your data at any time</li>
                <li>• Delete your account and all associated data</li>
                <li>• Control who can access your time capsules</li>
                <li>• Modify or update your information</li>
                <li>• Request data portability</li>
              </ul>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-blue-800 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Questions About Security?
                </h3>
                <p className="text-blue-700 mb-4">
                  If you have any questions about our security practices or need to report a security concern, 
                  please don't hesitate to contact our security team.
                </p>
                <a 
                  href="mailto:support@mementolocker.com" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  support@mementolocker.com
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};