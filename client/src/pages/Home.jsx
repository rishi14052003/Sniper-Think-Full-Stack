import React from 'react';
import { motion } from 'framer-motion';
import StrategySection from '../components/strategy/StrategySection';

const Home = () => {
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.5,
        ease: "easeIn"
      }
    }
  };

  return (
    <motion.div
      className="home"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <StrategySection />
    </motion.div>
  );
};

export default Home;
