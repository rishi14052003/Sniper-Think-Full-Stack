import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const toggleVariants = {
    light: {
      rotate: 0,
      scale: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    dark: {
      rotate: 180,
      scale: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  const iconVariants = {
    light: {
      opacity: 1,
      rotate: 0,
      scale: 1
    },
    dark: {
      opacity: 0,
      rotate: -180,
      scale: 0.8
    }
  };

  return (
    <motion.button
      className="theme-toggle"
      onClick={toggleTheme}
      variants={toggleVariants}
      animate={isDark ? 'dark' : 'light'}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <motion.div
        className="theme-icon-wrapper"
        variants={iconVariants}
        initial={isDark ? 'dark' : 'light'}
        animate={isDark ? 'dark' : 'light'}
      >
        <Sun size={20} className="sun-icon" />
      </motion.div>
      <motion.div
        className="theme-icon-wrapper"
        variants={{
          light: {
            opacity: 0,
            rotate: 180,
            scale: 0.8
          },
          dark: {
            opacity: 1,
            rotate: 0,
            scale: 1
          }
        }}
        initial={isDark ? 'dark' : 'light'}
        animate={isDark ? 'dark' : 'light'}
      >
        <Moon size={20} className="moon-icon" />
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
