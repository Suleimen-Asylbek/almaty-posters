/**
 * The ring's angular pitch is always 360 / N (N = full product count), so
 * navigation genuinely models a circle and the administrator's order is
 * preserved forever in every direction. RING_MIN_VIRTUAL_COUNT only
 * affects that division for very small N, so 3-4 posters don't produce a
 * comically wide 90°+ pitch — it never changes index math or wrapping,
 * only the geometry.
 */
export const RING_MIN_VIRTUAL_COUNT = 12;

/** DOM nodes mounted at once = 2 * RING_HALF_WINDOW + 1 (capped by item count). */
export const RING_HALF_WINDOW = 6;
export const RING_HALF_WINDOW_REDUCED_MOTION = 1;

/** Degrees of ring rotation per pixel of horizontal drag. Decoupled from
 * angleStep so drag feel stays consistent regardless of product count. */
export const DEG_PER_DRAG_PIXEL = 0.22;

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
  readonly halfWindow: number;
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
    halfWindow: RING_HALF_WINDOW,
  },
  {
    minWidthPx: 640,
    radiusRatio: 1.1,
    cardWidthRatio: 0.4,
    cardAspectRatio: 4 / 5,
    perspectivePx: 1300,
    halfWindow: 5,
  },
  {
    minWidthPx: 0,
    radiusRatio: 0.85,
    cardWidthRatio: 0.52,
    cardAspectRatio: 4 / 5,
    perspectivePx: 1000,
    halfWindow: 4,
  },
];

/** Falloff tuning for scale/opacity/blur as a function of |theta| / 180. */
export const MIN_SCALE = 0.42;
export const MAX_BLUR_PX = 3;
export const BLUR_START_RATIO = 0.22;
export const BASE_Z_INDEX = 1000;
