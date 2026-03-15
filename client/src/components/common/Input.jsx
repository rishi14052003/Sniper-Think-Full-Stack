import React from 'react';
import { motion } from 'framer-motion';
import './Input.css';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  className = '',
  icon = null,
  hint = null,
  successMessage = null,
  ...props
}) => {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <div className="input-wrapper">
        {icon && <span className="input-icon-left">{icon}</span>}
        <motion.input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={`form-input ${error ? 'error' : ''} ${successMessage ? 'success' : ''} ${icon ? 'has-icon' : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          {...props}
        />
      </div>
      {hint && !error && (
        <motion.p 
          className="hint-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {hint}
        </motion.p>
      )}
      {error && (
        <motion.p 
          className="error-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.p>
      )}
      {successMessage && !error && (
        <motion.p 
          className="success-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {successMessage}
        </motion.p>
      )}
    </div>
  );
};

export default Input;
