'use client';
import { useState, useEffect, useSyncExternalStore } from 'react';

// Simplified Performance tracking
let fps = 60;
let lastTime = performance.now();
let frames = 0;

if (typeof window !== 'undefined') {
  const updateFPS = (time: number) => {
    frames++;
    if (time > lastTime + 1000) {
      fps = Math.round((frames * 1000) / (time - lastTime));
      lastTime = time;
      frames = 0;
    }
    requestAnimationFrame(updateFPS);
  };
  requestAnimationFrame(updateFPS);
}

const subscribe = (callback: () => void) => {
  // We can optimize this later to not re-render every frame
  return () => {};
};

export const usePerformance = () => {
  return useSyncExternalStore(subscribe, () => ({
    fps,
    isLowEnd: typeof navigator !== 'undefined' && 
              (((navigator as any).hardwareConcurrency || 4) <= 4 || 
               (typeof (navigator as any).deviceMemory !== 'undefined' && (navigator as any).deviceMemory <= 4)),
  }));
};
