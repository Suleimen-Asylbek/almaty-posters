"use client";

import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";
import { motionDurationFast, premiumEase } from "@/lib/motion";

interface HoverScaleProps {
  children: ReactNode;
  className?: string;
  scale?: number;
  duration?: number;
}

export function HoverScale({
  children,
  className,
  scale = 1.01,
  duration = motionDurationFast,
}: HoverScaleProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      whileHover={prefersReducedMotion ? undefined : { scale, y: -2 }}
      transition={{ duration, ease: premiumEase }}
    >
      {children}
    </motion.div>
  );
}
