import { useCallback, useRef } from "react";
import { animate, useMotionValue } from "framer-motion";
import { getCancelTransition, getCommitTransition } from "./stack.animations";
import { resolveDragCommit } from "./stack.utils";
import type { NavigationDirection } from "./stack.types";

export interface DragEndInfo {
  readonly offset: { readonly x: number; readonly y: number };
  readonly velocity: { readonly x: number; readonly y: number };
}

export interface UseStackPhysicsOptions {
  readonly containerWidthRef: React.MutableRefObject<number>;
  readonly reducedMotion: boolean;
  readonly onCommit: (direction: NavigationDirection) => void;
}

export interface UseStackPhysics {
  /** Raw pixel offset of the top card. Drive x transforms from this directly. */
  readonly dragX: ReturnType<typeof useMotionValue<number>>;
  readonly isDraggingRef: React.MutableRefObject<boolean>;
  readonly handleDragStart: () => void;
  readonly handleDragEnd: (
    _event: PointerEvent | MouseEvent | TouchEvent,
    info: DragEndInfo,
  ) => void;
  /** Imperatively slides the top card off-slot then invokes onCommit. Used by keyboard/button navigation. */
  readonly commitImperatively: (direction: NavigationDirection) => void;
  /** Resets the top card instantly to its resting position (e.g. on blur/visibility change). */
  readonly resetImmediately: () => void;
}

/**
 * Owns the low-level drag physics of the top card: a single MotionValue
 * driving pixel position, plus imperative spring animations for commit and
 * cancel. Contains no React state — every per-frame value lives on the
 * MotionValue so drags never trigger a React re-render.
 */
export function useStackPhysics({
  containerWidthRef,
  reducedMotion,
  onCommit,
}: UseStackPhysicsOptions): UseStackPhysics {
  const dragX = useMotionValue(0);
  const isDraggingRef = useRef(false);

  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true;
  }, []);

  const commitImperatively = useCallback(
    (direction: NavigationDirection) => {
      const width = containerWidthRef.current || 1;
      const target = direction === "next" ? -width : width;

      void animate(dragX, target, getCommitTransition(reducedMotion)).then(() => {
        onCommit(direction);
        dragX.set(0);
      });
    },
    [containerWidthRef, dragX, onCommit, reducedMotion],
  );

  const resetImmediately = useCallback(() => {
    isDraggingRef.current = false;
    dragX.set(0);
  }, [dragX]);

  const handleDragEnd = useCallback(
    (_event: PointerEvent | MouseEvent | TouchEvent, info: DragEndInfo) => {
      isDraggingRef.current = false;
      const width = containerWidthRef.current || 1;
      const direction = resolveDragCommit(info.offset.x, info.velocity.x, width);

      if (direction) {
        commitImperatively(direction);
        return;
      }

      void animate(dragX, 0, getCancelTransition(reducedMotion));
    },
    [commitImperatively, containerWidthRef, dragX, reducedMotion],
  );

  return {
    dragX,
    isDraggingRef,
    handleDragStart,
    handleDragEnd,
    commitImperatively,
    resetImmediately,
  };
}
