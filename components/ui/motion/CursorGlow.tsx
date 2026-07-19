"use client";

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useCallback, useRef, type ReactNode } from "react";

interface CursorGlowProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function CursorGlow({
  children,
  className,
  disabled = false,
}: CursorGlowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(-40);
  const y = useMotionValue(-40);
  const opacity = useSpring(0, { stiffness: 160, damping: 24, mass: 0.6 });
  const prefersReducedMotion = useReducedMotion();

  const glowBackground = useMotionTemplate`
    radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.16) 20%, rgba(255,255,255,0.04) 48%, transparent 68%)
  `;

  const handleMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || prefersReducedMotion || window.matchMedia("(pointer: coarse)").matches) {
        return;
      }

      const element = ref.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      x.set(event.clientX - rect.left);
      y.set(event.clientY - rect.top);
      opacity.set(1);
    },
    [disabled, opacity, prefersReducedMotion, x, y],
  );

  const handleLeave = useCallback(() => {
    opacity.set(0);
  }, [opacity]);

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ position: "relative" }}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ backgroundImage: glowBackground, opacity }}
      />
      {children}
    </motion.div>
  );
}
