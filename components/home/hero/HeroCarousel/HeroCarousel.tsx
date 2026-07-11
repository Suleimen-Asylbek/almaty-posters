"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { CarouselControls } from "./CarouselControls";
import { CarouselPagination } from "./CarouselPagination";
import { CarouselRing } from "./CarouselRing";
import { useCarouselNavigation } from "./hooks/useCarouselNavigation";
import { mapProductsToRingItems } from "./utils/carouselMath";
import type { HeroCarouselProps } from "./types";

function EmptyRingPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-3xl border border-dashed border-[#E5E5E5] bg-[#F6F6F6] text-sm text-[#666666]">
      Постеры скоро появятся
    </div>
  );
}

/**
 * Floating 3D ring hero showcase.
 *
 * A thin "use client" root only — no separate Server/Client split, since
 * this component receives an already-fetched Product[] from its Server
 * Component parent and does no data fetching of its own. See
 * AI_HANDOFF.md §10 for where this fits in the project.
 */
export function HeroCarousel({ products, className }: HeroCarouselProps) {
  const items = useMemo(() => mapProductsToRingItems(products), [products]);

  const {
    activeIndex,
    slots,
    config,
    containerRef,
    dragRotationDeg,
    reducedMotion,
    canNavigate,
    handlePanStart,
    handlePan,
    handlePanEnd,
    goNext,
    goPrev,
    goTo,
    handleKeyDown,
    activeItem,
  } = useCarouselNavigation(items);

  if (items.length === 0) {
    return (
      <div className={cn("aspect-[4/5] w-full max-w-xl mx-auto", className)}>
        <EmptyRingPlaceholder />
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Витрина постеров"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        ref={containerRef}
        className="relative aspect-[4/5] w-full max-w-xl mx-auto outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-4 rounded-3xl"
      >
        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {activeItem
            ? `Постер ${activeIndex + 1} из ${items.length}: ${activeItem.title}`
            : ""}
        </span>

        {config && (
          <CarouselRing
            slots={slots}
            config={config}
            dragRotationDeg={dragRotationDeg}
            reducedMotion={reducedMotion}
            canDrag={canNavigate}
            onPanStart={handlePanStart}
            onPan={handlePan}
            onPanEnd={handlePanEnd}
          />
        )}

        <CarouselControls canNavigate={canNavigate} onPrev={goPrev} onNext={goNext} />
      </div>

      <CarouselPagination
        activeIndex={activeIndex}
        total={items.length}
        canNavigate={canNavigate}
        onGoTo={goTo}
      />
    </div>
  );
}
