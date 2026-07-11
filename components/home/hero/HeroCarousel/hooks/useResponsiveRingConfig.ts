import { useCallback, useEffect, useRef, useState } from "react";
import { BREAKPOINTS, RING_TILT_DEG, type Breakpoint } from "../constants";
import { getAngleStepDeg, getRingRadiusPx } from "../utils/carouselMath";
import type { RingLayoutConfig } from "../types";

function pickBreakpoint(viewportWidthPx: number): Breakpoint {
  return (
    BREAKPOINTS.find((bp) => viewportWidthPx >= bp.minWidthPx) ??
    BREAKPOINTS[BREAKPOINTS.length - 1]
  );
}

export interface UseResponsiveRingConfig {
  readonly containerRef: (node: HTMLDivElement | null) => void;
  readonly containerWidthRef: React.MutableRefObject<number>;
  readonly config: RingLayoutConfig | null;
  readonly tiltDeg: number;
}

/**
 * Measures the carousel's own container (not the viewport) via
 * ResizeObserver, throttled to one recalculation per animation frame, and
 * derives a full RingLayoutConfig from the matching breakpoint. Consumers
 * get a plain, render-time object — geometry only changes on resize, so
 * this intentionally uses React state rather than a MotionValue.
 */
export function useResponsiveRingConfig(itemCount: number): UseResponsiveRingConfig {
  const [viewportWidth, setViewportWidth] = useState(0);
  const [containerWidthPx, setContainerWidthPx] = useState(0);
  const containerWidthRef = useRef(0);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const measure = useCallback(() => {
    frameRef.current = null;
    const width = elementRef.current?.getBoundingClientRect().width ?? 0;
    if (Math.abs(width - containerWidthRef.current) > 0.5) {
      containerWidthRef.current = width;
      setContainerWidthPx(width);
    }
    setViewportWidth(window.innerWidth);
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

      const width = node.getBoundingClientRect().width;
      containerWidthRef.current = width;
      setContainerWidthPx(width);
      setViewportWidth(window.innerWidth);

      const observer = new ResizeObserver(scheduleMeasure);
      observer.observe(node);
      observerRef.current = observer;
    },
    [scheduleMeasure],
  );

  useEffect(() => {
    window.addEventListener("resize", scheduleMeasure);
    return () => {
      window.removeEventListener("resize", scheduleMeasure);
      observerRef.current?.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [scheduleMeasure]);

  if (containerWidthPx <= 0) {
    return { containerRef, containerWidthRef, config: null, tiltDeg: RING_TILT_DEG };
  }

  const breakpoint = pickBreakpoint(viewportWidth || containerWidthPx);
  const angleStepDeg = getAngleStepDeg(itemCount);
  const cardWidthPx = containerWidthPx * breakpoint.cardWidthRatio;
  const radiusPx = getRingRadiusPx(cardWidthPx, angleStepDeg, breakpoint.radiusRatio);

  const config: RingLayoutConfig = {
    angleStepDeg,
    radiusPx,
    halfWindow: Math.min(breakpoint.halfWindow, Math.max(itemCount - 1, 0)),
    perspectivePx: breakpoint.perspectivePx,
    tiltDeg: RING_TILT_DEG,
    cardWidthPx,
    cardAspectRatio: breakpoint.cardAspectRatio,
  };

  return { containerRef, containerWidthRef, config, tiltDeg: RING_TILT_DEG };
}
