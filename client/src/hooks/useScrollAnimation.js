import { useEffect, useState } from 'react';

export const useScrollAnimation = (elementRef, options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px'
      }
    );

    observer.observe(element);

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementHeight = rect.height;
      
      // Calculate scroll progress (0 to 1)
      let progress = 0;
      if (rect.top < windowHeight && rect.bottom > 0) {
        const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
        progress = visibleHeight / (windowHeight + elementHeight);
        progress = Math.max(0, Math.min(1, progress));
      }
      
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [elementRef, options.threshold, options.rootMargin]);

  return { isVisible, scrollProgress };
};
