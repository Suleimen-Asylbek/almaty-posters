"use client";

import { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface CarouselControlsProps {
  readonly canNavigate: boolean;
  readonly onPrev: () => void;
  readonly onNext: () => void;
}

function CarouselControlsImpl({ canNavigate, onPrev, onNext }: CarouselControlsProps) {
  if (!canNavigate) return null;

  return (
    <>
      <button
        type="button"
        onClick={onPrev}
        aria-label="Предыдущий постер"
        className="absolute left-2 top-1/2 z-[1100] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#E5E5E5] bg-white/90 text-[#111111] backdrop-blur transition hover:bg-white active:scale-95 sm:left-4"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        type="button"
        onClick={onNext}
        aria-label="Следующий постер"
        className="absolute right-2 top-1/2 z-[1100] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#E5E5E5] bg-white/90 text-[#111111] backdrop-blur transition hover:bg-white active:scale-95 sm:right-4"
      >
        <ChevronRight size={20} />
      </button>
    </>
  );
}

export const CarouselControls = memo(CarouselControlsImpl);
CarouselControls.displayName = "CarouselControls";
