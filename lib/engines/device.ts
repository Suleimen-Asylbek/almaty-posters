'use client';
import { useState, useEffect } from 'react';

export const useDevice = () => {
  const [device, setDevice] = useState({
    isTouch: false,
    hasHover: true,
    isMobile: false,
    viewport: { width: 0, height: 0 },
  });

  useEffect(() => {
    const updateDevice = () => {
      const isTouch = window.matchMedia('(pointer: coarse)').matches;
      const hasHover = window.matchMedia('(hover: hover)').matches;
      const isMobile = window.innerWidth < 768;
      
      setDevice({
        isTouch,
        hasHover,
        isMobile,
        viewport: { width: window.innerWidth, height: window.innerHeight },
      });
    };

    updateDevice();
    window.addEventListener('resize', updateDevice);
    return () => window.removeEventListener('resize', updateDevice);
  }, []);

  return device;
};
