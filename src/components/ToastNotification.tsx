import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Save } from 'lucide-react';

interface ToastNotificationProps {
  message: string;
  isVisible: boolean;
  onHide: () => void;
  type?: 'success' | 'info' | 'warning' | 'error';
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  isVisible,
  onHide,
  type = 'success'
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onHide]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'info':
        return <Save className="w-5 h-5 text-blue-600" />;
      default:
        return <Check className="w-5 h-5 text-green-600" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-green-50 border-green-200 text-green-800';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-6 right-6 z-50"
        >
          <div className={`border rounded-lg shadow-lg p-4 flex items-center space-x-3 min-w-[300px] ${getColors()}`}>
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <span className="font-medium">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};