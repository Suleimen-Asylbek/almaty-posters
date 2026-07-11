import type { Product } from "@/lib/types";

export type RingDirection = -1 | 1;

/**
 * Minimal, UI-only representation of a poster used by the ring.
 * CarouselPoster must never depend on Product, Supabase, or pricing
 * logic directly — HeroCarousel is the single Product -> UI mapping
 * boundary.
 */
export interface RingItem {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly imageUrl: string;
  readonly priceLabel: string;
}

/**
 * One rendered poster: a stable item plus its signed offset from the
 * active index (shortest path around the circle, e.g. -2 = two steps
 * before the front item). `offset` is a plain number, not a MotionValue —
 * it only changes when activeIndex commits, which is infrequent, so it's
 * safe to recompute per render and close over inside each card's
 * useTransform chain.
 */
export interface RingSlot {
  readonly itemIndex: number;
  readonly offset: number;
  readonly item: RingItem;
}

export interface RingLayoutConfig {
  readonly angleStepDeg: number;
  readonly radiusPx: number;
  readonly halfWindow: number;
  readonly perspectivePx: number;
  readonly tiltDeg: number;
  readonly cardWidthPx: number;
  readonly cardAspectRatio: number;
}

export interface HeroCarouselProps {
  readonly products: readonly Product[];
  readonly className?: string;
}
