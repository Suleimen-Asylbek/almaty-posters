export const MAX_VISIBLE_CARDS = 4;
export const CARD_ASPECT_RATIO = 3 / 4;

export const STACK_STEP_Y_PX = 14;
export const STACK_STEP_SCALE = 0.055;
export const STACK_OPACITY_BY_POSITION = [1, 0.75, 0.45, 0] as const;
export const STACK_BLUR_PX_BY_POSITION = [0, 0.4, 1.2, 2.0] as const;

export const DRAG_DISMISS_DISTANCE_PX = 120;
export const DRAG_DISMISS_VELOCITY = 500;
export const DRAG_ROTATE_DIVISOR = 22;

export const SPRING_SETTLE = {
  type: "spring" as const,
  stiffness: 260,
  damping: 30,
  mass: 1.0,
};

export const SPRING_SNAP_BACK = {
  type: "spring" as const,
  stiffness: 380,
  damping: 36,
  mass: 0.75,
};

export const REDUCED_MOTION_TRANSITION = {
  type: "tween" as const,
  duration: 0.18,
  ease: "easeOut" as const,
};

export const AUTOPLAY_ENABLED = true;
export const AUTOPLAY_INTERVAL_MS = 4000;

export const KEYBOARD_KEYS = {
  NEXT: "ArrowRight",
  PREV: "ArrowLeft",
} as const;
