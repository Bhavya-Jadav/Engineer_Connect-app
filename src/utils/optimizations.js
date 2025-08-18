// Optimization utilities
import { useCallback, useMemo, memo } from 'react';

// Custom hook for memoizing expensive calculations
export const useMemoizedCalculation = (calculation) => {
  return useMemo(() => calculation, [calculation]);
};

// Debounce function for search/filter operations
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for scroll/resize handlers
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

// Lazy loading images with Intersection Observer
export const lazyLoadImage = (imageRef) => {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            observer.unobserve(img);
          }
        });
      }
    );
    observer.observe(imageRef.current);
  }
};

// Cache results of API calls
const cache = new Map();
export const cachedFetch = async (url, options = {}) => {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const response = await fetch(url, options);
  const data = await response.json();
  cache.set(cacheKey, data);
  return data;
};
