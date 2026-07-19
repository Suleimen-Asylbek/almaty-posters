"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { interactions } from "@/lib/motion/tokens";

interface MotionButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "ghost";
}

export const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ variant = "primary", className, ...props }, ref) => {
    const variants = {
      primary: "bg-primary text-white hover:bg-primary/90",
      secondary: "border border-border bg-white text-primary hover:border-secondary hover:bg-surface-secondary",
      ghost: "text-secondary hover:text-primary",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={interactions.button.hover}
        whileTap={interactions.button.tap}
        transition={interactions.button.transition}
        className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);

MotionButton.displayName = "MotionButton";
