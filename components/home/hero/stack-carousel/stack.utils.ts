import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import {
  BASE_Z_INDEX,
  LARGE_DRAG_RATIO,
  OFFSET_MAX_ABS,
  OFFSET_STEP_OPACITY,
  OFFSET_STEP_ROTATE_Y,
  OFFSET_STEP_ROTATE_Z,
  OFFSET_STEP_SCALE,
  OFFSET_STEP_X,
  OFFSET_STEP_Y,
  SLOT_PRIORITY_ORDER,
  SWIPE_POWER_THRESHOLD,
  VISIBLE_SLOTS,
} from "./stack.constants";
import type {
  NavigationDirection,
  SlotAssignment,
  SlotOffset,
  SlotVisualStyle,
  StackCarouselItem,
} from "./stack.types";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Wraps an arbitrary integer into the [0, length) range. */
export function wrapIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

export function mapProductToCarouselItem(product: Product): StackCarouselItem {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    imageUrl: product.image_url,
    priceLabel: formatPrice(product.price_30x40),
  };
}

export function mapProductsToCarouselItems(
  products: readonly Product[],
): StackCarouselItem[] {
  return products
    .filter((product) => Boolean(product.image_url))
    .map(mapProductToCarouselItem);
}

/**
 * Pure, continuous mapping from a (possibly fractional) offset to visual
 * properties. Used both for resting slots (integer offsets) and for
 * in-progress drag interpolation (fractional offsets), so the whole stack
 * reacts smoothly instead of snapping between two hard-coded states.
 */
export function getSlotVisualStyle(offset: number): SlotVisualStyle {
  const clamped = clamp(offset, -OFFSET_MAX_ABS, OFFSET_MAX_ABS);
  const abs = Math.abs(clamped);
  const sign = Math.sign(clamped);

  return {
    x: sign * abs * OFFSET_STEP_X,
    y: abs * OFFSET_STEP_Y,
    scale: 1 - abs * OFFSET_STEP_SCALE,
    rotateZ: -sign * abs * OFFSET_STEP_ROTATE_Z,
    rotateY: -sign * abs * OFFSET_STEP_ROTATE_Y,
    opacity: clamp(1 - abs * OFFSET_STEP_OPACITY, 0, 1),
    zIndex: Math.round(BASE_Z_INDEX - abs * 10),
  };
}

/**
 * Resolves which item (by index into `items`) each fixed DOM slot should
 * render for a given activeIndex, deduplicating when items.length is
 * smaller than the number of slots (e.g. 1 or 2 products).
 */
export function getSlotAssignments(
  items: readonly StackCarouselItem[],
  activeIndex: number,
): SlotAssignment[] {
  const length = items.length;
  if (length === 0) return [];

  const seen = new Set<number>();
  const byOffset = new Map<SlotOffset, SlotAssignment>();

  for (const offset of SLOT_PRIORITY_ORDER) {
    const itemIndex = wrapIndex(activeIndex + offset, length);
    const alreadyShown = seen.has(itemIndex);
    if (!alreadyShown) seen.add(itemIndex);

    byOffset.set(offset, {
      offset,
      itemIndex,
      item: items[itemIndex],
      hidden: alreadyShown,
    });
  }

  return VISIBLE_SLOTS.map((offset) => byOffset.get(offset)!);
}

/**
 * Decides whether a released drag should commit to prev/next navigation.
 * Combines velocity*distance ("swipe power", so fast flicks commit on a
 * short distance) with an independent large-distance fallback (so slow,
 * deliberate drags still commit even at near-zero release velocity).
 */
export function resolveDragCommit(
  dragOffsetPx: number,
  velocityPx: number,
  containerWidthPx: number,
): NavigationDirection | null {
  if (containerWidthPx <= 0) return null;

  const power = dragOffsetPx * velocityPx;
  const distanceRatio = Math.abs(dragOffsetPx) / containerWidthPx;

  const committedByPower = Math.abs(power) > SWIPE_POWER_THRESHOLD;
  const committedByDistance = distanceRatio > LARGE_DRAG_RATIO;

  if (!committedByPower && !committedByDistance) return null;

  // Dragging the top card to the left (negative x) reveals the next card.
  return dragOffsetPx < 0 ? "next" : "prev";
}

export function directionToIndexDelta(direction: NavigationDirection): 1 | -1 {
  return direction === "next" ? 1 : -1;
}
