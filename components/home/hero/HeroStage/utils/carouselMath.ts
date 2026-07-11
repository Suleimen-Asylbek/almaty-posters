import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import {
  BASE_Z_INDEX,
  BLUR_START_RATIO,
  COMMIT_RATIO,
  MAX_BLUR_PX,
  MIN_SCALE,
  RING_CAPACITY,
  SWIPE_POWER_THRESHOLD_DEG,
} from "../constants";
import type { RingItem, RingLOD, RingSlot } from "../types";

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

/**
 * Fixed-capacity ring (V3.1): the angular pitch is always 360 /
 * RING_CAPACITY. It is a constant, never derived from how many real items
 * exist — that decoupling is what keeps the ring's shape identical
 * whether it holds 3 items or 300.
 */
export function getAngleStepDeg(): number {
  return 360 / RING_CAPACITY;
}

/**
 * Ring radius such that adjacent positions of `cardWidthPx` at this
 * angleStep touch edge-to-edge without overlapping (regular-polygon chord
 * formula), scaled by a breakpoint-provided ratio for visual density.
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
 * Distributes `itemCount` real items across RING_CAPACITY virtual ring
 * positions so that no two adjacent positions — including the wrap-around
 * seam between the last and first position — hold the same item. Uses a
 * greedy max-remaining-count scheduler (the standard "reorganize so no
 * two neighbors match" approach), which spreads repeats as evenly as
 * possible rather than producing a naive A-B-C-D-A-B-C-D pattern.
 *
 * When itemCount >= RING_CAPACITY, only the first RING_CAPACITY items are
 * used, 1:1, no repetition — this is a curated showcase, not a window
 * into the full catalog (see constants.ts for why).
 */
export function buildRingSequence(itemCount: number): number[] {
  if (itemCount <= 0) return [];
  if (itemCount >= RING_CAPACITY) {
    return Array.from({ length: RING_CAPACITY }, (_, position) => position);
  }

  const remaining = Array.from({ length: itemCount }, (_, id) => ({
    id,
    remaining: Math.ceil(RING_CAPACITY / itemCount),
  }));

  let total = remaining.reduce((sum, entry) => sum + entry.remaining, 0);
  let cursor = 0;
  while (total > RING_CAPACITY) {
    remaining[cursor % itemCount].remaining -= 1;
    total -= 1;
    cursor += 1;
  }

  const sequence: number[] = [];
  let last = -1;

  for (let step = 0; step < RING_CAPACITY; step += 1) {
    remaining.sort((a, b) => b.remaining - a.remaining);
    const pick =
      remaining.find((entry) => entry.id !== last && entry.remaining > 0) ??
      remaining.find((entry) => entry.remaining > 0);
    if (!pick) break;
    pick.remaining -= 1;
    sequence.push(pick.id);
    last = pick.id;
  }

  // Guard the wrap-around seam: the greedy scheduler only prevents
  // adjacency along the linear sequence it builds, not between the last
  // and first position, which are also neighbors on a real ring.
  if (sequence.length > 1 && sequence[sequence.length - 1] === sequence[0]) {
    for (let i = 1; i < sequence.length - 1; i += 1) {
      if (
        sequence[i] !== sequence[0] &&
        sequence[i] !== sequence[sequence.length - 1] &&
        sequence[i - 1] !== sequence[sequence.length - 1]
      ) {
        const tmp = sequence[i];
        sequence[i] = sequence[sequence.length - 1];
        sequence[sequence.length - 1] = tmp;
        break;
      }
    }
  }

  return sequence;
}

/**
 * LOD windowing (V3.1 §8): a dense front zone (every position within
 * frontHalfWindow of the active virtual position) plus a sparse, evenly
 * distributed back-zone sample, keyed by stable virtual `position` — not
 * by itemIndex, so React only mounts/unmounts a node at the true edge of
 * the window, never as a side effect of content changing underneath a
 * reused slot. Total mounted nodes is bounded by a constant regardless of
 * RING_CAPACITY or real item count.
 */
export function getLODWindowedSlots(
  items: readonly RingItem[],
  sequence: readonly number[],
  activeVirtualPosition: number,
  frontHalfWindow: number,
  backSampleCount: number,
): RingSlot[] {
  const capacity = sequence.length;
  if (capacity === 0) return [];

  const front = new Map<number, RingLOD>();
  for (let offset = -frontHalfWindow; offset <= frontHalfWindow; offset += 1) {
    const position = wrapIndex(activeVirtualPosition + offset, capacity);
    front.set(position, "front");
  }

  const remainingCount = Math.max(0, capacity - front.size);
  const sampleCount = Math.min(backSampleCount, remainingCount);
  const back = new Set<number>();

  if (sampleCount > 0) {
    const step = capacity / sampleCount;
    for (let i = 0; i < sampleCount; i += 1) {
      let candidate = wrapIndex(Math.round(i * step), capacity);
      let guard = 0;
      while (front.has(candidate) || back.has(candidate)) {
        candidate = wrapIndex(candidate + 1, capacity);
        guard += 1;
        if (guard > capacity) break;
      }
      if (!front.has(candidate)) back.add(candidate);
    }
  }

  const slots: RingSlot[] = [];

  for (const [position, lod] of front) {
    const offset = shortestIndexDelta(activeVirtualPosition, position, capacity);
    const itemIndex = sequence[position];
    slots.push({ position, itemIndex, offset, item: items[itemIndex], lod });
  }
  for (const position of back) {
    const offset = shortestIndexDelta(activeVirtualPosition, position, capacity);
    const itemIndex = sequence[position];
    slots.push({ position, itemIndex, offset, item: items[itemIndex], lod: "back" });
  }

  return slots;
}

/**
 * An item can occupy multiple virtual positions when it repeats around
 * the ring. For "jump to this item" navigation (pagination), picks the
 * occupied position reachable with the shortest rotation from the
 * current position, rather than always the first occurrence.
 */
export function findNearestPositionForItem(
  sequence: readonly number[],
  activeVirtualPosition: number,
  targetItemIndex: number,
): number | null {
  const capacity = sequence.length;
  if (capacity === 0) return null;

  let bestPosition: number | null = null;
  let bestDistance = Infinity;

  for (let position = 0; position < capacity; position += 1) {
    if (sequence[position] !== targetItemIndex) continue;
    const distance = Math.abs(shortestIndexDelta(activeVirtualPosition, position, capacity));
    if (distance < bestDistance) {
      bestDistance = distance;
      bestPosition = position;
    }
  }

  return bestPosition;
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
  // so increasing dragRotationDeg pulls the offset+1 ("next") position
  // toward the front. Commit direction therefore mirrors drag sign
  // directly: positive drag -> next (+1), negative drag -> previous (-1).
  return dragDeg > 0 ? 1 : -1;
}

/**
 * When activeVirtualPosition commits by `deltaSteps` (instantly, before
 * the spring settles), every card's offset shifts by -deltaSteps
 * uniformly. To keep theta_i = offset_i * angleStep - dragRotationDeg
 * visually unchanged at that exact instant, dragRotationDeg must jump by
 * the same amount in the opposite sense — the ring looks identical for
 * one frame, then springs the rest of the way to rest.
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
