"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import {
  type HTMLMotionProps,
  type MotionStyle,
} from "framer-motion";
import {
  useCallback,
  useRef,
} from "react";

interface MagneticProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  strength?: number;
  disabled?: boolean;
}

export function Magnetic({
  children,
  strength = 0.18,
  disabled = false,
  style,
  onMouseMove,
  onMouseLeave,
  ...props
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, {
    stiffness: 220,
    damping: 22,
    mass: 0.35,
  });

  const springY = useSpring(y, {
    stiffness: 220,
    damping: 22,
    mass: 0.35,
  });

  const handleMove = useCallback<
    NonNullable<HTMLMotionProps<"div">["onMouseMove"]>
  >(
    (event) => {
      onMouseMove?.(event);

      if (
        disabled ||
        prefersReducedMotion ||
        window.matchMedia("(pointer: coarse)").matches
      ) {
        return;
      }

      const element = ref.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();

      const offsetX = event.clientX - rect.left - rect.width / 2;
      const offsetY = event.clientY - rect.top - rect.height / 2;

      x.set(offsetX * strength);
      y.set(offsetY * strength);
    },
    [disabled, prefersReducedMotion, strength, onMouseMove, x, y]
  );

  const handleLeave = useCallback<
    NonNullable<HTMLMotionProps<"div">["onMouseLeave"]>
  >(
    (event) => {
      onMouseLeave?.(event);

      x.set(0);
      y.set(0);
    },
    [onMouseLeave, x, y]
  );

  const motionStyle: MotionStyle = {
    x: springX,
    y: springY,
    willChange: "transform",
    ...style,
  };

  return (
    <motion.div
      ref={ref}
      style={motionStyle}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...props}
    >
      {children}
    </motion.div>
  );
}