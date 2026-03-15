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
    <section ref={sectionRef} className="section">
      <div className="container">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              SniperThink Strategy Flow
            </h1>
            <p className="text-xl text-white text-opacity-90 max-w-3xl mx-auto">
              Experience our comprehensive approach to data-driven strategy execution
            </p>
          </motion.div>

          {/* Progress Indicator */}
          <ProgressIndicator
            currentStep={currentStep}
            totalSteps={steps.length}
            steps={steps}
            onStepClick={handleStepClick}
          />

          {/* Strategy Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {steps.map((step, index) => (
              <StepCard
                key={step.id}
                step={step}
                index={index}
                isActive={currentStep === step.id}
                onClick={handleCardClick}
              />
            ))}
          </div>

          {/* Interest Form */}
          <motion.div
            className="max-w-md mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="card">
              <h2 className="text-2xl font-bold mb-6 text-center">
                Get Started Today
              </h2>
              
              <form onSubmit={handleSubmit}>
                <Input
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  error={formErrors.name}
                  required
                />

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  error={formErrors.email}
                  required
                />

                {selectedStep && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Selected Step:</strong> {selectedStep.title}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Submitting...' : "I'm Interested"}
                </Button>

                {submitStatus && (
                  <motion.div
                    className={`mt-4 p-3 rounded-lg text-center ${
                      submitStatus.type === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {submitStatus.message}
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
