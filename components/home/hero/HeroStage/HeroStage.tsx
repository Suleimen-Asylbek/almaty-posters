"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { CarouselControls } from "./CarouselControls";
import { CarouselPagination } from "./CarouselPagination";
import { PosterRing } from "./PosterRing";
import { useCarouselNavigation } from "./hooks/useCarouselNavigation";
import { mapProductsToRingItems } from "./utils/carouselMath";
import type { HeroStageProps, RingItem } from "./types";

function EmptyRingPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-3xl border border-dashed border-[#E5E5E5] bg-[#F6F6F6] text-sm text-[#666666]">
      Постеры скоро появятся
    </div>
  );
}

/**
 * ONE switch controls whether the ring shows fixed placeholder posters or
 * real `products`. Driven by an env var (not a hardcoded `true`/`false`)
 * so this can be flipped per-environment — e.g. `true` in a preview
 * deploy that isn't wired to Supabase yet — without a code change or
 * redeploy. Defaults to `false` (real data) whenever the env var is
 * unset, which is what a production build should get.
 *
 * IMPORTANT — this is not just a display toggle: turning it off surfaces
 * a real, pre-existing gap. `products` here is `getFeaturedProducts()`
 * (`app/page.tsx`), which queries `featured = true` capped at 4 rows. If
 * zero products are currently flagged `featured` in Supabase (a very
 * real state — e.g. right after launch, or if someone unpublishes all
 * of them), `mapProductsToRingItems` legitimately returns `[]` and the
 * ring renders `EmptyRingPlaceholder` instead of a carousel. That is the
 * actual, reproducible source behind "the ring is sometimes invisible" —
 * not a CSS/z-index/render bug. See the investigation notes shared with
 * this change for why raising the `featured` product count in Supabase
 * (or reconsidering the 4-item cap / data source) is a product decision,
 * not something to silently patch here.
 */
const USE_TEMP_TEST_DATA = process.env.NEXT_PUBLIC_HERO_USE_TEST_DATA === "true";

const TEMP_TEST_RING_ITEMS: RingItem[] = Array.from({ length: 8 }, (_, i) => {
  const colors = ["1D9E75", "D85A30", "D4537E", "378ADD", "639922", "BA7517", "534AB7", "5F5E5A"];
  const bg = colors[i % colors.length];
  return {
    id: `temp-${i}`,
    slug: `temp-${i}`,
    title: `Тестовый постер ${i + 1}`,
    imageUrl: `https://placehold.co/480x648/${bg}/ffffff?text=Poster+${i + 1}`,
    priceLabel: "12 000 ₸",
  };
});

/**
 * Floating 3D ring hero showcase.
 *
 * A thin "use client" root only — no separate Server/Client split, since
 * this component receives an already-fetched Product[] from its Server
 * Component parent and does no data fetching of its own. See
 * AI_HANDOFF.md §10 for where this fits in the project.
 */
export function HeroStage({ products, className, viewportClassName }: HeroStageProps) {
  const items = useMemo(
    () => (USE_TEMP_TEST_DATA ? TEMP_TEST_RING_ITEMS : mapProductsToRingItems(products)),
    [products],
  );

  const {
    activeItemIndex,
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
    pauseAutoplay,
    resumeAutoplay,
  } = useCarouselNavigation(items);

  const viewportSizingClassName = viewportClassName ?? "aspect-[4/5] max-w-xl";

  if (items.length === 0) {
    return (
      <div className={cn("w-full mx-auto", viewportSizingClassName, className)}>
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
        onMouseEnter={pauseAutoplay}
        onMouseLeave={resumeAutoplay}
        onFocus={pauseAutoplay}
        onBlur={resumeAutoplay}
        ref={containerRef}
        className={cn(
          "relative w-full mx-auto outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-4 rounded-3xl",
          viewportSizingClassName,
        )}
      >
        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {activeItem
            ? `Постер ${activeItemIndex + 1} из ${items.length}: ${activeItem.title}`
            : ""}
        </span>

        {config && (
          <PosterRing
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
        activeIndex={activeItemIndex}
        total={items.length}
        canNavigate={canNavigate}
        onGoTo={goTo}
      />
    </div>
  );
}
