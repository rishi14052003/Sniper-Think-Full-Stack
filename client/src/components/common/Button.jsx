import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  loading = false, 
  disabled = false, 
  onClick, 
  type = 'button',
  className = '',
  ...props 
}) => {
  const baseClasses = 'btn';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary'
  };
  const sizeClasses = {
    small: 'btn-sm',
    medium: 'btn-md',
    large: 'btn-lg'
  };

  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.button
      className={buttonClasses}
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      variants={buttonVariants}
      whileHover={!disabled && !loading ? "hover" : ""}
      whileTap={!disabled && !loading ? "tap" : ""}
      {...props}
    >
      {loading && <span className="spinner mr-2"></span>}
      {children}
    </motion.button>
  );
};

export default Button;
