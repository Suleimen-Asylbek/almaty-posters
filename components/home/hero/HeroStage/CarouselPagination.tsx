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
    // Intentionally aria-hidden, not a gap: HeroStage.tsx already renders
    // a `sr-only` `aria-live="polite"` region announcing "Poster X of Y:
    // <title>" on every position change. Also exposing this visible
    // counter to assistive tech would double-announce the same fact on
    // every change.
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
    <div
      role="group"
      aria-label="Навигация по карусели постеров"
      className="mt-6 flex items-center justify-center gap-2"
    >
      {Array.from({ length: total }, (_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onGoTo(index)}
          aria-label={`Перейти к постеру ${index + 1} из ${total}`}
          aria-current={index === activeIndex}
          className={cn(
            // Visible dot is intentionally tiny (h-2, w-2/w-6) — that's
            // the Blueprint's ~5% ambient weight for chrome, unchanged
            // here. The clickable/tappable area is expanded to the
            // WCAG 44×44 CSS px minimum via an invisible `::before`
            // that extends beyond the dot's own box without affecting
            // layout (no change to gap-2 spacing between dots, no
            // change to the row's total width).
            "relative h-2 rounded-full transition-all before:absolute before:inset-[-18px] before:content-['']",
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
