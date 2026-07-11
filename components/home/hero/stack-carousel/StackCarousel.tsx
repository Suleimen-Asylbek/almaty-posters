"use client";

import { useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { StackCard } from "./StackCard";
import { StackControls } from "./StackControls";
import { mapProductsToCarouselItems } from "./stack.utils";
import { useStackCarousel } from "./useStackCarousel";
import type { StackCarouselProps } from "./stack.types";

function EmptyStackPlaceholder() {
  return (
    <div className="flex aspect-[4/5] w-full items-center justify-center rounded-3xl border border-dashed border-[#E5E5E5] bg-[#F6F6F6] text-sm text-[#666666]">
      Постеры скоро появятся
    </div>
  );
}

export function StackCarousel({
  products,
  className,
}: StackCarouselProps) {
  const items = useMemo(
    () => mapProductsToCarouselItems(products),
    [products],
  );

  const {
    activeIndex,
    slots,
    containerRef,
    containerWidthRef,
    dragX,
    canNavigate,
    handleDragStart,
    handleDragEnd,
    goTo,
    goNext,
    goPrev,
    handleKeyDown,
    activeItem,
  } = useStackCarousel(items);

  const stableDragStart = useCallback(
    () => handleDragStart(),
    [handleDragStart],
  );

  const stableDragEnd = useCallback(
    (
      event: PointerEvent | MouseEvent | TouchEvent,
      info: Parameters<typeof handleDragEnd>[1],
    ) => handleDragEnd(event, info),
    [handleDragEnd],
  );

  if (items.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        <EmptyStackPlaceholder />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative mx-auto aspect-[4/5] w-full max-w-[520px] overflow-visible outline-none",
        className,
      )}
      aria-label={
        activeItem
          ? `Постер ${activeIndex + 1} из ${items.length}: ${activeItem.title}`
          : "Карусель постеров"
      }
    >
      {slots.map((slot) => (
        <StackCard
          key={`${slot.item.id}-${slot.offset}`}
          item={slot.item}
          offset={slot.offset}
          hidden={slot.hidden}
          dragX={dragX}
          containerWidthRef={containerWidthRef}
          canDrag={canNavigate}
          onDragStart={stableDragStart}
          onDragEnd={stableDragEnd}
        />
      ))}

      <StackControls
        activeIndex={activeIndex}
        total={items.length}
        canNavigate={canNavigate}
        onPrev={goPrev}
        onNext={goNext}
        onGoTo={goTo}
      />
    </div>
  );
}