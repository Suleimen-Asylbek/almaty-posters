"use client";

import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { premiumEase } from "@/lib/motion";

interface AnimatedCounterProps {
  value: number;
  className?: string;
  duration?: number;
  formatter?: (value: number) => string;
  once?: boolean;
}

export function AnimatedCounter({
  value,
  className,
  duration = 1.2,
  formatter = (num) => num.toString(),
  once = true,
}: AnimatedCounterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-40px" });
  const count = useMotionValue(0);
  const display = useTransform(count, (latest) => formatter(Math.round(latest)));

  useEffect(() => {
    if (!isInView) return;

    const controls = animate(count, value, {
      duration,
      ease: premiumEase,
    });

    return controls.stop;
  }, [count, duration, isInView, value]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}
