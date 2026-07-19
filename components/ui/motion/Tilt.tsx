"use client";

import { motion, useReducedMotion, useSpring, type MotionStyle } from "framer-motion";
import { useCallback, useRef, type ReactNode } from "react";

interface TiltProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  disabled?: boolean;
}

export function Tilt({
  children,
  className,
  maxTilt = 5,
  disabled = false,
}: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const rotateX = useSpring(0, { stiffness: 180, damping: 20, mass: 0.6 });
  const rotateY = useSpring(0, { stiffness: 180, damping: 20, mass: 0.6 });
  const scale = useSpring(1, { stiffness: 220, damping: 18, mass: 0.7 });

  const handleMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || prefersReducedMotion || window.matchMedia("(pointer: coarse)").matches) {
        return;
      }

      const element = ref.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const offsetX = event.clientX - rect.left - rect.width / 2;
      const offsetY = event.clientY - rect.top - rect.height / 2;
      const nextRotateY = Math.max(-maxTilt, Math.min(maxTilt, (offsetX / rect.width) * maxTilt));
      const nextRotateX = Math.max(-maxTilt, Math.min(maxTilt, (offsetY / rect.height) * -maxTilt));

      rotateY.set(nextRotateY);
      rotateX.set(nextRotateX);
      scale.set(1.01);
    },
    [disabled, maxTilt, prefersReducedMotion, rotateX, rotateY, scale],
  );

  const handleLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  }, [rotateX, rotateY, scale]);

  const motionStyle: MotionStyle = {
    rotateX,
    rotateY,
    scale,
    transformPerspective: 1200,
    transformStyle: "preserve-3d",
    willChange: "transform",
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={motionStyle}
    >
      {children}
    </motion.div>
  );
}
