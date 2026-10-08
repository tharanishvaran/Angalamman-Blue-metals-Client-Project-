import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

/**
 * AnimatedSection — wraps any content with scroll-triggered animation.
 * Uses CSS classes only (no JS animation loop) for GPU efficiency.
 *
 * @param {string} animation - 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'scale-in'
 * @param {string} delay     - CSS delay e.g. '0.1s'
 * @param {string} tag       - HTML tag to render (default: 'div')
 * @param {string} className - Extra class names
 */
export default function AnimatedSection({
  children,
  animation = 'fade-up',
  delay = '0s',
  tag: Tag = 'div',
  className = '',
  threshold = 0.12,
  style = {},
  ...rest
}) {
  const [ref, isVisible] = useScrollAnimation({ threshold });

  return (
    <Tag
      ref={ref}
      className={`anim-${animation} ${isVisible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: delay, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
