import { useState, useEffect } from 'react';

/**
 * Custom hook to track window size with debouncing
 * @param {number} delay - Debounce delay in milliseconds (default: 150ms)
 * @returns {Object} { width, height } - Current window dimensions
 */
export const useWindowSize = (delay = 150) => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    let timeoutId;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, delay);
    };

    // Set initial size
    handleResize();

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [delay]);

  return windowSize;
};

