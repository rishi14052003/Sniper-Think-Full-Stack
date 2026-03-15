import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/common/Header';
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
    <ThemeProvider>
      <motion.div
        className="App"
        variants={appVariants}
        initial="initial"
        animate="animate"
      >
        <Header />
        <AnimatePresence mode="wait">
          <Home key="home" />
        </AnimatePresence>
      </motion.div>
    </ThemeProvider>
  );
};

export default App;
