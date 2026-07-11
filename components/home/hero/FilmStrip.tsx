"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import type { Product } from "@/lib/types";

interface FilmStripProps {
  readonly products: readonly Product[];
}

/** Enough frames to feel like a continuous strip without mounting the
 * whole catalog — this is atmosphere, not a data view. Deterministic
 * slice (first N), same reasoning as the old HeroVisual's poster pick:
 * stable across server/client and across refreshes. */
const FRAME_COUNT = 10;

/** Pixels per second — slow enough to read as ambient motion, not a
 * ticker. Tuned to be "felt, not watched". */
const AUTO_SCROLL_SPEED_PX_PER_SEC = 18;

/** How long after the user's last touch/wheel/drag input before
 * auto-scroll resumes — long enough that resuming never feels like it's
 * fighting an interaction that just ended. */
const RESUME_DELAY_MS = 1200;

/**
 * Right-column atmosphere for the Hero's top row — a slow, continuous
 * vertical strip of posters. Purely decorative: no navigation, no shared
 * state with HeroStage/PosterRing, nothing here can compete with the
 * ring for "what is the main object" because it has no interactive
 * affordance beyond "you can scroll it if you want to look closer".
 *
 * Mechanics: the frame list is rendered twice, back to back. A rAF loop
 * increments the container's native `scrollTop`; once it passes the
 * height of one copy, it subtracts that height — since copy two is
 * pixel-identical to copy one, the wrap is invisible. Native scroll
 * (`overflow-y-auto`) is what makes this genuinely mouse/touch
 * scrollable, not a from-scratch drag implementation — the browser
 * already does that correctly. Any user scroll/touch/wheel input pauses
 * the rAF loop for RESUME_DELAY_MS so it never fights the user's own
 * scroll momentum.
 *
 * prefers-reduced-motion: the rAF loop never starts. The strip is still
 * scrollable by hand — reduced motion means no *unprompted* motion, not
 * "remove the feature".
 */
export function FilmStrip({ products }: FilmStripProps) {
  const reducedMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const copyHeightRef = useRef(0);
  const pausedUntilRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  const frames = products.slice(0, FRAME_COUNT).filter((p) => Boolean(p.image_url));

  useEffect(() => {
    if (reducedMotion || frames.length === 0) return;
    const el = scrollRef.current;
    if (!el) return;

    const measure = () => {
      copyHeightRef.current = el.scrollHeight / 2;
    };
    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(el);

    const tick = (ts: number) => {
      rafRef.current = requestAnimationFrame(tick);
      if (lastTsRef.current === null) {
        lastTsRef.current = ts;
        return;
      }
      const dtSec = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      if (ts < pausedUntilRef.current) return;
      if (copyHeightRef.current <= 0) return;

      el.scrollTop += AUTO_SCROLL_SPEED_PX_PER_SEC * dtSec;
      if (el.scrollTop >= copyHeightRef.current) {
        el.scrollTop -= copyHeightRef.current;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      resizeObserver.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // frames.length is a stable proxy for "the deterministic slice
    // changed" — the actual frame identities don't reorder at runtime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, frames.length]);

  const pauseAutoScroll = () => {
    pausedUntilRef.current = performance.now() + RESUME_DELAY_MS;
  };

  const handleScroll = () => {
    // Also fires for our own rAF-driven scrollTop writes, which is fine
    // — it just re-arms a pause that's already in effect during those.
    // Real user scrolling is what this is actually here to catch.
    pauseAutoScroll();
  };

  if (frames.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="relative h-full w-full overflow-hidden"
      style={{
        maskImage: "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
      }}
    >
      <div
        ref={scrollRef}
        onWheel={pauseAutoScroll}
        onTouchStart={pauseAutoScroll}
        onPointerDown={pauseAutoScroll}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {[0, 1].map((copyIndex) => (
          <div key={copyIndex} className="flex flex-col gap-3 p-1">
            {frames.map((product, i) => (
              <div
                key={`${copyIndex}-${product.id}-${i}`}
                className="relative aspect-[4/5] w-full shrink-0 overflow-hidden rounded-2xl bg-[#F6F6F6]"
              >
                <Image
                  src={product.image_url}
                  alt=""
                  fill
                  draggable={false}
                  sizes="220px"
                  className="select-none object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
