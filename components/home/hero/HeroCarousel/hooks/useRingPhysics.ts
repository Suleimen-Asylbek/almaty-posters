import { useCallback, useRef } from "react";
import { animate, useMotionValue, type PanInfo } from "framer-motion";
import { CANCEL_SPRING, COMMIT_SPRING, DEG_PER_DRAG_PIXEL } from "../constants";
import { getCompensatedRotationDeg, resolveRingCommit } from "../utils/carouselMath";

export interface UseRingPhysicsOptions {
  readonly angleStepDeg: number;
  readonly reducedMotion: boolean;
  /**
   * Called synchronously, before any animation runs, the instant a commit
   * is decided. React state must reflect the user's intent immediately —
   * the spring that follows is pure visualization of an already-made
   * decision, it never gates the decision itself.
   */
  readonly onCommit: (deltaSteps: number) => void;
}

export interface UseRingPhysics {
  /** Extra ring rotation (degrees) caused by an in-progress or just-settling gesture. 0 at rest. */
  readonly dragRotationDeg: ReturnType<typeof useMotionValue<number>>;
  readonly isDraggingRef: React.MutableRefObject<boolean>;
  readonly handlePanStart: () => void;
  readonly handlePan: (event: PointerEvent, info: PanInfo) => void;
  readonly handlePanEnd: (event: PointerEvent, info: PanInfo) => void;
  /** Commits an arbitrary (possibly multi-step) rotation immediately —
   * used by keyboard, buttons, and pagination jumps. Safe to call
   * repeatedly in quick succession; framer's animate() interrupts and
   * continues from wherever the MotionValue currently sits. */
  readonly commitSteps: (deltaSteps: number) => void;
  readonly resetImmediately: () => void;
}

export function useRingPhysics({
  angleStepDeg,
  reducedMotion,
  onCommit,
}: UseRingPhysicsOptions): UseRingPhysics {
  const dragRotationDeg = useMotionValue(0);
  const isDraggingRef = useRef(false);
  const panStartRotationRef = useRef(0);

  const handlePanStart = useCallback(() => {
    isDraggingRef.current = true;
    panStartRotationRef.current = dragRotationDeg.get();
  }, [dragRotationDeg]);

  const handlePan = useCallback(
    (_event: PointerEvent, info: PanInfo) => {
      const deltaDeg = info.offset.x * DEG_PER_DRAG_PIXEL;
      dragRotationDeg.set(panStartRotationRef.current + deltaDeg);
    },
    [dragRotationDeg],
  );

  const commitSteps = useCallback(
    (deltaSteps: number) => {
      if (deltaSteps === 0) return;

      const compensated = getCompensatedRotationDeg(
        dragRotationDeg.get(),
        deltaSteps,
        angleStepDeg,
      );

      // State reflects intent now, not after the animation completes.
      onCommit(deltaSteps);

      if (reducedMotion) {
        dragRotationDeg.set(0);
        return;
      }

      dragRotationDeg.set(compensated);
      // animate() on a MotionValue with an in-flight animation stops it
      // and continues from the current value — "last command wins," so
      // rapid repeated commits (fast keyboard presses, quick successive
      // pagination clicks) never fight or drop.
      void animate(dragRotationDeg, 0, COMMIT_SPRING);
    },
    [angleStepDeg, dragRotationDeg, onCommit, reducedMotion],
  );

  const handlePanEnd = useCallback(
    (_event: PointerEvent, info: PanInfo) => {
      isDraggingRef.current = false;
      const dragDeg = dragRotationDeg.get();
      const angularVelocityDegPerSec = info.velocity.x * DEG_PER_DRAG_PIXEL;
      const direction = resolveRingCommit(dragDeg, angularVelocityDegPerSec, angleStepDeg);

      if (direction !== 0) {
        commitSteps(direction);
        return;
      }

      if (reducedMotion) {
        dragRotationDeg.set(0);
        return;
      }

      void animate(dragRotationDeg, 0, CANCEL_SPRING);
    },
    [angleStepDeg, commitSteps, dragRotationDeg, reducedMotion],
  );

  const resetImmediately = useCallback(() => {
    isDraggingRef.current = false;
    dragRotationDeg.set(0);
  }, [dragRotationDeg]);

  return {
    dragRotationDeg,
    isDraggingRef,
    handlePanStart,
    handlePan,
    handlePanEnd,
    commitSteps,
    resetImmediately,
  };
}
