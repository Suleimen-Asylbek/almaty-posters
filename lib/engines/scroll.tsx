'use client';
import { createContext, useContext, useEffect, useRef } from 'react';

const ScrollContext = createContext({
  scrollY: 0,
  scrollProgress: 0,
  scrollDirection: 'up',
  scrollVelocity: 0,
  activeSection: '',
});

export const ScrollProvider = ({ children }: { children: React.ReactNode }) => {
  const scrollData = useRef({
    scrollY: 0,
    scrollProgress: 0,
    scrollDirection: 'up',
    scrollVelocity: 0,
    activeSection: '',
  });

  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const velocity = currentScrollY - lastScrollY;
      
      scrollData.current = {
        scrollY: currentScrollY,
        scrollProgress: currentScrollY / (document.documentElement.scrollHeight - window.innerHeight),
        scrollDirection: velocity > 0 ? 'down' : 'up',
        scrollVelocity: velocity,
        activeSection: '',
      };
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <ScrollContext.Provider value={scrollData.current}>
      {children}
    </ScrollContext.Provider>
  );
};

export const useScrollEngine = () => useContext(ScrollContext);
