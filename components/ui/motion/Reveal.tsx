"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { motionDuration, premiumEase } from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
  scale?: number;
  yOffset?: number;
}

export function Reveal({
  children,
  className,
  delay = 0,
  once = true,
  scale = 0.98,
  yOffset = 18,
}: RevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-60px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={prefersReducedMotion ? false : { opacity: 0, y: yOffset, scale }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: yOffset, scale }}
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
