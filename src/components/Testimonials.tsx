import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface TestimonialsProps {
  onSignIn?: () => void;
}

const initialReviews = [
  {
    id: 1,
    name: 'Sarah',
    comment: 'Creating a time capsule for my daughter\'s 18th birthday was so intuitive and the final result brought tears to our eyes. It\'s amazing how technology can preserve such precious moments.'
  },
  {
    id: 2,
    name: 'James',
    comment: 'As a grandfather, I wanted to share stories with my grandchildren that they could treasure forever. This made it possible to create something truly special that will be delivered on their graduation day.'
  },
  {
    id: 3,
    name: 'Emma',
    comment: 'I used this service to create a surprise for my husband on our 25th anniversary. The ability to schedule delivery and include photos, videos, and personal messages made it the perfect gift.'
  },
  {
    id: 4,
    name: 'Michael',
    comment: 'The security and reliability gave me confidence to store our family\'s most precious memories. Knowing they\'ll be safely delivered to my children in the future brings me such peace of mind.'
  }
];

export const Testimonials: React.FC<TestimonialsProps> = ({ onSignIn }) => {
  const { user } = useAuth();

  const handleLeaveReviewClick = () => {
    if (user) {
      // User is logged in, navigate to leave review page
      window.location.href = '/leave-review';
    } else {
      // User is not logged in, open sign-in modal
      onSignIn?.();
    }
  };

  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="section-title">
            Stories from Our Community
          </h2>
          <p className="section-subtitle">
            Join thousands of families who trust us to preserve and share their most precious memories. 
            Here's what they have to say about their experience.
          </p>
        </motion.div>

        {/* Four Initial Reviews - Text Only */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {initialReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-lg p-8 border border-gray-200"
            >
              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "{review.comment}"
              </p>
              <div className="text-right">
                <p className="font-semibold text-gray-800" style={{ fontFamily: 'Playfair Display, serif' }}>
                  — {review.name}
                </p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mt-2" style={{ backgroundColor: '#C0A172', color: 'white' }}>
                  Time Capsule
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* See What Our Clients Are Saying Button */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <Link
            to="/client-reviews"
            className="btn-primary inline-flex items-center group text-lg px-8 py-4"
          >
            See what our clients are saying
            <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Leave a Review Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-amber-800 to-amber-900 rounded-none p-16 text-white" style={{ background: 'linear-gradient(to right, #C0A172, #A68B5B)' }}>
            <h3 className="text-4xl font-semibold mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
              Share Your Story
            </h3>
            <p className="text-xl mb-12 max-w-3xl mx-auto opacity-90">
              Have you used our service to preserve your memories? We'd love to hear about your experience 
              and share it with others who are considering our service.
            </p>
            <button
              onClick={handleLeaveReviewClick}
              className="bg-white text-amber-800 hover:bg-gray-100 font-medium px-8 py-4 rounded-none transition-all duration-500 hover:shadow-xl inline-flex items-center justify-center group uppercase tracking-wider"
            >
              Leave Your Review
              <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};