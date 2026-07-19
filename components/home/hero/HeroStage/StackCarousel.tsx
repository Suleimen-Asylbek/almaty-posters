"use client";

import { useCallback, useMemo, useEffect, useState, type KeyboardEvent } from "react";
import { animate, useMotionValue, AnimatePresence, motion, type PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";
import { StackCard } from "./StackCard";
import { CarouselControls } from "./CarouselControls";
import { CarouselPagination } from "./CarouselPagination";
import { useStackCarousel } from "./hooks/useStackCarousel";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import {
  DRAG_DISMISS_DISTANCE_PX,
  DRAG_DISMISS_VELOCITY,
  KEYBOARD_KEYS,
  MAX_VISIBLE_CARDS,
  SPRING_SNAP_BACK,
} from "./constants";
import type { StackItem } from "./types";

export interface StackCarouselProps {
  readonly items: readonly StackItem[];
  readonly className?: string;
  readonly viewportClassName?: string;
}

function EmptyPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-3xl border border-dashed border-[#E5E5E5] bg-[#F6F6F6] text-sm text-[#666666]">
      Постеры скоро появятся
    </div>
  );
}

export function StackCarousel({
  items,
  className,
  viewportClassName,
}: StackCarouselProps) {
  const reducedMotion = usePrefersReducedMotion();
  const dragX = useMotionValue(0);

  const [showHint, setShowHint] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const {
    order,
    activeItemIndex,
    canNavigate,
    goNext,
    goPrev,
    goTo,
    setDragging,
    pauseAutoplay,
    resumeAutoplay,
  } = useStackCarousel(items.length);

  const handleDragStart = useCallback(() => {
    setDragging(true);
    pauseAutoplay();
  }, [setDragging, pauseAutoplay]);

  const handleDragEnd = useCallback(
    (_event: PointerEvent, info: PanInfo) => {
      setDragging(false);
      resumeAutoplay();

      const dist = info.offset.x;
      const vel = info.velocity.x;

      if (dist < -DRAG_DISMISS_DISTANCE_PX || vel < -DRAG_DISMISS_VELOCITY) {
        dragX.set(0);
        goNext();
        return;
      }

      if (dist > DRAG_DISMISS_DISTANCE_PX || vel > DRAG_DISMISS_VELOCITY) {
        dragX.set(0);
        goPrev();
        return;
      }

      void animate(dragX, 0, SPRING_SNAP_BACK);
    },
    [dragX, goNext, goPrev, resumeAutoplay, setDragging],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === KEYBOARD_KEYS.NEXT) {
        event.preventDefault();
        goNext();
      } else if (event.key === KEYBOARD_KEYS.PREV) {
        event.preventDefault();
        goPrev();
      }
    },
    [goNext, goPrev],
  );

  const visibleSlots = useMemo(
    () =>
      order.slice(0, MAX_VISIBLE_CARDS).map((originalIndex, position) => ({
        position,
        item: items[originalIndex],
      })),
    [order, items],
  );

  const activeItem = items[activeItemIndex] ?? null;

  if (items.length === 0) {
    return (
      <div
        className={cn(
          "mx-auto w-full",
          viewportClassName ?? "aspect-[3/4] max-w-sm",
          className,
        )}
      >
        <EmptyPlaceholder />
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
        className={cn(
          "relative mx-auto w-full outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-4 focus-visible:ring-offset-white rounded-3xl",
          viewportClassName ?? "aspect-[3/4] max-w-sm",
        )}
      >
        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {activeItem
            ? `Постер ${activeItemIndex + 1} из ${items.length}: ${activeItem.title}`
            : ""}
        </span>

        {visibleSlots.map(({ position, item }) => (
          <StackCard
            key={item.id}
            item={item}
            position={position}
            reducedMotion={reducedMotion}
            isFront={position === 0}
            canDrag={canNavigate}
            dragX={dragX}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        ))}

        <CarouselControls
          canNavigate={canNavigate}
          onPrev={goPrev}
          onNext={goNext}
        />
      </div>

      <CarouselPagination
        activeIndex={activeItemIndex}
        total={items.length}
        canNavigate={canNavigate}
        onGoTo={goTo}
      />

      <AnimatePresence>
        {showHint && canNavigate && !reducedMotion && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="mt-3 text-center text-[11px] font-medium uppercase tracking-widest text-[#AAAAAA] select-none pointer-events-none"
          >
            ← Потяни →
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
