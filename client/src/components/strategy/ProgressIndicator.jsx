import React from 'react';
import { motion } from 'framer-motion';
import './ProgressIndicator.css';

const ProgressIndicator = ({ 
  currentStep, 
  totalSteps, 
  steps = [],
  onStepClick 
}) => {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const progressVariants = {
    hidden: { width: 0 },
    visible: {
      width: `${progressPercentage}%`,
      transition: {
        duration: 1.2,
        ease: "easeOut",
        delay: 0.4
      }
    }
  };

  const stepVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: i * 0.12 + 0.5,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  return (
    <motion.div
      className="progress-indicator-wrapper"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="progress-header" variants={itemVariants}>
        <div className="progress-title-group">
          <h2 className="progress-main-title">Strategy Progress</h2>
          <p className="progress-subtitle">Follow the 4-step approach to achieve your goals</p>
        </div>
        <motion.div 
          className="progress-counter"
          key={currentStep}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <span className="counter-current">{currentStep}</span>
          <span className="counter-divider">/</span>
          <span className="counter-total">{totalSteps}</span>
        </motion.div>
      </motion.div>

      {/* Main Progress Timeline */}
      <motion.div className="progress-timeline" variants={itemVariants}>
        {/* Progress Line Background */}
        <div className="progress-line-container">
          <div className="progress-line-bg" />
          
          {/* Animated Progress Line */}
          <motion.div
            className="progress-line-fill"
            variants={progressVariants}
            initial="hidden"
            animate="visible"
          />
        </div>

        {/* Steps */}
        <div className="progress-steps">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
              <motion.div
                key={step.id}
                className={`progress-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                custom={index}
                onClick={() => onStepClick && onStepClick(stepNumber)}
              >
                {/* Step Circle */}
                <motion.div
                  className="step-circle"
                  whileHover={{ scale: isActive ? 1.15 : 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="step-circle-content">
                    {isCompleted ? (
                      <motion.span 
                        className="step-icon"
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      >
                        ✓
                      </motion.span>
                    ) : (
                      <motion.span 
                        className="step-number"
                        key={stepNumber}
                        initial={{ scale: 1 }}
                        animate={{ 
                          scale: isActive ? [1, 1.2, 1] : 1,
                          color: isActive ? "#ffffff" : "inherit"
                        }}
                        transition={{ 
                          scale: { duration: 0.3 },
                          color: { duration: 0.2 }
                        }}
                      >
                        {stepNumber}
                      </motion.span>
                    )}
                  </div>
                  {isActive && <div className="step-pulse" />}
                </motion.div>

                {/* Step Label */}
                <motion.div 
                  className="step-label"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.12 + 0.7, duration: 0.4 }}
                >
                  <p className="step-name">{step.title}</p>
                  <p className="step-description">{step.description || ''}</p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Current Step Card */}
      {steps[currentStep - 1] && (
        <motion.div
          className="progress-step-detail"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          key={`detail-${currentStep}`}
        >
          <div className="step-detail-content">
            <motion.span 
              className="detail-icon"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              {steps[currentStep - 1].icon}
            </motion.span>
            <div className="detail-text">
              <h3 className="detail-title">{steps[currentStep - 1].title}</h3>
              <p className="detail-description">{steps[currentStep - 1].description}</p>
            </div>
          </div>
          <div className="step-detail-progress">
            <div className="progress-dots">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <motion.div
                  key={i}
                  className={`dot ${i + 1 === currentStep ? 'active' : ''} ${i + 1 < currentStep ? 'completed' : ''}`}
                  animate={i + 1 === currentStep ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProgressIndicator;
