import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import './styles/global.css';

const App = () => {
  const appVariants = {
    initial: {
      opacity: 0
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      className="App"
      variants={appVariants}
      initial="initial"
      animate="animate"
    >
      <AnimatePresence mode="wait">
        <Home key="home" />
      </AnimatePresence>
    </motion.div>
  );
};

export default App;
