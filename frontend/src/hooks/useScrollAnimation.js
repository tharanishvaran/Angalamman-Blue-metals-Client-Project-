import { useEffect, useRef, useState } from 'react';

/**
 * Lightweight Intersection Observer hook for scroll-triggered animations.
 * Uses GPU-friendly CSS only — no heavy libraries needed for basic reveals.
 */
export function useScrollAnimation(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, disconnect observer to save CPU & GPU memory
          observer.unobserve(el);
        }
      },
      {
        threshold: options.threshold !== undefined ? options.threshold : 0.01,
        rootMargin: options.rootMargin || '100px 0px 50px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]);

  return [ref, isVisible];
}

/**
 * Stagger children animation helper
 */
export function getStaggerDelay(index, base = 0.08) {
  return `${index * base}s`;
}
