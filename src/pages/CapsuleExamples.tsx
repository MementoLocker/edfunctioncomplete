import React, { useState } from 'react';
import { Play, Heart, Calendar, Users, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const exampleCapsules = [
  {
    id: 1,
    title: "Sarah's 18th Birthday Surprise",
    sender: "Mom & Dad",
    deliveryDate: "March 15, 2024",
    recipients: ["Sarah Mitchell"],
    theme: "classic",
    backgroundColor: "#FDF8F1",
    message: "My dearest Sarah, as you turn 18 today, we wanted to share some of our favorite memories from when you were little. You've grown into such an amazing young woman, and we couldn't be prouder. Remember that no matter how far you go in life, you'll always be our little girl. We love you more than words can express.",
    photos: [
      "https://umrxpbudpexhgpnynstb.supabase.co/storage/v1/object/public/avatars//pexels-pavel-danilyuk-7220922.jpg",
      "https://umrxpbudpexhgpnynstb.supabase.co/storage/v1/object/public/avatars//pexels-pavel-danilyuk-7220530.jpg"
    ],
    type: "Birthday Milestone"
  },
  {
    id: 2,
    title: "Wedding Day Memories",
    sender: "The Thompson Family",
    deliveryDate: "June 20, 2024",
    recipients: ["Emma & James"],
    theme: "elegant",
    backgroundColor: "#F4F6F7",
    message: "To our beautiful daughter Emma and wonderful son-in-law James, on your wedding day we want you to know how blessed we feel to witness your love story. These photos capture just a few of the moments that led to this perfect day. May your marriage be filled with as much joy and laughter as these memories bring us.",
    photos: [
      "https://umrxpbudpexhgpnynstb.supabase.co/storage/v1/object/public/avatars//Gemini_Generated_Image_3r32gw3r32gw3r32.jpeg",
      "https://umrxpbudpexhgpnynstb.supabase.co/storage/v1/object/public/avatars//Gemini_Generated_Image_oj97jsoj97jsoj97.jpeg"
    ],
    type: "Wedding"
  },
  {
    id: 3,
    title: "Grandpa's Wisdom",
    sender: "Grandpa Joe",
    deliveryDate: "December 25, 2024",
    recipients: ["Michael", "Sophie", "David"],
    theme: "modern",
    backgroundColor: "#FAF8F4",
    message: "My dear grandchildren, by the time you read this, I may not be able to tell you these stories in person. But I want you to know about your grandmother and the adventures we had together. These photos show the love that created your family. Always remember where you came from, and know that you are deeply loved.",
    photos: [
      "https://umrxpbudpexhgpnynstb.supabase.co/storage/v1/object/public/avatars//Gemini_Generated_Image_2adlou2adlou2adl.jpeg",
      "https://umrxpbudpexhgpnynstb.supabase.co/storage/v1/object/public/avatars//Gemini_Generated_Image_khfl9vkhfl9vkhfl.jpeg"
    ],
    type: "Legacy Message"
  }
];

export const CapsuleExamples: React.FC = () => {
  const [selectedCapsule, setSelectedCapsule] = useState(0);
  const [isViewing, setIsViewing] = useState(false);

  const currentCapsule = exampleCapsules[selectedCapsule];

  const nextCapsule = () => {
    setSelectedCapsule((prev) => (prev + 1) % exampleCapsules.length);
  };

  const prevCapsule = () => {
    setSelectedCapsule((prev) => (prev - 1 + exampleCapsules.length) % exampleCapsules.length);
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-serif font-bold gradient-text mb-4">
            Time Capsule Examples
          </h1>
          <p className="text-xl text-dusty-600 max-w-3xl mx-auto">
            See how families use MementoLocker to create beautiful, meaningful time capsules 
            that preserve their most precious memories.
          </p>
        </motion.div>

        {!isViewing ? (
          <div className="space-y-8">
            {/* Capsule Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {exampleCapsules.map((capsule, index) => (
                <motion.div
                  key={capsule.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className={`card p-6 cursor-pointer transition-all duration-300 ${
                    selectedCapsule === index ? 'ring-2 ring-dusty-500 scale-105' : 'hover:scale-102'
                  }`}
                  onClick={() => setSelectedCapsule(index)}
                >
                  <div className="text-center mb-4">
                    <img
                      src={capsule.photos[0]}
                      alt={capsule.title}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                    <h3 className="text-lg font-serif font-bold text-dusty-800 mb-2">
                      {capsule.title}
                    </h3>
                    <p className="text-sm text-dusty-600 mb-2">
                      From: {capsule.sender}
                    </p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sepia-100 text-sepia-700">
                      {capsule.type}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Selected Capsule Preview */}
            <motion.div
              key={selectedCapsule}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="card p-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-dusty-800 mb-4">
                    {currentCapsule.title}
                  </h2>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-dusty-500" />
                      <span className="text-dusty-600">
                        From: <strong>{currentCapsule.sender}</strong>
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-dusty-500" />
                      <span className="text-dusty-600">
                        Delivered: <strong>{currentCapsule.deliveryDate}</strong>
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Heart className="w-5 h-5 text-dusty-500" />
                      <span className="text-dusty-600">
                        Recipients: <strong>{currentCapsule.recipients.join(', ')}</strong>
                      </span>
                    </div>
                  </div>

                  <p className="text-dusty-600 leading-relaxed mb-6">
                    {currentCapsule.message.substring(0, 200)}...
                  </p>

                  <button
                    onClick={() => setIsViewing(true)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Play className="w-5 h-5" />
                    <span>View Full Capsule</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {currentCapsule.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Memory ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-dusty-200">
                <button
                  onClick={prevCapsule}
                  className="flex items-center space-x-2 text-dusty-600 hover:text-dusty-800 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Previous</span>
                </button>
                
                <div className="flex space-x-2">
                  {exampleCapsules.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedCapsule(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        selectedCapsule === index ? 'bg-dusty-500' : 'bg-dusty-200'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextCapsule}
                  className="flex items-center space-x-2 text-dusty-600 hover:text-dusty-800 transition-colors"
                >
                  <span>Next</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto"
            >
              {/* Full Capsule View */}
              <div 
                className="bg-white rounded-2xl shadow-2xl p-8 md:p-12"
                style={{ backgroundColor: currentCapsule.backgroundColor }}
              >
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-serif font-bold text-dusty-800 mb-4">
                    {currentCapsule.title}
                  </h1>
                  <p className="text-dusty-600">
                    A special message from {currentCapsule.sender}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {currentCapsule.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Memory ${index + 1}`}
                      className="w-full h-64 object-cover rounded-lg shadow-md"
                    />
                  ))}
                </div>

                <div className="prose prose-lg max-w-none mb-8">
                  <p className="text-dusty-700 leading-relaxed text-lg">
                    {currentCapsule.message}
                  </p>
                </div>

                <div className="border-t border-dusty-200 pt-6 text-center">
                  <p className="text-sm text-dusty-500 mb-2">
                    Delivered with love on {currentCapsule.deliveryDate}
                  </p>
                  <p className="text-xs text-dusty-400">
                    Created with MementoLocker
                  </p>
                </div>
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={() => setIsViewing(false)}
                  className="btn-outline mr-4"
                >
                  Back to Examples
                </button>
                <button
                  onClick={() => window.location.href = '/create-capsule'}
                  className="btn-primary"
                >
                  Create Your Own
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};