"use client";

import { memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StackControlsProps {
  readonly activeIndex: number;
  readonly total: number;
  readonly canNavigate: boolean;
  readonly onPrev: () => void;
  readonly onNext: () => void;
  readonly onGoTo: (index: number) => void;
}

const MAX_DOTS = 8;

function StackControlsImpl({
  activeIndex,
  total,
  canNavigate,
  onPrev,
  onNext,
  onGoTo,
}: StackControlsProps) {
  if (!canNavigate) return null;

  const showDots = total <= MAX_DOTS;

  return (
    <div className="mt-6 flex items-center justify-center gap-4">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Предыдущий постер"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E5E5E5] bg-white text-[#111111] transition hover:bg-[#F8F8F8] active:scale-95"
      >
        <ChevronLeft size={20} />
      </button>

      {showDots ? (
        <div className="flex items-center gap-2">
          {Array.from({ length: total }, (_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onGoTo(index)}
              aria-label={`Перейти к постеру ${index + 1} из ${total}`}
              aria-current={index === activeIndex}
              className={cn(
                "h-2 rounded-full transition-all",
                index === activeIndex
                  ? "w-6 bg-[#111111]"
                  : "w-2 bg-[#D9D9D9] hover:bg-[#B5B5B5]",
              )}
            />
          ))}
        </div>
      ) : (
        <span className="min-w-[4.5rem] text-center text-sm font-medium tabular-nums text-[#666666]">
          {activeIndex + 1} / {total}
        </span>
      )}

      <button
        type="button"
        onClick={onNext}
        aria-label="Следующий постер"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E5E5E5] bg-white text-[#111111] transition hover:bg-[#F8F8F8] active:scale-95"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

export const StackControls = memo(StackControlsImpl);
StackControls.displayName = "StackControls";
