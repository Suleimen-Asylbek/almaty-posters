'use client';
import { createContext, useContext, useEffect, useRef } from 'react';

const CursorContext = createContext({
  x: 0,
  y: 0,
  velocity: 0,
  isHovering: false,
});

export const CursorProvider = ({ children }: { children: React.ReactNode }) => {
  const cursorData = useRef({ x: 0, y: 0, velocity: 0, isHovering: false });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorData.current = {
        x: e.clientX,
        y: e.clientY,
        velocity: Math.sqrt(e.movementX**2 + e.movementY**2),
        isHovering: false,
      };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <CursorContext.Provider value={cursorData.current}>
      {children}
    </CursorContext.Provider>
  );
};

export const useCursorEngine = () => useContext(CursorContext);
