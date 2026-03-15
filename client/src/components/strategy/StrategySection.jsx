import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { steps } from '../../data/strategySteps';
import StepCard from './StepCard';
import ProgressIndicator from './ProgressIndicator';
import Input from '../common/Input';
import Button from '../common/Button';
import Loader from '../common/Loader';
import { apiService } from '../../services/api';
import { helpers } from '../../utils/helpers';
import './StrategySection.css';

const StrategySection = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStep, setSelectedStep] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const sectionRef = useRef(null);

  const handleStepClick = (stepNumber) => {
    setCurrentStep(stepNumber);
  };

  const handleCardClick = (step) => {
    setSelectedStep(step);
    setCurrentStep(step.id);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!helpers.validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const payload = {
        ...formData,
        selectedStep: selectedStep ? selectedStep.title : `Step ${currentStep}`
      };

      await apiService.submitInterest(payload);
      setSubmitStatus({
        type: 'success',
        message: 'Thank you for your interest! We\'ll be in touch soon.'
      });
      
      // Reset form
      setFormData({ name: '', email: '' });
      setSelectedStep(null);
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || 'Something went wrong. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Scroll-based step progression
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollPercentage = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
      
      // Update current step based on scroll
      const newStep = Math.min(steps.length, Math.max(1, Math.ceil(scrollPercentage * steps.length)));
      if (newStep !== currentStep) {
        setCurrentStep(newStep);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentStep]);

  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  return (
    <section ref={sectionRef} className="strategy-section">
      <div className="strategy-container">
        <motion.div
          className="strategy-content"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div
            className="strategy-header"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="strategy-title">
              SniperThink Strategy Flow
            </h1>
            <p className="strategy-subtitle">
              Experience our comprehensive approach to data-driven strategy execution
            </p>
          </motion.div>

          {/* Progress Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={steps.length}
              steps={steps}
              onStepClick={handleStepClick}
            />
          </motion.div>

          {/* Strategy Steps Grid */}
          <motion.div
            className="strategy-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {steps.map((step, index) => (
              <StepCard
                key={step.id}
                step={step}
                index={index}
                isActive={currentStep === step.id}
                onClick={handleCardClick}
              />
            ))}
          </motion.div>

          {/* Interest Form */}
          <motion.div
            className="strategy-form-wrapper"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <div className="strategy-form-container">
              <div className="strategy-form-header">
                <h2>Get Started Today</h2>
                <p>Join us on this exciting journey</p>
              </div>
              
              <form onSubmit={handleSubmit} className="strategy-form">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  error={formErrors.name}
                  required
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  error={formErrors.email}
                  required
                />

                {selectedStep && (
                  <motion.div
                    className="strategy-selected-step"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="selected-step-badge">
                      <span className="badge-icon">✓</span>
                      <span className="badge-text"><strong>Selected:</strong> {selectedStep.title}</span>
                    </div>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  fullWidth
                  size="large"
                  variant="primary"
                >
                  {isSubmitting ? 'Submitting...' : "I'm Interested"}
                </Button>

                {submitStatus && (
                  <motion.div
                    className={`submit-status ${submitStatus.type}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {submitStatus.type === 'success' && (
                      <span className="status-icon">✓</span>
                    )}
                    {submitStatus.type === 'error' && (
                      <span className="status-icon">✕</span>
                    )}
                    <span className="status-text">{submitStatus.message}</span>
                  </motion.div>
                )}
              </form>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default StrategySection;
