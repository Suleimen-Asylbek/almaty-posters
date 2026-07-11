import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";
import { KEYBOARD_KEYS, RING_HALF_WINDOW_REDUCED_MOTION } from "../constants";
import {
  getVisibleRingSlots,
  shortestIndexDelta,
  wrapIndex,
} from "../utils/carouselMath";
import { useResponsiveRingConfig } from "./useResponsiveRingConfig";
import { useRingPhysics } from "./useRingPhysics";
import type { RingItem, RingLayoutConfig, RingSlot } from "../types";

export interface UseCarouselNavigationResult {
  readonly activeIndex: number;
  readonly slots: readonly RingSlot[];
  readonly config: RingLayoutConfig | null;
  readonly containerRef: (node: HTMLDivElement | null) => void;
  readonly dragRotationDeg: ReturnType<typeof useRingPhysics>["dragRotationDeg"];
  readonly reducedMotion: boolean;
  readonly canNavigate: boolean;
  readonly handlePanStart: ReturnType<typeof useRingPhysics>["handlePanStart"];
  readonly handlePan: ReturnType<typeof useRingPhysics>["handlePan"];
  readonly handlePanEnd: ReturnType<typeof useRingPhysics>["handlePanEnd"];
  readonly goNext: () => void;
  readonly goPrev: () => void;
  readonly goTo: (index: number) => void;
  readonly handleKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  readonly activeItem: RingItem | null;
}

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(query.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

export function useCarouselNavigation(
  items: readonly RingItem[],
): UseCarouselNavigationResult {
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = usePrefersReducedMotion();
  const { containerRef, config: baseConfig } = useResponsiveRingConfig(items.length);

  const length = items.length;
  const canNavigate = length > 1;

  const config = useMemo<RingLayoutConfig | null>(() => {
    if (!baseConfig) return null;
    if (!reducedMotion) return baseConfig;
    return { ...baseConfig, halfWindow: Math.min(baseConfig.halfWindow, RING_HALF_WINDOW_REDUCED_MOTION) };
  }, [baseConfig, reducedMotion]);

  const handleCommit = useCallback(
    (deltaSteps: number) => {
      setActiveIndex((current) => wrapIndex(current + deltaSteps, length || 1));
    },
    [length],
  );

  const { dragRotationDeg, handlePanStart, handlePan, handlePanEnd, commitSteps, resetImmediately } =
    useRingPhysics({
      angleStepDeg: config?.angleStepDeg ?? 0,
      reducedMotion,
      onCommit: handleCommit,
    });

  const goNext = useCallback(() => {
    if (!canNavigate) return;
    commitSteps(1);
  }, [canNavigate, commitSteps]);

  const goPrev = useCallback(() => {
    if (!canNavigate) return;
    commitSteps(-1);
  }, [canNavigate, commitSteps]);

  const goTo = useCallback(
    (index: number) => {
      if (!canNavigate) return;
      const target = wrapIndex(index, length);
      if (target === activeIndex) return;
      const delta = shortestIndexDelta(activeIndex, target, length);
      commitSteps(delta);
    },
    [activeIndex, canNavigate, commitSteps, length],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === KEYBOARD_KEYS.NEXT) {
        event.preventDefault();
        goNext();
      } else if (event.key === KEYBOARD_KEYS.PREV) {
        event.preventDefault();
        goPrev();
      }
    },
    [goNext, goPrev],
  );

  useEffect(() => {
    const handleVisibilityOrBlur = () => {
      if (document.hidden) resetImmediately();
    };
    window.addEventListener("blur", resetImmediately);
    document.addEventListener("visibilitychange", handleVisibilityOrBlur);
    return () => {
      window.removeEventListener("blur", resetImmediately);
      document.removeEventListener("visibilitychange", handleVisibilityOrBlur);
    };
  }, [resetImmediately]);

  useEffect(() => {
    if (length > 0 && activeIndex >= length) {
      setActiveIndex(wrapIndex(activeIndex, length));
    }
  }, [activeIndex, length]);

  const slots = useMemo(() => {
    if (!config) return [];
    return getVisibleRingSlots(items, activeIndex, config.halfWindow);
  }, [items, activeIndex, config]);

  const activeItem = items[activeIndex] ?? null;

  return {
    activeIndex,
    slots,
    config,
    containerRef,
    dragRotationDeg,
    reducedMotion,
    canNavigate,
    handlePanStart,
    handlePan,
    handlePanEnd,
    goNext,
    goPrev,
    goTo,
    handleKeyDown,
    activeItem,
  };
}
