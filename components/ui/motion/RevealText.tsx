"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import {
  motionDuration,
  motionRevealOffset,
  premiumEase,
} from "@/lib/motion";

interface RevealTextProps {
  text: string;
  className?: string;
  delay?: number;
  once?: boolean;
}

export function RevealText({
  text,
  className,
  delay = 0,
  once = true,
}: RevealTextProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-40px" });
  const prefersReducedMotion = useReducedMotion();

  const lines = text.split("\n");

  return (
    <div ref={ref} className={className}>
      {lines.map((line, index) => (
        <motion.div
          key={`${line}-${index}`}
          initial={prefersReducedMotion ? false : { opacity: 0, y: motionRevealOffset }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: motionRevealOffset }}
          transition={{
            duration: prefersReducedMotion ? 0 : motionDuration,
            delay: delay + index * 0.08,
            ease: premiumEase,
          }}
          style={{ willChange: "transform, opacity" }}
        >
          {line}
        </motion.div>
      ))}
    </div>
  );
}
