import type { SlotOffset } from "./stack.types";

/** Fixed set of DOM slots. This array's length is the hard cap on mounted cards. */
export const VISIBLE_SLOTS: readonly SlotOffset[] = [-2, -1, 0, 1, 2] as const;

/** Slots ordered by proximity to the top card — used to resolve which item wins a slot when items.length < VISIBLE_SLOTS.length. */
export const SLOT_PRIORITY_ORDER: readonly SlotOffset[] = [0, -1, 1, -2, 2] as const;

export const MAX_VISIBLE_CARDS = VISIBLE_SLOTS.length;

/** Spring used for the top card while it settles after a drag/keyboard commit. */
export const COMMIT_SPRING = {
  type: "spring" as const,
  stiffness: 420,
  damping: 42,
  mass: 1,
};

/** Spring used when a drag is released without crossing the commit threshold. */
export const CANCEL_SPRING = {
  type: "spring" as const,
  stiffness: 520,
  damping: 38,
  mass: 0.9,
};

/** Spring backing every derived (non-drag) visual property — scale/rotate/opacity of back cards. */
export const AMBIENT_SPRING = {
  type: "spring" as const,
  stiffness: 300,
  damping: 32,
  mass: 0.8,
};

export const REDUCED_MOTION_TRANSITION = {
  type: "tween" as const,
  duration: 0.18,
  ease: "easeOut" as const,
};

/** Elastic resistance applied to the top card while dragging past its own bounds. */
export const DRAG_ELASTIC = 0.18;

/**
 * Swipe is committed when |dragX * velocityX| exceeds this "power" threshold
 * (fast flicks commit on short distance), OR when the raw drag distance
 * exceeds LARGE_DRAG_RATIO of the container width regardless of velocity
 * (slow deliberate drags commit on distance alone).
 */
export const SWIPE_POWER_THRESHOLD = 8000;
export const LARGE_DRAG_RATIO = 0.35;

/** Continuous per-offset falloff used to compute back-card visuals (see stack.utils). */
export const OFFSET_STEP_X = 34;
export const OFFSET_STEP_Y = 16;
export const OFFSET_STEP_SCALE = 0.08;
export const OFFSET_STEP_ROTATE_Z = 3.5;
export const OFFSET_STEP_ROTATE_Y = 6;
export const OFFSET_STEP_OPACITY = 0.3;
export const OFFSET_MAX_ABS = 3;
export const BASE_Z_INDEX = 100;

export const KEYBOARD_KEYS = {
  PREV: "ArrowLeft",
  NEXT: "ArrowRight",
} as const;

export const AUTOPLAY_DISABLED = true;
