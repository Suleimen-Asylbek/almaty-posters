"use client";

import { animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { useEffect, type ReactNode } from "react";

interface FloatingProps {
  children: ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
  delay?: number;
}

export function Floating({
  children,
  className,
  amplitude = 8,
  duration = 7,
  delay = 0,
}: FloatingProps) {
  const y = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      y.set(0);
      return;
    }

    const controls = animate(y, amplitude, {
      duration,
      ease: "easeInOut",
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "mirror",
      delay,
    });

    return controls.stop;
  }, [amplitude, delay, duration, prefersReducedMotion, y]);

  return (
    <motion.div className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}
