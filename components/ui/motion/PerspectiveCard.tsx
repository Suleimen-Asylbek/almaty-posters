"use client";

import { motion, useReducedMotion, useSpring, type MotionStyle } from "framer-motion";
import { useCallback, useRef, type ReactNode } from "react";

interface PerspectiveCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  disabled?: boolean;
}

export function PerspectiveCard({
  children,
  className,
  maxTilt = 8,
  disabled = false,
}: PerspectiveCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const rotateX = useSpring(0, { stiffness: 400, damping: 30 });
  const rotateY = useSpring(0, { stiffness: 400, damping: 30 });
  const scale = useSpring(1, { stiffness: 400, damping: 30 });
  const shadow = useSpring(0, { stiffness: 400, damping: 30 });

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
      scale.set(1.02);
      shadow.set(1);
    },
    [disabled, maxTilt, prefersReducedMotion, rotateX, rotateY, scale, shadow],
  );

  const handleLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
    shadow.set(0);
  }, [rotateX, rotateY, scale, shadow]);

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
      whileHover={prefersReducedMotion ? undefined : { boxShadow: "0 24px 60px rgba(17, 17, 17, 0.12)" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
