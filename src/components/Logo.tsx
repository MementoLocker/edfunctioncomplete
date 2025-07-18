import React from 'react';
import { Heart } from 'lucide-react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  showText = true, 
  size = 'md' 
}) => {
  const iconSize = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`${iconSize} bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mr-3 shadow-lg`} style={{ background: 'linear-gradient(135deg, #C0A172 0%, #A68B5B 100%)' }}>
        <Heart className="w-4 h-4 text-white" fill="currentColor" />
      </div>
      
      {showText && (
        <div>
          <h1 className={`${textSize} elegant-logo`}>
            MementoLocker
          </h1>
          <p className="text-xs text-gray-500 tracking-widest uppercase font-sans">
            Elegant Legacy
          </p>
        </div>
      )}
    </div>
  );
};