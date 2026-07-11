import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";
import type { PanInfo } from "framer-motion";
import {
  AUTOPLAY_ENABLED,
  AUTOPLAY_INTERVAL_MS,
  BACK_SAMPLE_COUNT_REDUCED_MOTION,
  FRONT_HALF_WINDOW_REDUCED_MOTION,
  KEYBOARD_KEYS,
  RING_CAPACITY,
} from "../constants";
import {
  buildRingSequence,
  findNearestPositionForItem,
  getLODWindowedSlots,
  shortestIndexDelta,
  wrapIndex,
} from "../utils/carouselMath";
import { useResponsiveRingConfig } from "./useResponsiveRingConfig";
import { useRingPhysics } from "./useRingPhysics";
import type { RingItem, RingLayoutConfig, RingSlot } from "../types";

export interface UseCarouselNavigationResult {
  /** Real index into `items` currently at the front — for aria-live text
   * and pagination highlighting, which are about real items, not ring
   * geometry. */
  readonly activeItemIndex: number;
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
  /** Jumps to a specific real item index (e.g. from pagination dots). */
  readonly goTo: (itemIndex: number) => void;
  readonly handleKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  readonly activeItem: RingItem | null;
  /** Pause/resume idle auto-rotation — wire to hover (mouse enter/leave)
   * on the ring's container in addition to the drag pausing this hook
   * already does internally. */
  readonly pauseAutoplay: () => void;
  readonly resumeAutoplay: () => void;
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
  // A virtual ring position (0..RING_CAPACITY), NOT an index into `items`.
  // The ring's shape never depends on items.length — see constants.ts.
  const [activeVirtualPosition, setActiveVirtualPosition] = useState(0);
  const reducedMotion = usePrefersReducedMotion();
  const { containerRef, config: baseConfig } = useResponsiveRingConfig();

  const itemCount = items.length;
  const canNavigate = itemCount > 1;

  const sequence = useMemo(() => buildRingSequence(itemCount), [itemCount]);

  const config = useMemo<RingLayoutConfig | null>(() => {
    if (!baseConfig) return null;
    if (!reducedMotion) return baseConfig;
    return {
      ...baseConfig,
      frontHalfWindow: Math.min(baseConfig.frontHalfWindow, FRONT_HALF_WINDOW_REDUCED_MOTION),
      backSampleCount: BACK_SAMPLE_COUNT_REDUCED_MOTION,
    };
  }, [baseConfig, reducedMotion]);

  // Idle auto-rotation pause state — declared up here because the pan
  // handlers below need to pause it on drag start/end.
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  const pauseAutoplay = useCallback(() => setIsAutoplayPaused(true), []);
  const resumeAutoplay = useCallback(() => setIsAutoplayPaused(false), []);

  const handleCommit = useCallback((deltaSteps: number) => {
    setActiveVirtualPosition((current) => wrapIndex(current + deltaSteps, RING_CAPACITY));
  }, []);

  const {
    dragRotationDeg,
    handlePanStart: handlePanStartPhysics,
    handlePan,
    handlePanEnd: handlePanEndPhysics,
    commitSteps,
    resetImmediately,
  } = useRingPhysics({
    angleStepDeg: config?.angleStepDeg ?? 0,
    reducedMotion,
    onCommit: handleCommit,
  });

  const handlePanStart = useCallback(() => {
    pauseAutoplay();
    handlePanStartPhysics();
  }, [pauseAutoplay, handlePanStartPhysics]);

  const handlePanEnd = useCallback(
    (event: PointerEvent, info: PanInfo) => {
      handlePanEndPhysics(event, info);
      resumeAutoplay();
    },
    [handlePanEndPhysics, resumeAutoplay],
  );

  const goNext = useCallback(() => {
    if (!canNavigate) return;
    commitSteps(1);
  }, [canNavigate, commitSteps]);

  const goPrev = useCallback(() => {
    if (!canNavigate) return;
    commitSteps(-1);
  }, [canNavigate, commitSteps]);

  const goTo = useCallback(
    (itemIndex: number) => {
      if (!canNavigate) return;
      const targetPosition = findNearestPositionForItem(sequence, activeVirtualPosition, itemIndex);
      if (targetPosition === null || targetPosition === activeVirtualPosition) return;
      const delta = shortestIndexDelta(activeVirtualPosition, targetPosition, RING_CAPACITY);
      commitSteps(delta);
    },
    [activeVirtualPosition, canNavigate, commitSteps, sequence],
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

  // Idle auto-rotation. Off entirely under prefers-reduced-motion (never
  // scheduled, not just skipped per-tick) and paused for the duration of
  // any user interaction — pointer drag or hover — so autoplay never
  // fights a gesture the user is mid-way through.
  useEffect(() => {
    if (!AUTOPLAY_ENABLED || !canNavigate || reducedMotion || isAutoplayPaused) return;

    const id = window.setInterval(() => {
      if (document.hidden) return;
      goNext();
    }, AUTOPLAY_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [canNavigate, reducedMotion, isAutoplayPaused, goNext]);

  const slots = useMemo(() => {
    if (!config || sequence.length === 0) return [];
    return getLODWindowedSlots(
      items,
      sequence,
      activeVirtualPosition,
      config.frontHalfWindow,
      config.backSampleCount,
    );
  }, [items, sequence, activeVirtualPosition, config]);

  const activeItemIndex = sequence.length > 0 ? sequence[activeVirtualPosition] : 0;
  const activeItem = items[activeItemIndex] ?? null;

  return {
    activeItemIndex,
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
    pauseAutoplay,
    resumeAutoplay,
  };
}
