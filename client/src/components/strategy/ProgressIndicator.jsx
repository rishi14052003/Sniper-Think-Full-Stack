import React from 'react';
import { motion } from 'framer-motion';

const ProgressIndicator = ({ 
  currentStep, 
  totalSteps, 
  steps = [],
  onStepClick 
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  const indicatorVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const progressVariants = {
    hidden: { width: 0 },
    visible: {
      width: `${progressPercentage}%`,
      transition: {
        duration: 1,
        ease: "easeOut",
        delay: 0.3
      }
    }
  };

  const stepVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: i * 0.1 + 0.5,
        duration: 0.4,
        ease: "easeOut"
      }
    }),
    active: {
      scale: 1.2,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      className="progress-indicator mb-8"
      variants={indicatorVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold">Strategy Progress</h2>
        <span className="text-lg font-semibold">
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      <div className="relative">
        {/* Progress bar background */}
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          {/* Animated progress bar */}
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
            variants={progressVariants}
            initial="hidden"
            animate="visible"
          />
        </div>

        {/* Step indicators */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;

            return (
              <motion.div
                key={step.id}
                className="relative"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                whileHover={isActive ? "active" : ""}
                custom={index}
              >
                <motion.div
                  className={`w-8 h-8 rounded-full border-4 cursor-pointer transition-all ${
                    isActive
                      ? 'border-indigo-600 bg-white'
                      : isCompleted
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300 bg-white'
                  }`}
                  onClick={() => onStepClick && onStepClick(stepNumber)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                    {isCompleted ? '✓' : stepNumber}
                  </div>
                </motion.div>

                {/* Step tooltip */}
                <motion.div
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap"
                  initial={{ opacity: 0, y: 5 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {step.title}
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Current step info */}
      {steps[currentStep - 1] && (
        <motion.div
          className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center">
            <span className="text-2xl mr-3">{steps[currentStep - 1].icon}</span>
            <div>
              <h3 className="font-semibold text-lg">{steps[currentStep - 1].title}</h3>
              <p className="text-gray-600 text-sm">{steps[currentStep - 1].description}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProgressIndicator;
