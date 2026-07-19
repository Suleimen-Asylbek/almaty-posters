"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";
import {
  motionDuration,
  motionRevealOffset,
  motionRevealScale,
  motionStaggerDelay,
  premiumEase,
} from "@/lib/motion";

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = motionStaggerDelay,
  once = true,
}: StaggerContainerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-50px" });
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        visible: {
          transition: {
            staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const staggerItem = {
  hidden: { opacity: 0, y: motionRevealOffset, scale: motionRevealScale },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: motionDuration,
      ease: premiumEase,
    },
  },
};
