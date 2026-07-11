import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import {
  BASE_Z_INDEX,
  BLUR_START_RATIO,
  COMMIT_RATIO,
  MAX_BLUR_PX,
  MIN_SCALE,
  RING_MIN_VIRTUAL_COUNT,
  SWIPE_POWER_THRESHOLD_DEG,
} from "../constants";
import type { RingItem, RingSlot } from "../types";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function wrapIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

/** Normalizes a degree value into (-180, 180]. */
export function normalizeAngle(deg: number): number {
  const wrapped = ((deg + 180) % 360 + 360) % 360 - 180;
  return wrapped === -180 ? 180 : wrapped;
}

/**
 * Signed step count from `from` to `to` around a circle of `length`
 * positions, taking the shorter direction. E.g. length=12, from=11, to=1
 * -> +2 (forward through the wrap), not -10.
 */
export function shortestIndexDelta(
  from: number,
  to: number,
  length: number,
): number {
  if (length <= 0) return 0;
  const raw = wrapIndex(to - from, length);
  return raw > length / 2 ? raw - length : raw;
}

/** The ring's angular pitch. Always 360 / N in index-space terms, but N is
 * floored at RING_MIN_VIRTUAL_COUNT purely for geometry so a handful of
 * posters doesn't produce an absurdly wide per-item angle. */
export function getAngleStepDeg(itemCount: number): number {
  const effectiveCount = Math.max(itemCount, RING_MIN_VIRTUAL_COUNT);
  return 360 / effectiveCount;
}

/**
 * Ring radius such that adjacent cards of `cardWidthPx` at this angleStep
 * touch edge-to-edge without overlapping (regular-polygon chord formula),
 * scaled by a breakpoint-provided ratio for visual density.
 */
export function getRingRadiusPx(
  cardWidthPx: number,
  angleStepDeg: number,
  radiusRatio: number,
): number {
  const halfAngleRad = (angleStepDeg * Math.PI) / 360;
  const geometricRadius = cardWidthPx / 2 / Math.tan(halfAngleRad);
  return geometricRadius * radiusRatio;
}

export function mapProductToRingItem(product: Product): RingItem {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    imageUrl: product.image_url,
    priceLabel: formatPrice(product.price_30x40),
  };
}

export function mapProductsToRingItems(
  products: readonly Product[],
): RingItem[] {
  return products
    .filter((product) => Boolean(product.image_url))
    .map(mapProductToRingItem);
}

/**
 * Which items get a mounted DOM node this render, and at what signed
 * offset from the active index. Iterates offsets outward from the front
 * (0, -1, 1, -2, 2, ...) so nearest-to-camera items are prioritized first
 * if the list is shorter than the window. Each underlying item appears at
 * most once — for small item counts a large half-window would otherwise
 * request the same item at two different offsets, which breaks React key
 * uniqueness; the shorter-path offset wins.
 */
export function getVisibleRingSlots(
  items: readonly RingItem[],
  activeIndex: number,
  halfWindow: number,
): RingSlot[] {
  const length = items.length;
  if (length === 0) return [];

  const maxSlots = Math.min(length, halfWindow * 2 + 1);
  const seen = new Set<number>();
  const slots: RingSlot[] = [];

  for (let step = 0; step <= halfWindow && slots.length < maxSlots; step += 1) {
    const offsets = step === 0 ? [0] : [-step, step];

    for (const offset of offsets) {
      if (slots.length >= maxSlots) break;

      const itemIndex = wrapIndex(activeIndex + offset, length);
      if (seen.has(itemIndex)) continue;

      seen.add(itemIndex);
      slots.push({ itemIndex, offset, item: items[itemIndex] });
    }
  }

  return slots;
}

/**
 * Decides whether a released pan gesture should commit to a ring step.
 * Combines angular "power" (angle * angular velocity, so fast flicks
 * commit on a short drag) with an independent distance fallback (so slow,
 * deliberate drags still commit near-zero release velocity).
 */
export function resolveRingCommit(
  dragDeg: number,
  angularVelocityDegPerSec: number,
  angleStepDeg: number,
): -1 | 0 | 1 {
  if (angleStepDeg <= 0) return 0;

  const power = dragDeg * angularVelocityDegPerSec;
  const distanceRatio = Math.abs(dragDeg) / angleStepDeg;

  const committedByPower = Math.abs(power) > SWIPE_POWER_THRESHOLD_DEG;
  const committedByDistance = distanceRatio > COMMIT_RATIO;

  if (!committedByPower && !committedByDistance) return 0;

  // theta_i = offset_i * angleStep - dragRotationDeg (see useRingPhysics),
  // so increasing dragRotationDeg pulls the offset+1 ("next") item toward
  // the front. Commit direction therefore mirrors drag sign directly:
  // positive drag -> next (+1), negative drag -> previous (-1).
  return dragDeg > 0 ? 1 : -1;
}

/**
 * When activeIndex commits by `deltaSteps` (instantly, before the spring
 * settles), every card's offset shifts by -deltaSteps uniformly. To keep
 * theta_i = offset_i * angleStep - dragRotationDeg visually unchanged at
 * that exact instant, dragRotationDeg must jump by the same amount in the
 * opposite sense — the ring looks identical for one frame, then springs
 * the rest of the way to rest.
 */
export function getCompensatedRotationDeg(
  currentRotationDeg: number,
  deltaSteps: number,
  angleStepDeg: number,
): number {
  return currentRotationDeg - deltaSteps * angleStepDeg;
}

export interface RingVisualStyle {
  readonly scale: number;
  readonly opacity: number;
  readonly blurPx: number;
  readonly zIndex: number;
}

/**
 * Continuous falloff from theta (the card's current signed angle from
 * front, in degrees) to its non-transform visual properties. Purely a
 * function of |theta|/180, so it degrades smoothly for any ring size and
 * never needs a hard cutoff (nothing "suddenly" appears or disappears).
 */
export function getRingVisualStyle(thetaDeg: number): RingVisualStyle {
  const normalized = normalizeAngle(thetaDeg);
  const ratio = clamp(Math.abs(normalized) / 180, 0, 1);

  const scale = 1 - ratio * (1 - MIN_SCALE);
  const opacity = clamp(1.15 - ratio * 1.15, 0, 1);
  const blurPx =
    ratio <= BLUR_START_RATIO
      ? 0
      : ((ratio - BLUR_START_RATIO) / (1 - BLUR_START_RATIO)) * MAX_BLUR_PX;
  const zIndex = Math.round(BASE_Z_INDEX - ratio * 1000);

  return { scale, opacity, blurPx, zIndex };
}
