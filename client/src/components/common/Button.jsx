import React from 'react';
import { motion } from 'framer-motion';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  loading = false, 
  disabled = false, 
  onClick, 
  type = 'button',
  className = '',
  fullWidth = false,
  icon = null,
  ...props 
}) => {
  const baseClasses = 'btn';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    success: 'btn-success',
    error: 'btn-error'
  };
  const sizeClasses = {
    small: 'btn-sm',
    medium: 'btn-md',
    large: 'btn-lg'
  };

  const buttonClasses = [
    baseClasses,
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size] || sizeClasses.medium,
    fullWidth && 'btn-full-width',
    className
  ].filter(Boolean).join(' ');

  const buttonVariants = {
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.15,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.98,
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
      {loading && (
        <motion.span 
          className="spinner-small"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}
      {icon && <span className="btn-icon">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
};

export default Button;
