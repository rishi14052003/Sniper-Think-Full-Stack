import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const StepCard = ({ step, index, isActive, onClick }) => {
  const cardRef = useRef(null);
  const { isVisible, scrollProgress } = useScrollAnimation(cardRef);

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut"
      }
    }
  };

  const iconVariants = {
    hidden: { rotate: -180, scale: 0 },
    visible: {
      rotate: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        delay: index * 0.1 + 0.3,
        ease: "easeOut"
      }
    }
  };

  const hoverVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className="card"
      variants={cardVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      whileHover="hover"
      onClick={() => onClick && onClick(step)}
      style={{
        background: isActive 
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
          : 'white',
        color: isActive ? 'white' : '#333',
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      <div className="flex items-center mb-4">
        <motion.div
          className="text-4xl mr-4"
          variants={iconVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          {step.icon}
        </motion.div>
        <div>
          <motion.h3 
            className="text-2xl font-bold mb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ delay: index * 0.1 + 0.5 }}
          >
            {step.title}
          </motion.h3>
          <motion.div
            className="w-16 h-1 bg-current rounded-full"
            initial={{ width: 0 }}
            animate={isVisible ? { width: "4rem" } : { width: 0 }}
            transition={{ delay: index * 0.1 + 0.7, duration: 0.5 }}
          />
        </div>
      </div>
      
      <motion.p
        className="text-lg leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ delay: index * 0.1 + 0.9 }}
      >
        {step.description}
      </motion.p>

      {scrollProgress > 0 && (
        <motion.div
          className="mt-4 pt-4 border-t border-current border-opacity-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-full bg-current bg-opacity-20 rounded-full h-2">
            <motion.div
              className="h-full bg-current rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${scrollProgress * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default StepCard;
