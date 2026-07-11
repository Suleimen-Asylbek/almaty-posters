import type { Product } from "@/lib/types";

/**
 * Slot offsets relative to the active card.
 * 0 is the top (interactive) card. Negative offsets sit "before" it in
 * carousel order, positive offsets sit "after" it. Only offsets in
 * VISIBLE_SLOTS are ever mounted in the DOM.
 */
export type SlotOffset = -2 | -1 | 0 | 1 | 2;

export type NavigationDirection = "prev" | "next";

/**
 * Minimal, UI-only representation of a poster used by the carousel.
 * StackCard/StackCarousel must never depend on Product, Supabase, or
 * pricing fields directly — this is the single mapping boundary.
 */
export interface StackCarouselItem {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly imageUrl: string;
  readonly priceLabel: string;
}

/**
 * Assignment of a concrete item to a fixed DOM slot for a given
 * activeIndex. `hidden` is true when there are fewer items than slots
 * and this slot would otherwise duplicate an already-visible item.
 */
export interface SlotAssignment {
  readonly offset: SlotOffset;
  readonly itemIndex: number;
  readonly item: StackCarouselItem;
  readonly hidden: boolean;
}

export interface SlotVisualStyle {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly rotateZ: number;
  readonly rotateY: number;
  readonly opacity: number;
  readonly zIndex: number;
}

export interface StackCarouselProps {
  readonly products: readonly Product[];
  readonly className?: string;
}

export interface StackCardImageLoading {
  readonly priority: boolean;
  readonly loading: "eager" | "lazy";
}
