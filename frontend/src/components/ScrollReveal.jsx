import React, { useEffect, useRef, useState } from 'react';

const ScrollReveal = ({ children, direction = 'up', delay = 0, duration = 800 }) => {
  const domRef = useRef();
  const [isVisible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      setVisible(true);
      return;
    }

    let revealTimer;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Delay state update slightly to guarantee the browser paints the initial hidden state,
          // ensuring the transition animation plays smoothly.
          revealTimer = setTimeout(() => {
            setVisible(true);
          }, 50);
          if (domRef.current) {
            observer.unobserve(domRef.current);
          }
        }
      });
    }, { 
      root: null, 
      rootMargin: '0px 0px -80px 0px', // Trigger slightly before entering viewport for a smooth premium feel
      threshold: 0 
    });

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      clearTimeout(revealTimer);
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const getTransform = () => {
    switch (direction) {
      case 'up': return 'translateY(60px) scale(0.97)';
      case 'down': return 'translateY(-60px) scale(0.97)';
      case 'left': return 'translateX(60px) scale(0.97)';
      case 'right': return 'translateX(-60px) scale(0.97)';
      case 'zoom': return 'scale(0.9) blur(4px)';
      default: return 'none';
    }
  };

  const style = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'none' : getTransform(),
    filter: isVisible ? 'none' : (direction === 'zoom' ? 'blur(4px)' : 'none'),
    transition: `opacity ${duration}ms cubic-bezier(0.215, 0.61, 0.355, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.215, 0.61, 0.355, 1) ${delay}ms, filter ${duration}ms cubic-bezier(0.215, 0.61, 0.355, 1) ${delay}ms`,
    willChange: 'transform, opacity, filter'
  };

  return (
    <div ref={domRef} style={style}>
      {children}
    </div>
  );
};

export default ScrollReveal;
