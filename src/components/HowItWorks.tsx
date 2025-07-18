import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Heart, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    icon: Upload,
    title: 'Create Your Capsule',
    description: 'Upload photos, videos, audio messages, and write heartfelt notes for your loved ones.'
  },
  {
    icon: Heart,
    title: 'Add Your Memories',
    description: 'Customize the design, choose themes, and organize your content into a beautiful presentation.'
  },
  {
    icon: Calendar,
    title: 'Schedule Delivery',
    description: 'Set the perfect date and time for your time capsule to be delivered to recipients.'
  }
];

export const HowItWorks: React.FC = () => {
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
            How It Works
          </h2>
          <p className="section-subtitle">
            Creating your digital time capsule is simple and intuitive. 
            Follow these three easy steps to preserve your memories for the future.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="feature-icon mx-auto mb-6">
                <step.icon className="w-8 h-8" />
              </div>
              
              <div className="w-8 h-8 bg-amber-400 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold" style={{ backgroundColor: '#C0A172' }}>
                {index + 1}
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                {step.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            to="/capsule-examples"
            className="btn-primary inline-flex items-center group"
          >
            See Capsule Examples
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};