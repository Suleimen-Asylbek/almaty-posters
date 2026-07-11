"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useTransform, type MotionValue, type PanInfo } from "framer-motion";
import { getRingVisualStyle } from "./utils/carouselMath";
import type { RingItem, RingLOD } from "./types";

export interface PosterProps {
  readonly item: RingItem;
  /** Signed offset from the active virtual position (0 = front).
   * Recomputed on commit, not per frame — safe to close over as a plain
   * number. */
  readonly offset: number;
  readonly angleStepDeg: number;
  readonly radiusPx: number;
  readonly cardWidthPx: number;
  readonly cardAspectRatio: number;
  readonly dragRotationDeg: MotionValue<number>;
  readonly isFront: boolean;
  /** front = dense/interactive zone, back = sparse/decorative zone (see
   * getLODWindowedSlots). Back-zone cards never receive interaction or
   * a11y focus, regardless of offset. */
  readonly lod: RingLOD;
  readonly reducedMotion: boolean;
  readonly canDrag: boolean;
  readonly onPanStart: () => void;
  readonly onPan: (event: PointerEvent, info: PanInfo) => void;
  readonly onPanEnd: (event: PointerEvent, info: PanInfo) => void;
}

function PosterImpl({
  item,
  offset,
  angleStepDeg,
  radiusPx,
  cardWidthPx,
  cardAspectRatio,
  dragRotationDeg,
  isFront,
  lod,
  reducedMotion,
  canDrag,
  onPanStart,
  onPan,
  onPanEnd,
}: PosterProps) {
  // theta_i = offset_i * angleStep - dragRotationDeg. Every card —
  // including the front one — shares this exact formula and the exact
  // same dragRotationDeg domain (degrees). There is no special-cased
  // "top card" tracking raw pixels on a different scale, which is what
  // produced a visible jump in an earlier flat-stack implementation the
  // instant activeIndex changed mid-gesture.
  const theta = useTransform(dragRotationDeg, (raw) => offset * angleStepDeg - raw);

  const scale = useTransform(theta, (t) => getRingVisualStyle(t).scale);
  const opacity = useTransform(theta, (t) => getRingVisualStyle(t).opacity);
  const blurPx = useTransform(theta, (t) => getRingVisualStyle(t).blurPx);
  const zIndex = useTransform(theta, (t) => getRingVisualStyle(t).zIndex);
  const filter = useTransform(blurPx, (b) => (b > 0.05 ? `blur(${b.toFixed(2)}px)` : "none"));

  // Reduced motion: flat, no perspective — a simple horizontal cross-fade
  // driven by the same offset, no 3D math, no drag gesture at all (nav
  // stays available via buttons/keyboard/pagination).
  const flatX = useTransform(theta, (t) => (cardWidthPx * 0.18 * t) / angleStepDeg);

  const cardHeightPx = cardWidthPx / cardAspectRatio;

  const imageLoadingProps = isFront
    ? { priority: true as const }
    : lod === "front"
      ? { priority: false as const, loading: "eager" as const }
      : { priority: false as const, loading: "lazy" as const };

  const isInteractive = isFront && lod === "front";
  const shouldUnoptimize = typeof item.imageUrl === "string" && item.imageUrl.includes("placehold.co");

  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{
        width: cardWidthPx,
        height: cardHeightPx,
        marginLeft: -cardWidthPx / 2,
        marginTop: -cardHeightPx / 2,
        opacity: reducedMotion ? undefined : opacity,
        zIndex: reducedMotion ? (isFront ? 2 : 1) : zIndex,
        filter: reducedMotion ? undefined : filter,
        willChange: "transform",
        backfaceVisibility: "hidden",
        pointerEvents: isInteractive ? "auto" : "none",
        touchAction: canDrag ? "pan-y" : undefined,
        transitionProperty: reducedMotion ? "opacity, transform" : "none",
        transitionDuration: reducedMotion ? "200ms" : undefined,
        transitionTimingFunction: reducedMotion ? "ease-out" : undefined,
        x: reducedMotion ? flatX : undefined,
        rotateY: reducedMotion ? undefined : theta,
        translateZ: reducedMotion ? undefined : radiusPx,
        scale: reducedMotion ? (isFront ? 1 : 0.92) : scale,
      }}
      onPanStart={isInteractive && canDrag ? onPanStart : undefined}
      onPan={isInteractive && canDrag ? onPan : undefined}
      onPanEnd={isInteractive && canDrag ? onPanEnd : undefined}
      aria-hidden={!isInteractive}
    >
      <Link
        href={`/product/${item.slug}`}
        tabIndex={isInteractive ? 0 : -1}
        draggable={false}
        className="group relative block h-full w-full overflow-hidden rounded-3xl border border-[#E5E5E5] bg-[#F6F6F6] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)]"
        onClick={(event) => {
          if (!isInteractive) event.preventDefault();
        }}
      >
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          draggable={false}
          sizes="(max-width: 1024px) 60vw, 30vw"
          className="select-none object-cover"
          unoptimized={shouldUnoptimize}
          {...imageLoadingProps}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent p-6">
          <p className="text-sm font-semibold text-white drop-shadow-sm">
            {item.title}
          </p>
          <p className="mt-1 text-xs text-white/80">{item.priceLabel}</p>
        </div>
      </Link>
    </motion.div>
  );
}

function propsAreEqual(prev: PosterProps, next: PosterProps): boolean {
  return (
    prev.item.id === next.item.id &&
    prev.item.title === next.item.title &&
    prev.item.imageUrl === next.item.imageUrl &&
    prev.item.priceLabel === next.item.priceLabel &&
    prev.item.slug === next.item.slug &&
    prev.offset === next.offset &&
    prev.angleStepDeg === next.angleStepDeg &&
    prev.radiusPx === next.radiusPx &&
    prev.cardWidthPx === next.cardWidthPx &&
    prev.cardAspectRatio === next.cardAspectRatio &&
    prev.isFront === next.isFront &&
    prev.lod === next.lod &&
    prev.reducedMotion === next.reducedMotion &&
    prev.canDrag === next.canDrag &&
    prev.dragRotationDeg === next.dragRotationDeg &&
    prev.onPanStart === next.onPanStart &&
    prev.onPan === next.onPan &&
    prev.onPanEnd === next.onPanEnd
  );
}

export const Poster = memo(PosterImpl, propsAreEqual);
Poster.displayName = "Poster";
