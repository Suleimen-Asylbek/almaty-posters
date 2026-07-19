"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "framer-motion";
import { cn } from "@/lib/utils";
import {
  DRAG_ROTATE_DIVISOR,
  REDUCED_MOTION_TRANSITION,
  SPRING_SETTLE,
} from "./constants";
import { getStackVisualStyle } from "./utils/stackMath";
import type { StackItem } from "./types";

export interface StackCardProps {
  readonly item: StackItem;
  readonly position: number;
  readonly reducedMotion: boolean;
  readonly isFront: boolean;
  readonly canDrag: boolean;
  readonly dragX: MotionValue<number>;
  readonly onDragStart?: () => void;
  readonly onDragEnd?: (event: PointerEvent, info: PanInfo) => void;
}

function StackCardImpl({
  item,
  position,
  reducedMotion,
  isFront,
  canDrag,
  dragX,
  onDragStart,
  onDragEnd,
}: StackCardProps) {
  const style = getStackVisualStyle(position, reducedMotion);

  const rotate = useTransform(
    dragX,
    (x) => (isFront ? x / DRAG_ROTATE_DIVISOR : 0),
  );

  const shouldUnoptimize = item.imageUrl.includes("placehold.co");

  return (
    <motion.div
      className="absolute inset-x-0 top-0 mx-auto"
      style={{
        zIndex: style.zIndex,
        filter:
          style.blurPx > 0.05
            ? `blur(${style.blurPx.toFixed(2)}px)`
            : "none",
        x: isFront ? dragX : undefined,
        rotate: isFront ? rotate : 0,
        pointerEvents: isFront ? "auto" : "none",
        willChange: "transform",
        touchAction: canDrag ? "pan-y" : undefined,
      }}
      animate={{ y: style.y, scale: style.scale, opacity: style.opacity }}
      transition={reducedMotion ? REDUCED_MOTION_TRANSITION : SPRING_SETTLE}
      drag={isFront && canDrag ? "x" : false}
      dragElastic={0.15}
      dragMomentum={false}
      onDragStart={isFront && canDrag ? onDragStart : undefined}
      onDragEnd={isFront && canDrag ? onDragEnd : undefined}
      aria-hidden={!isFront}
    >
      <Link
        href={`/product/${item.slug}`}
        tabIndex={isFront ? 0 : -1}
        draggable={false}
        className={cn(
          "group relative block aspect-[3/4] w-full overflow-hidden rounded-3xl border border-[#E8E8E8] bg-[#F6F6F6]",
          isFront
            ? "shadow-[0_32px_80px_-16px_rgba(0,0,0,0.15)] transition-shadow duration-300 hover:shadow-[0_40px_100px_-16px_rgba(0,0,0,0.2)]"
            : "shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)]",
        )}
        onClick={(e) => {
          if (!isFront) e.preventDefault();
        }}
      >
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          draggable={false}
          priority={isFront}
          loading={isFront ? "eager" : "lazy"}
          sizes="(max-width: 1024px) 70vw, 420px"
          className="select-none object-cover"
          unoptimized={shouldUnoptimize}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent px-5 pb-5 pt-16">
          <p className="text-sm font-bold leading-snug text-white drop-shadow">
            {item.title}
          </p>
          <p className="mt-1 text-xs font-medium text-white/80">{item.priceLabel}</p>
        </div>
      </Link>

    </motion.div>
  );
}

function propsAreEqual(prev: StackCardProps, next: StackCardProps): boolean {
  return (
    prev.item.id === next.item.id &&
    prev.item.title === next.item.title &&
    prev.item.imageUrl === next.item.imageUrl &&
    prev.item.priceLabel === next.item.priceLabel &&
    prev.item.slug === next.item.slug &&
    prev.position === next.position &&
    prev.reducedMotion === next.reducedMotion &&
    prev.isFront === next.isFront &&
    prev.canDrag === next.canDrag &&
    prev.dragX === next.dragX &&
    prev.onDragStart === next.onDragStart &&
    prev.onDragEnd === next.onDragEnd
  );
}

export const StackCard = memo(StackCardImpl, propsAreEqual);
StackCard.displayName = "StackCard";
