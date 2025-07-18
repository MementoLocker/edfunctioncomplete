import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Heart, Clock, Archive } from 'lucide-react';

const features = [
  {
    title: 'Quality',
    description: 'Every piece is spotless and well-maintained.',
    icon: Shield,
    color: 'blue'
  },
  {
    title: 'Refresh',
    description: 'Every room feeling fresh and rejuvenated.',
    icon: Heart,
    color: 'green'
  },
  {
    title: 'Sanitize',
    description: 'Top-grade sanitization techniques.',
    icon: Clock,
    color: 'purple'
  },
  {
    title: 'Awards',
    description: 'Accolades that highlight our service.',
    icon: Archive,
    color: 'blue'
  }
];

export const Features: React.FC = () => {
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
            A Permanent Home for Your Most Precious Moments.
          </h2>
          <p className="section-subtitle">
            Our platform combines cutting-edge security with intuitive design to create 
            the perfect environment for preserving and sharing your most cherished memories.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="feature-card text-center group"
            >
              <div className={`feature-icon icon-${feature.color}`}>
                <feature.icon className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-serif font-semibold mb-6 text-gray-800">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};