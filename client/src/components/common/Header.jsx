import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={`header ${isScrolled ? 'scrolled' : ''}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="header-container">
        {/* Logo */}
        <motion.div
          className="header-logo"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="logo-icon">🎯</span>
          <span className="logo-text">SniperThink</span>
        </motion.div>

        {/* Navigation */}
        <nav className="header-nav">
          <motion.a
            href="#strategy"
            className="nav-link"
            whileHover={{ color: 'var(--primary-600)' }}
          >
            Strategy
          </motion.a>
          <motion.a
            href="#features"
            className="nav-link"
            whileHover={{ color: 'var(--primary-600)' }}
          >
            Features
          </motion.a>
          <motion.a
            href="#contact"
            className="nav-link"
            whileHover={{ color: 'var(--primary-600)' }}
          >
            Contact
          </motion.a>
        </nav>

        {/* Theme Toggle & CTA Button */}
        <div className="header-actions">
          <ThemeToggle />
          <motion.button
            className="header-cta"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
