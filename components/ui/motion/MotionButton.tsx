"use client";

import { forwardRef } from "react";

interface MotionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export const MotionButton = forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ variant = "primary", className, ...props }, ref) => {
    const variants = {
      primary: "bg-[#111111] text-white hover:bg-[#333333]",
      secondary: "border border-[#E5E5E5] bg-white text-[#111111] hover:border-[#CCCCCC] hover:bg-[#F9F9F9]",
      ghost: "text-[#666666] hover:text-[#111111]",
    };

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] ${variants[variant]} ${className}`}
        {...props}
      />
    );
  }
);

MotionButton.displayName = "MotionButton";
