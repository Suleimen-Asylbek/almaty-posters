"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

export interface CarouselPaginationProps {
  readonly activeIndex: number;
  readonly total: number;
  readonly canNavigate: boolean;
  readonly onGoTo: (index: number) => void;
}

const MAX_DOTS = 8;

function CarouselPaginationImpl({
  activeIndex,
  total,
  canNavigate,
  onGoTo,
}: CarouselPaginationProps) {
  if (!canNavigate) return null;

  if (total > MAX_DOTS) {
    return (
      <div
        className="mt-6 text-center text-sm font-medium tabular-nums text-[#666666]"
        aria-hidden="true"
      >
        {activeIndex + 1} / {total}
      </div>
    );
  }

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
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
  );
}

export const CarouselPagination = memo(CarouselPaginationImpl);
CarouselPagination.displayName = "CarouselPagination";
