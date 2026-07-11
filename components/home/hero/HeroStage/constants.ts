/**
 * Fixed-capacity ring (V3.1): the ring's angular pitch and shape NEVER
 * change based on how many real items exist. There are always exactly
 * RING_CAPACITY virtual positions evenly spaced around the circle.
 *
 * - itemCount <= RING_CAPACITY: items repeat around the ring via an
 *   anti-repeat sequence (see buildRingSequence) — intentional, per V3.1.
 * - itemCount > RING_CAPACITY: only the first RING_CAPACITY items are
 *   used. There is no "catalog window" or content-swapping-after-a-full-
 *   turn behavior — that was explicitly rejected (breaks the physical-
 *   object illusion). The Hero is a curated showcase, not the catalog;
 *   showing more than RING_CAPACITY items is an admin-panel concern for a
 *   later phase, not something the ring itself should ever attempt.
 */
export const RING_CAPACITY = 24;

/** LOD zones (see V3.1 §8). Front = full fidelity + interactive, dense.
 * Back = sparse, decorative only, exists purely so the ring reads as
 * complete rather than a front-only arc. Both counts are independent of
 * item count and of RING_CAPACITY — bounded, constant DOM node count. */
export const FRONT_HALF_WINDOW = 6;
export const BACK_SAMPLE_COUNT = 6;
export const FRONT_HALF_WINDOW_REDUCED_MOTION = 1;
export const BACK_SAMPLE_COUNT_REDUCED_MOTION = 0;

/** Degrees of ring rotation per pixel of horizontal drag. Decoupled from
 * angleStep so drag feel stays consistent regardless of product count. */
export const DEG_PER_DRAG_PIXEL = 0.22;

/**
 * Idle auto-rotation. Defaults OFF: a premium showcase (the explicit goal
 * for this Hero) reads as calm and deliberate; autoplay is a pattern most
 * associated with template ecommerce sliders — the exact thing this
 * project has repeatedly, explicitly tried to avoid resembling. The
 * pause-on-hover/focus/drag wiring in useCarouselNavigation is genuinely
 * solid and is left in place (no reason to throw away correct work), but
 * it should only run if a product decision turns this back on — not
 * silently by default. AUTOPLAY_INTERVAL_MS was previously imported by
 * useCarouselNavigation.ts without being defined here at all, which broke
 * the whole project's typecheck; this restores it either way.
 */
export const AUTOPLAY_ENABLED = false;
export const AUTOPLAY_INTERVAL_MS = 7000;

/** A commit is decided by "angular power" (angle * angular velocity) OR by
 * dragging past COMMIT_RATIO of one full step, whichever fires first. */
export const SWIPE_POWER_THRESHOLD_DEG = 2200;
export const COMMIT_RATIO = 0.55;

export const COMMIT_SPRING = {
  type: "spring" as const,
  stiffness: 260,
  damping: 32,
  mass: 1.1,
};

export const CANCEL_SPRING = {
  type: "spring" as const,
  stiffness: 340,
  damping: 30,
  mass: 0.9,
};

export const REDUCED_MOTION_TRANSITION = {
  type: "tween" as const,
  duration: 0.2,
  ease: "easeOut" as const,
};

/** Static tilt applied once to the whole ring group — a subtle "looking
 * slightly down at the showcase" premium touch, not per-card math. */
export const RING_TILT_DEG = 4;

export const KEYBOARD_KEYS = {
  PREV: "ArrowLeft",
  NEXT: "ArrowRight",
} as const;

export interface Breakpoint {
  readonly minWidthPx: number;
  readonly radiusRatio: number;
  readonly cardWidthRatio: number;
  readonly cardAspectRatio: number;
  readonly perspectivePx: number;
  readonly frontHalfWindow: number;
  readonly backSampleCount: number;
}

/**
 * Ordered widest-first; useResponsiveRingConfig picks the first entry
 * whose minWidthPx the viewport satisfies. Ratios are relative to the
 * carousel container's own width, not the viewport, so the ring stays
 * proportionate inside any layout column.
 */
export const BREAKPOINTS: readonly Breakpoint[] = [
  {
    minWidthPx: 1024,
    radiusRatio: 1.35,
    cardWidthRatio: 0.34,
    cardAspectRatio: 4 / 5,
    perspectivePx: 1600,
    frontHalfWindow: FRONT_HALF_WINDOW,
    backSampleCount: BACK_SAMPLE_COUNT,
  },
  {
    minWidthPx: 640,
    radiusRatio: 1.1,
    cardWidthRatio: 0.4,
    cardAspectRatio: 4 / 5,
    perspectivePx: 1300,
    frontHalfWindow: 5,
    backSampleCount: 4,
  },
  {
    minWidthPx: 0,
    radiusRatio: 0.85,
    cardWidthRatio: 0.52,
    cardAspectRatio: 4 / 5,
    perspectivePx: 1000,
    frontHalfWindow: 4,
    backSampleCount: 3,
  },
];

/** Falloff tuning for scale/opacity/blur as a function of |theta| / 180. */
export const MIN_SCALE = 0.42;
export const MAX_BLUR_PX = 3;
export const BLUR_START_RATIO = 0.22;
export const BASE_Z_INDEX = 1000;
