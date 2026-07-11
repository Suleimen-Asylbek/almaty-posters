import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { KEYBOARD_KEYS } from "./stack.constants";
import { getSlotAssignments, wrapIndex } from "./stack.utils";
import { useStackPhysics } from "./useStackPhysics";
import type {
  NavigationDirection,
  SlotAssignment,
  StackCarouselItem,
} from "./stack.types";

export interface UseStackCarouselResult {
  readonly activeIndex: number;
  readonly slots: readonly SlotAssignment[];
  readonly containerRef: (node: HTMLDivElement | null) => void;
  readonly containerWidthRef: React.MutableRefObject<number>;
  readonly dragX: ReturnType<typeof useStackPhysics>["dragX"];
  readonly reducedMotion: boolean;
  readonly canNavigate: boolean;
  readonly handleDragStart: () => void;
  readonly handleDragEnd: ReturnType<typeof useStackPhysics>["handleDragEnd"];
  readonly goTo: (index: number) => void;
  readonly goNext: () => void;
  readonly goPrev: () => void;
  readonly handleKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  readonly activeItem: StackCarouselItem | null;
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

function useThrottledContainerWidth(): {
  readonly containerRef: (node: HTMLDivElement | null) => void;
  readonly containerWidthRef: React.MutableRefObject<number>;
} {
  const containerWidthRef = useRef(0);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const measure = useCallback(() => {
    frameRef.current = null;
    const width = elementRef.current?.getBoundingClientRect().width ?? 0;
    if (Math.abs(width - containerWidthRef.current) > 0.5) {
      containerWidthRef.current = width;
    }
  }, []);

  const scheduleMeasure = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(measure);
  }, [measure]);

  const containerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (elementRef.current && observerRef.current) {
        observerRef.current.disconnect();
      }

      elementRef.current = node;
      if (!node) return;

      containerWidthRef.current = node.getBoundingClientRect().width;

      const observer = new ResizeObserver(scheduleMeasure);
      observer.observe(node);
      observerRef.current = observer;
    },
    [scheduleMeasure],
  );

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return { containerRef, containerWidthRef };
}

export function useStackCarousel(
  items: readonly StackCarouselItem[],
): UseStackCarouselResult {
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = usePrefersReducedMotion();
  const { containerRef, containerWidthRef } = useThrottledContainerWidth();

  const length = items.length;
  const canNavigate = length > 1;

  const goByDelta = useCallback(
    (delta: 1 | -1) => {
      setActiveIndex((current) => wrapIndex(current + delta, length || 1));
    },
    [length],
  );

  const handleCommit = useCallback(
    (direction: NavigationDirection) => {
      goByDelta(direction === "next" ? 1 : -1);
    },
    [goByDelta],
  );

  const { dragX, handleDragStart, handleDragEnd, commitImperatively, resetImmediately } =
    useStackPhysics({
      containerWidthRef,
      reducedMotion,
      onCommit: handleCommit,
    });

  const goNext = useCallback(() => {
    if (!canNavigate) return;
    commitImperatively("next");
  }, [canNavigate, commitImperatively]);

  const goPrev = useCallback(() => {
    if (!canNavigate) return;
    commitImperatively("prev");
  }, [canNavigate, commitImperatively]);

  const goTo = useCallback(
    (index: number) => {
      if (!canNavigate) return;
      const target = wrapIndex(index, length);
      if (target === activeIndex) return;
      const forwardDistance = wrapIndex(target - activeIndex, length);
      const backwardDistance = wrapIndex(activeIndex - target, length);
      commitImperatively(forwardDistance <= backwardDistance ? "next" : "prev");
      // commitImperatively only advances by one slot; for multi-step jumps
      // (e.g. dot navigation across several items) we settle directly.
      if (forwardDistance > 1 && backwardDistance > 1) {
        setActiveIndex(target);
      }
    },
    [activeIndex, canNavigate, commitImperatively, length],
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
    if (activeIndex >= length && length > 0) {
      setActiveIndex(wrapIndex(activeIndex, length));
    }
  }, [activeIndex, length]);

  const slots = useMemo(
    () => getSlotAssignments(items, activeIndex),
    [items, activeIndex],
  );

  const activeItem = items[activeIndex] ?? null;

  return {
    activeIndex,
    slots,
    containerRef,
    containerWidthRef,
    dragX,
    reducedMotion,
    canNavigate,
    handleDragStart,
    handleDragEnd,
    goTo,
    goNext,
    goPrev,
    handleKeyDown,
    activeItem,
  };
}
