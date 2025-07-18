import React from 'react';
import { Heart, MapPin, Users, Award, Globe, Shield, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container-max">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl lg:text-7xl font-bold gradient-text mb-6">
              About Us
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              We're a passionate team based in Glasgow, Scotland, dedicated to helping people preserve 
              their most precious moments for future generations. Our mission is to create meaningful 
              connections across time through the power of digital storytelling.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Video Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-max">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-title mb-6">
              Your Memories, Our Responsibility
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-4">
              <video
                className="w-full h-auto rounded-lg"
                autoPlay
                controls
                playsInline
                preload="metadata"
                style={{ maxHeight: '600px' }}
              >
                <source 
                  src="https://umrxpbudpexhgpnynstb.supabase.co/storage/v1/object/public/avatars//Memento_Locker_Stories_Alive.mp4" 
                  type="video/mp4" 
                />
                Your browser does not support the video tag.
              </video>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="section-padding">
        <div className="container-max about-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="about-section"
          >
            <div className="about-text">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Our Story
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                The idea for our service came to us when we realized how many precious family 
                moments were being lost to time. Photos scattered across devices, videos forgotten 
                in cloud storage, and stories that were never properly shared with the people who 
                mattered most.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                We wanted to create something more than just another storage service. We envisioned 
                a platform that would help families create meaningful experiences - a way for 
                grandparents to share their wisdom with grandchildren on their 18th birthday, 
                for parents to surprise their children with childhood memories on their wedding day, 
                or for friends to celebrate milestones together across time and distance.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Today, our service helps thousands of families worldwide, helping them preserve 
                and share their most precious memories in beautiful, meaningful ways.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img
                src="https://umrxpbudpexhgpnynstb.supabase.co/storage/v1/object/public/avatars//Gemini_Generated_Image_u7cf08u7cf08u7cf.jpeg"
                alt="Family memories and precious moments"
                className="about-image"
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="about-section"
          >
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <img
                src="https://umrxpbudpexhgpnynstb.supabase.co/storage/v1/object/public/avatars//Gemini_Generated_Image_voocpvoocpvoocpv.jpeg"
                alt="Digital memories and time capsules"
                className="about-image"
              />
            </motion.div>

            <div className="about-text">
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                From Glasgow to the Globe
              </h2>
              <div className="flex items-center space-x-3 mb-6">
                <MapPin className="w-6 h-6 text-blue-500" />
                <span className="text-lg font-medium text-gray-800">Based in Glasgow, Scotland</span>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                From the historic streets of Glasgow, we've built our service with a deep understanding 
                of the importance of family heritage and storytelling. Scotland's rich tradition of 
                preserving history and passing down stories through generations inspires everything we do.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We believe that every family has stories worth preserving, and every memory deserves 
                to be shared with future generations in a meaningful, beautiful way. Our platform 
                connects families across continents, ensuring that distance never diminishes the 
                power of shared memories.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-max">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-6xl font-bold gradient-text mb-6">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything we do is guided by these core principles that shape how we serve our community.
            </p>
          </motion.div>

          <div className="values-grid">
            {[
              {
                icon: Heart,
                title: 'Love & Connection',
                description: 'We believe in the power of love to transcend time and distance, connecting hearts across generations.',
                color: 'red'
              },
              {
                icon: Users,
                title: 'Family First',
                description: 'Family is at the heart of everything we do. We design our service to strengthen family bonds and preserve legacies.',
                color: 'blue'
              },
              {
                icon: Award,
                title: 'Quality & Care',
                description: 'Every time capsule is crafted with attention to detail and care, ensuring your memories are preserved beautifully.',
                color: 'purple'
              },
              {
                icon: Globe,
                title: 'Global Reach',
                description: 'From Glasgow to the globe, we help families stay connected regardless of distance or time zones.',
                color: 'green'
              },
              {
                icon: Shield,
                title: 'Security & Trust',
                description: 'Your memories are precious. We protect them with military-grade security and unwavering commitment to privacy.',
                color: 'orange'
              },
              {
                icon: Clock,
                title: 'Perfect Timing',
                description: 'We understand that timing is everything. Our platform ensures your memories arrive at exactly the right moment.',
                color: 'yellow'
              }
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="value-card"
              >
                <div className={`value-icon bg-${value.color}-100`}>
                  <value.icon className={`w-8 h-8 text-${value.color}-600`} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding">
        <div className="container-max">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl lg:text-6xl font-bold gradient-text mb-6">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              We'd love to hear from you. Whether you have questions about our service, 
              feedback to share, or just want to say hello, we're here to help.
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-12 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="flex items-center justify-center space-x-3">
                  <MapPin className="w-6 h-6 text-blue-500" />
                  <span className="text-lg text-gray-700">Glasgow, Scotland</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <Heart className="w-6 h-6 text-purple-500" />
                  <a 
                    href="mailto:support@mementolocker.com" 
                    className="text-lg text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    support@mementolocker.com
                  </a>
                </div>
              </div>
              
              <button
                onClick={() => window.location.href =  '/contact'}
                className="btn-primary"
              >
                Contact Us
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};