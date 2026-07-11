"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { clamp, getSlotVisualStyle } from "./stack.utils";
import type { DragEndInfo } from "./useStackPhysics";
import type { SlotOffset, StackCarouselItem } from "./stack.types";

export interface StackCardProps {
  readonly item: StackCarouselItem;
  readonly offset: SlotOffset;
  readonly hidden: boolean;
  readonly dragX: MotionValue<number>;
  readonly containerWidthRef: React.MutableRefObject<number>;
  readonly canDrag: boolean;
  readonly onDragStart: () => void;
  readonly onDragEnd: (
    event: PointerEvent | MouseEvent | TouchEvent,
    info: DragEndInfo,
  ) => void;
}

function StackCardImpl({
  item,
  offset,
  hidden,
  dragX,
  containerWidthRef,
  canDrag,
  onDragStart,
  onDragEnd,
}: StackCardProps) {
  const isTop = offset === 0;

  const progress = useTransform(dragX, (value) =>
    clamp(value / (containerWidthRef.current || 1), -1, 1),
  );
  const effectiveOffset = useTransform(progress, (p) => offset - p);

  const y = useTransform(effectiveOffset, (o) => getSlotVisualStyle(o).y);
  const scale = useTransform(effectiveOffset, (o) => getSlotVisualStyle(o).scale);
  const rotateZ = useTransform(effectiveOffset, (o) => getSlotVisualStyle(o).rotateZ);
  const rotateY = useTransform(effectiveOffset, (o) => getSlotVisualStyle(o).rotateY);
  const opacity = useTransform(effectiveOffset, (o) =>
    hidden ? 0 : getSlotVisualStyle(o).opacity,
  );
  const formulaX = useTransform(effectiveOffset, (o) => getSlotVisualStyle(o).x);
  const x = isTop ? dragX : formulaX;

  const { zIndex } = getSlotVisualStyle(offset);

  const imageLoadingProps = isTop
    ? { priority: true as const }
    : Math.abs(offset) === 1
      ? { priority: false as const, loading: "eager" as const }
      : { priority: false as const, loading: "lazy" as const };
  const shouldUnoptimize = typeof item.imageUrl === "string" && item.imageUrl.includes("placehold.co");

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        x,
        y,
        scale,
        rotateZ,
        rotateY,
        opacity,
        zIndex,
        willChange: "transform",
        backfaceVisibility: "hidden",
        transformStyle: "preserve-3d",
        pointerEvents: isTop && !hidden ? "auto" : "none",
        touchAction: isTop ? "pan-y" : undefined,
      }}
      drag={isTop && canDrag ? "x" : false}
      dragElastic={0.18}
      dragMomentum={false}
      onDragStart={isTop ? onDragStart : undefined}
      onDragEnd={isTop ? onDragEnd : undefined}
      aria-hidden={!isTop || hidden}
    >
      <Link
        href={`/product/${item.slug}`}
        tabIndex={isTop && !hidden ? 0 : -1}
        draggable={false}
        className="group relative block h-full w-full overflow-hidden rounded-3xl border border-[#E5E5E5] bg-[#F6F6F6] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)]"
        onClick={(event) => {
          if (!isTop) event.preventDefault();
        }}
      >
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          draggable={false}
          sizes="(max-width: 1024px) 90vw, 42vw"
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

function propsAreEqual(prev: StackCardProps, next: StackCardProps): boolean {
  return (
    prev.item.id === next.item.id &&
    prev.offset === next.offset &&
    prev.hidden === next.hidden &&
    prev.canDrag === next.canDrag &&
    prev.dragX === next.dragX &&
    prev.onDragStart === next.onDragStart &&
    prev.onDragEnd === next.onDragEnd
  );
}

export const StackCard = memo(StackCardImpl, propsAreEqual);
StackCard.displayName = "StackCard";
