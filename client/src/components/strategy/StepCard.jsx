import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import './StepCard.css';

const StepCard = ({ step, index, isActive, onClick }) => {
  const cardRef = useRef(null);
  const { isVisible } = useScrollAnimation(cardRef);

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.12,
        ease: "easeOut"
      }
    }
  };

  const iconVariants = {
    hidden: { rotate: -90, scale: 0, opacity: 0 },
    visible: {
      rotate: 0,
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.7,
        delay: index * 0.12 + 0.2,
        ease: "easeOut"
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.12 + 0.3 + i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  return (
    <motion.div
      ref={cardRef}
      className={`step-card ${isActive ? 'active' : ''}`}
      variants={cardVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      onClick={() => onClick && onClick(step)}
    >
      {/* Background Gradient */}
      <div className={`step-card-bg ${isActive ? 'active' : ''}`} />
      
      {/* Content */}
      <div className="step-card-content">
        {/* Icon */}
        <motion.div
          className="step-card-icon"
          variants={iconVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {step.icon}
        </motion.div>

        {/* Header */}
        <div className="step-card-header">
          <motion.div
            custom={0}
            variants={contentVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
          >
            <h3 className="step-card-title">{step.title}</h3>
          </motion.div>
          
          <motion.div
            className="step-card-divider"
            initial={{ scaleX: 0 }}
            animate={isVisible ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ delay: index * 0.12 + 0.5, duration: 0.6 }}
          />
        </div>

        {/* Description */}
        <motion.p
          className="step-card-description"
          custom={1}
          variants={contentVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {step.description}
        </motion.p>

        {/* Badge */}
        {step.badge && (
          <motion.div
            className="step-card-badge"
            custom={2}
            variants={contentVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
          >
            <span>{step.badge}</span>
          </motion.div>
        )}
      </div>

      {/* Interactive Indicator */}
      {onClick && (
        <motion.div 
          className="step-card-indicator"
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
        />
      )}
    </motion.div>
  );
};

export default StepCard;
