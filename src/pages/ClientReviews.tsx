import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const allReviews = [
  {
    id: 1,
    name: 'Sarah',
    rating: 5,
    comment: 'Creating a time capsule for my daughter\'s 18th birthday was so intuitive and the final result brought tears to our eyes.'
  },
  {
    id: 2,
    name: 'James',
    rating: 5,
    comment: 'As a grandfather, I wanted to share stories with my grandchildren that they could treasure forever. This made it possible to create something truly special.'
  },
  {
    id: 3,
    name: 'Emma',
    rating: 5,
    comment: 'I used this service to create a surprise for my husband on our 25th anniversary. The ability to schedule delivery made it the perfect gift.'
  },
  {
    id: 4,
    name: 'Michael',
    rating: 4,
    comment: 'The security and reliability gave me confidence to store our family\'s most precious memories.'
  },
  {
    id: 5,
    name: 'Lisa',
    rating: 5,
    comment: 'Creating a time capsule for my son\'s wedding was one of the most meaningful things I\'ve ever done.'
  },
  {
    id: 6,
    name: 'Robert',
    rating: 5,
    comment: 'The customer service is exceptional. They helped me through every step of creating my first time capsule.'
  },
  {
    id: 7,
    name: 'Maria',
    rating: 4,
    comment: 'I love how this preserves not just photos, but the emotions and stories behind them.'
  },
  {
    id: 8,
    name: 'David',
    rating: 5,
    comment: 'The scheduling feature is brilliant. I\'ve created multiple time capsules for different occasions.'
  },
  {
    id: 9,
    name: 'Jennifer',
    rating: 5,
    comment: 'This helped me honor my late mother\'s memory by creating a time capsule for my children.'
  },
  {
    id: 10,
    name: 'Christopher',
    rating: 4,
    comment: 'The quality of the final time capsule presentation is outstanding. Every detail is thoughtfully designed.'
  },
  {
    id: 11,
    name: 'Amanda',
    rating: 5,
    comment: 'I was skeptical about digital time capsules at first, but this changed my mind completely.'
  },
  {
    id: 12,
    name: 'Thomas',
    rating: 5,
    comment: 'The ability to include multiple types of media makes this so much more than just a photo storage service.'
  },
  {
    id: 13,
    name: 'Rachel',
    rating: 5,
    comment: 'I created a time capsule for my daughter\'s first day of college. The tears of joy when she received it made every moment worthwhile.'
  },
  {
    id: 14,
    name: 'Kevin',
    rating: 4,
    comment: 'Perfect for military families like ours. I can create messages for my children while deployed.'
  },
  {
    id: 15,
    name: 'Nicole',
    rating: 5,
    comment: 'The privacy and security features give me complete confidence in storing our precious memories.'
  },
  {
    id: 16,
    name: 'Daniel',
    rating: 5,
    comment: 'Creating a time capsule for our 50th wedding anniversary was the perfect way to share our love story.'
  },
  {
    id: 17,
    name: 'Stephanie',
    rating: 4,
    comment: 'The customization options are incredible. I was able to create something that perfectly reflected our family\'s personality.'
  },
  {
    id: 18,
    name: 'Mark',
    rating: 5,
    comment: 'I\'ve used this for multiple occasions now - birthdays, graduations, anniversaries. Each time capsule feels unique.'
  },
  {
    id: 19,
    name: 'Laura',
    rating: 5,
    comment: 'The emotional impact of receiving a time capsule is indescribable. It\'s like getting a hug from the past.'
  },
  {
    id: 20,
    name: 'Steven',
    rating: 4,
    comment: 'This helped me create a legacy for my children that goes beyond material possessions.'
  },
  {
    id: 21,
    name: 'Michelle',
    rating: 5,
    comment: 'The user interface is so intuitive that even someone like me, who isn\'t tech-savvy, could create something beautiful.'
  },
  {
    id: 22,
    name: 'Brian',
    rating: 5,
    comment: 'I appreciate how this service respects the significance of the memories we\'re preserving.'
  },
  {
    id: 23,
    name: 'Catherine',
    rating: 4,
    comment: 'Creating time capsules has become a family tradition for us. It makes capturing special moments so easy.'
  }
];

export const ClientReviews: React.FC = () => {
  const { user } = useAuth();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLeaveReviewClick = () => {
    if (user) {
      window.location.href = '/leave-review';
    } else {
      // This would trigger the sign-in modal, but since we don't have access to it here,
      // we'll redirect to home page where they can sign in
      window.location.href = '/?signin=true';
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-current' : 'text-gray-300'
            }`}
            style={{ color: star <= rating ? '#C0A172' : undefined }}
          />
        ))}
      </div>
    );
  };

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
            Client Reviews
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Read what our clients have to say about their experience. 
            These are real stories from real families who have used our service to preserve their precious memories.
          </p>
        </motion.div>

        {/* All Reviews in Vertical Layout */}
        <div className="max-w-4xl mx-auto space-y-6 mb-16">
          {allReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              className="bg-white rounded-lg p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-gray-800 mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {review.name}
                  </p>
                  {renderStars(review.rating)}
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800" style={{ backgroundColor: '#C0A172', color: 'white' }}>
                  Time Capsule
                </span>
              </div>
              <p className="text-gray-700 leading-relaxed italic">
                "{review.comment}"
              </p>
            </motion.div>
          ))}
        </div>

        {/* Leave a Review Button */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-amber-800 to-amber-900 rounded-lg p-12 max-w-2xl mx-auto text-white" style={{ background: 'linear-gradient(to right, #C0A172, #A68B5B)' }}>
            <h3 className="text-3xl font-semibold mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              Share Your Story
            </h3>
            <p className="text-lg mb-8 opacity-90">
              Have you used our service to create a time capsule? We'd love to hear about your experience!
            </p>
            <button
              onClick={handleLeaveReviewClick}
              className="bg-white text-amber-800 hover:bg-gray-100 font-medium px-8 py-4 rounded-lg transition-all duration-300 hover:shadow-xl inline-flex items-center justify-center group uppercase tracking-wider"
            >
              Leave a Review
              <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};