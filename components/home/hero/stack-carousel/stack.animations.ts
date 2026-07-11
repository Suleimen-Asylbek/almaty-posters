import type { Transition } from "framer-motion";
import {
  AMBIENT_SPRING,
  CANCEL_SPRING,
  COMMIT_SPRING,
  REDUCED_MOTION_TRANSITION,
} from "./stack.constants";

/** Transition applied when a drag/keyboard commit sends the top card off-slot. */
export function getCommitTransition(reducedMotion: boolean): Transition {
  return reducedMotion ? REDUCED_MOTION_TRANSITION : COMMIT_SPRING;
}

/** Transition applied when a released drag snaps back to its resting slot. */
export function getCancelTransition(reducedMotion: boolean): Transition {
  return reducedMotion ? REDUCED_MOTION_TRANSITION : CANCEL_SPRING;
}

/** Transition backing the continuously-derived (ambient) back-card visuals. */
export function getAmbientTransition(reducedMotion: boolean): Transition {
  return reducedMotion ? REDUCED_MOTION_TRANSITION : AMBIENT_SPRING;
}

export const fadeOnlyVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
} as const;
