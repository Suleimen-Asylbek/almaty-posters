"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";
import {
  motionDuration,
  motionRevealOffset,
  motionRevealScale,
  premiumEase,
} from "@/lib/motion";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
  once?: boolean;
}

export function FadeIn({
  children,
  className,
  delay = 0,
  direction = "up",
  once = true,
}: FadeInProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-40px" });
  const prefersReducedMotion = useReducedMotion();

  const initial = {
    opacity: 0,
    y: direction === "up" ? motionRevealOffset : 0,
    x: direction === "left" ? -motionRevealOffset : direction === "right" ? motionRevealOffset : 0,
    scale: motionRevealScale,
  };

  return (
    <motion.div
      ref={ref}
      initial={prefersReducedMotion ? false : initial}
      animate={isInView ? { opacity: 1, y: 0, x: 0, scale: 1 } : initial}
      transition={{
        duration: prefersReducedMotion ? 0 : motionDuration,
        delay,
        ease: premiumEase,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
