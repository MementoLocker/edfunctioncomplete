import React from 'react';
import { motion } from 'framer-motion';

export const Copyright: React.FC = () => {
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
            Copyright Notice
          </h1>
          
          <div className="bg-white rounded-none p-8 shadow-lg">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 mb-8">
                Last updated: January 1, 2025
              </p>

              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Copyright Ownership</h2>
              <p className="mb-6">
                All content on the MementoLocker website and service, including but not limited to text, graphics, logos, images, audio clips, video clips, digital downloads, data compilations, and software, is the property of MementoLocker or its content suppliers and is protected by international copyright laws.
              </p>

              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>User Content Rights</h2>
              <p className="mb-6">
                You retain all rights to the content you upload to MementoLocker. By uploading content, you grant us a limited, non-exclusive license to store, process, and deliver your content according to your instructions. We do not claim ownership of your personal content.
              </p>

              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Instrumental Music Library Licensing</h2>
              <p className="mb-4">
                MementoLocker provides subscribers with access to our curated instrumental music library. The following terms apply to the use of music from our library:
              </p>
              
              <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Commercial Use Rights</h3>
              <ul className="mb-6 space-y-2 list-disc list-inside">
                <li><strong>Full Commercial License:</strong> All music in our library comes with full personal and commercial use rights</li>
                <li><strong>No Royalty Payments:</strong> Use our music in any project without ongoing royalty obligations</li>
                <li><strong>No Attribution Required:</strong> While appreciated, you are not required to credit MementoLocker or the composer</li>
                <li><strong>Unlimited Projects:</strong> Use the same track in multiple projects without additional licensing fees</li>
                <li><strong>Worldwide Rights:</strong> License covers global distribution and use</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Permitted Uses</h3>
              <ul className="mb-6 space-y-2 list-disc list-inside">
                <li>Time capsules and personal memory projects</li>
                <li>Business presentations and corporate videos</li>
                <li>Marketing materials and advertisements</li>
                <li>Social media content and campaigns</li>
                <li>Podcasts and audio productions</li>
                <li>Educational materials and training videos</li>
                <li>Film and video productions (independent and commercial)</li>
                <li>Live events and performances (as background music)</li>
                <li>Mobile apps and software applications</li>
                <li>Websites and online platforms</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>License Restrictions</h3>
              <ul className="mb-6 space-y-2 list-disc list-inside">
                <li><strong>No Resale:</strong> You cannot sell, license, or distribute our music tracks as standalone audio files</li>
                <li><strong>No Music Libraries:</strong> Tracks cannot be included in other music libraries or stock music collections</li>
                <li><strong>No Remixing for Resale:</strong> While you may edit tracks for your projects, you cannot create remixes for commercial distribution</li>
                <li><strong>Active Subscription Required:</strong> Commercial use rights are valid only while your MementoLocker subscription is active</li>
                <li><strong>No Offensive Content:</strong> Music cannot be used in content that is defamatory, pornographic, or promotes illegal activities</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>License Duration and Territory</h3>
              <ul className="mb-6 space-y-2 list-disc list-inside">
                <li><strong>Perpetual License:</strong> Once downloaded during an active subscription, you may continue using the music in existing projects even after subscription cancellation</li>
                <li><strong>New Downloads:</strong> Access to download new tracks requires an active subscription</li>
                <li><strong>Global Territory:</strong> License covers worldwide use and distribution</li>
                <li><strong>All Media:</strong> License covers use across all media formats and platforms</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Quality and Formats</h3>
              <ul className="mb-6 space-y-2 list-disc list-inside">
                <li>High-quality audio files (320kbps MP3 or higher)</li>
                <li>Professional studio recordings</li>
                <li>Optimized for various playback systems</li>
                <li>Regular quality assurance and updates</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>Support and Licensing Questions</h3>
              <p className="mb-6">
                If you have specific questions about licensing, permitted uses, or need clarification for a particular project, 
                please contact our licensing team at <a href="mailto:support@mementolocker.com" className="text-blue-600 hover:text-blue-800">support@mementolocker.com</a>. 
                We're here to help ensure you can use our music confidently in your projects.
              </p>
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Permitted Use</h2>
              <p className="mb-6">
                You may use our service for personal, non-commercial purposes in accordance with our Terms of Service. You may not reproduce, distribute, modify, or create derivative works of our copyrighted materials without express written permission.
              </p>

              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Copyright Infringement</h2>
              <p className="mb-6">
                We respect the intellectual property rights of others and expect our users to do the same. If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement, please contact us immediately.
              </p>

              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>DMCA Notice</h2>
              <p className="mb-6">
                If you are a copyright owner and believe that content on our service infringes your copyright, you may submit a DMCA takedown notice to support@mementolocker.com. Please include:
              </p>
              <ul className="mb-6 space-y-2">
                <li>A description of the copyrighted work that you claim has been infringed</li>
                <li>A description of where the infringing material is located on our service</li>
                <li>Your contact information</li>
                <li>A statement that you have a good faith belief that the use is not authorized</li>
                <li>A statement that the information in your notice is accurate</li>
                <li>Your physical or electronic signature</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Trademark Notice</h2>
              <p className="mb-6">
                MementoLocker and the MementoLocker logo are trademarks of MementoLocker Ltd. All other trademarks, service marks, and trade names used on our service are the property of their respective owners.
              </p>

              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Contact Information</h2>
              <p className="mb-6">
                For copyright-related inquiries, please contact us at:
                <br />
                Email: support@mementolocker.com
                <br />
                Address: MementoLocker Ltd, Glasgow, Scotland
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};