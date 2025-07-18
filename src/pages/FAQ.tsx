import React, { useState } from 'react';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqData = [
  {
    question: 'What is MementoLocker?',
    answer: 'MementoLocker is a digital time capsule service that allows you to preserve and share your precious memories with loved ones. You can upload photos, videos, audio messages, and written notes, then schedule them to be delivered at a specific date and time in the future.'
  },
  {
    question: 'How do I create my first time capsule?',
    answer: 'Creating your first time capsule is easy! Sign up for a free account, then click "Create Capsule" to start. You can upload content, write a personal message, add recipients, and set a delivery date. Our free trial lets you experience the full creation process.'
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! We offer a free trial that includes full access to our design tools and creation interface. To unlock the ability to send your first capsule, simply share MementoLocker on 3 social media platforms. This gives you a 30-day full trial with the ability to send one complete time capsule.'
  },
  {
    question: 'What are your pricing plans?',
    answer: 'We offer four plans: Free Trial (with social sharing requirement), Keepsake (£3.99/month), Heirloom (£8.99/month), and Legacy (£19.99/month). Each plan includes different storage amounts and features. Annual plans save you 20%.'
  },
  {
    question: 'What is Advanced Scheduling in the Legacy plan?',
    answer: 'Advanced Scheduling is a premium feature exclusive to our Legacy plan that allows you to modify the delivery date of your time capsules even after they have been sealed. This is perfect for situations where the exact date is uncertain, such as a grandparent creating a capsule for a grandchild\'s future wedding, or when dealing with terminal illness where timing may need adjustment. With this feature, you or a designated person can update the send date as circumstances change.'
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Absolutely! You can cancel your subscription at any time with no cancellation fees. Your account will remain active until the end of your current billing period, and you can still access your existing time capsules.'
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We do not offer refunds as we provide a comprehensive 30-day free trial period for you to fully evaluate our service before making any payment commitment. This trial period allows you to test all features and ensure our service meets your needs.'
  },
  {
    question: 'What types of files can I upload?',
    answer: 'You can upload photos (JPG, PNG), videos (MP4, MOV), and audio files (MP3, WAV). Each file can be up to 100MB in size. Our platform automatically optimizes your content for the best viewing experience.'
  },
  {
    question: 'How many recipients can I add?',
    answer: 'You can add unlimited recipients to your time capsules. Send the same capsule to as many people as you like - there are no restrictions on the number of recipients you can include.'
  },
  {
    question: 'Can I schedule delivery for any date?',
    answer: 'Yes! You can schedule your time capsule for delivery on any future date and time. Popular choices include birthdays, anniversaries, graduations, and other special milestones. There\'s no limit on how far in the future you can schedule delivery.'
  },
  {
    question: 'How secure are my memories?',
    answer: 'Your memories are protected with military-grade encryption both in transit and at rest. We use secure cloud storage with multiple backups to ensure your content is never lost. Only you and your designated recipients can access your time capsules.'
  },
  {
    question: 'Who can see my time capsules?',
    answer: 'Only you and the recipients you specify can access your time capsules. We never share your content with third parties, and our team cannot view your personal content. Your privacy is our top priority.'
  },
  {
    question: 'What happens if MementoLocker shuts down?',
    answer: 'We\'re committed to being here for the long term, but we understand this concern. We maintain multiple data backups and have contingency plans to ensure your memories are preserved. In the unlikely event of service discontinuation, we would provide advance notice and options to download your content.'
  },
  {
    question: 'What is the Custom Song service?',
    answer: 'Our Custom Song service creates personalized songs based on your memories and stories. Professional musicians compose original lyrics and melodies that capture the essence of your relationships and experiences. This service is currently in development.'
  },
  {
    question: 'When will Custom Songs be available?',
    answer: 'We\'re putting the finishing touches on our Custom Song service. Join our waitlist to be notified when it launches and receive special early-bird pricing. We expect to launch this service in the coming months.'
  },
  {
    question: 'How much will Custom Songs cost?',
    answer: 'Pricing details will be announced when the service launches. Legacy plan subscribers will receive one custom song per month as part of their subscription. Waitlist members will receive exclusive early-bird pricing.'
  }
];

export const FAQ: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFAQs = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about MementoLocker. Can't find what you're looking for? 
            Feel free to contact us.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12"
        >
          <div className="max-w-2xl mx-auto">
            <div className="search-bar">
              <Search className="search-icon" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                placeholder="Search for answers..."
              />
            </div>
          </div>
        </motion.div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto">
          {filteredFAQs.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="faq-section"
            >
              {filteredFAQs.map((faq, index) => {
                const itemId = `faq-${index}`;
                const isOpen = openItems.includes(itemId);

                return (
                  <div key={itemId} className="faq-item">
                    <button
                      onClick={() => toggleItem(itemId)}
                      className="faq-question"
                    >
                      <h3 className="text-lg font-medium text-gray-800 pr-4">
                        {faq.question}
                      </h3>
                      <ChevronDown className={`faq-icon ${isOpen ? 'open' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="faq-answer">
                            <p>{faq.answer}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                No results found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search terms or browse all questions.
              </p>
            </motion.div>
          )}
        </div>

        {/* Contact CTA - Updated with gold/tan color */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <div 
            className="rounded-3xl p-12 max-w-2xl mx-auto text-white"
            style={{ background: 'linear-gradient(135deg, #C0A172 0%, #A68B5B 100%)' }}
          >
            <h3 className="text-2xl font-bold mb-4">
              Still have questions?
            </h3>
            <p className="mb-6 opacity-90">
              Can't find the answer you're looking for? Our friendly support team is here to help.
            </p>
            <button
              onClick={() => window.location.href = '/contact'}
              className="bg-white text-amber-700 hover:bg-gray-100 font-semibold px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              Contact Support
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};