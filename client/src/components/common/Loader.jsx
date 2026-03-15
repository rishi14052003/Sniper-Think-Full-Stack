import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ 
  size = 'medium', 
  text = 'Loading...', 
  showText = true,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const loaderVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-600 rounded-full`}
        variants={loaderVariants}
        animate="animate"
      />
      {showText && (
        <span className="ml-2 text-gray-600">{text}</span>
      )}
    </div>
  );
};

export default Loader;
