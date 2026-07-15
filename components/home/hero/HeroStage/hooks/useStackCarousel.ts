import { useCallback, useEffect, useRef, useState } from "react";
import { AUTOPLAY_ENABLED, AUTOPLAY_INTERVAL_MS } from "../constants";
import {
  rotateOrderBackward,
  rotateOrderForward,
  rotateOrderToFront,
} from "../utils/stackMath";

export interface UseStackCarouselResult {
  readonly order: readonly number[];
  readonly activeItemIndex: number;
  readonly canNavigate: boolean;
  readonly goNext: () => void;
  readonly goPrev: () => void;
  readonly goTo: (originalIndex: number) => void;
  readonly setDragging: (dragging: boolean) => void;
  readonly pauseAutoplay: () => void;
  readonly resumeAutoplay: () => void;
}

export function useStackCarousel(itemCount: number): UseStackCarouselResult {
  const [order, setOrder] = useState<number[]>(() =>
    Array.from({ length: itemCount }, (_, i) => i),
  );

  useEffect(() => {
    setOrder(Array.from({ length: itemCount }, (_, i) => i));
  }, [itemCount]);

  const canNavigate = itemCount > 1;
  const isDraggingRef = useRef(false);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);

  const setDragging = useCallback((dragging: boolean) => {
    isDraggingRef.current = dragging;
  }, []);

  const goNext = useCallback(() => {
    if (!canNavigate) return;
    setOrder((prev) => rotateOrderForward(prev));
  }, [canNavigate]);

  const goPrev = useCallback(() => {
    if (!canNavigate) return;
    setOrder((prev) => rotateOrderBackward(prev));
  }, [canNavigate]);

  const goTo = useCallback(
    (originalIndex: number) => {
      if (!canNavigate) return;
      setOrder((prev) => rotateOrderToFront(prev, originalIndex));
    },
    [canNavigate],
  );

  const pauseAutoplay = useCallback(() => setIsAutoplayPaused(true), []);
  const resumeAutoplay = useCallback(() => setIsAutoplayPaused(false), []);

  useEffect(() => {
    if (!AUTOPLAY_ENABLED || !canNavigate || isAutoplayPaused) return;
    const id = window.setInterval(() => {
      if (document.hidden || isDraggingRef.current) return;
      goNext();
    }, AUTOPLAY_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [canNavigate, isAutoplayPaused, goNext]);

  const activeItemIndex = order[0] ?? 0;

  return {
    order,
    activeItemIndex,
    canNavigate,
    goNext,
    goPrev,
    goTo,
    setDragging,
    pauseAutoplay,
    resumeAutoplay,
  };
}
