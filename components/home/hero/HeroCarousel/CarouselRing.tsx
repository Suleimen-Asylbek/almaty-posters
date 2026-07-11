"use client";

import type { PanInfo, MotionValue } from "framer-motion";
import { CarouselPoster } from "./CarouselPoster";
import type { RingLayoutConfig, RingSlot } from "./types";

export interface CarouselRingProps {
  readonly slots: readonly RingSlot[];
  readonly config: RingLayoutConfig;
  readonly dragRotationDeg: MotionValue<number>;
  readonly reducedMotion: boolean;
  readonly canDrag: boolean;
  readonly onPanStart: () => void;
  readonly onPan: (event: PointerEvent, info: PanInfo) => void;
  readonly onPanEnd: (event: PointerEvent, info: PanInfo) => void;
}

export function CarouselRing({
  slots,
  config,
  dragRotationDeg,
  reducedMotion,
  canDrag,
  onPanStart,
  onPan,
  onPanEnd,
}: CarouselRingProps) {
  return (
    <div
      className="relative h-full w-full"
      style={{ perspective: reducedMotion ? undefined : config.perspectivePx }}
    >
      <div
        className="relative h-full w-full"
        style={{
          transformStyle: reducedMotion ? undefined : "preserve-3d",
          transform: reducedMotion ? undefined : `rotateX(${config.tiltDeg}deg)`,
        }}
      >
        {slots.map((slot) => (
          <CarouselPoster
            key={slot.itemIndex}
            item={slot.item}
            offset={slot.offset}
            angleStepDeg={config.angleStepDeg}
            radiusPx={config.radiusPx}
            cardWidthPx={config.cardWidthPx}
            cardAspectRatio={config.cardAspectRatio}
            dragRotationDeg={dragRotationDeg}
            isFront={slot.offset === 0}
            reducedMotion={reducedMotion}
            canDrag={canDrag}
            onPanStart={onPanStart}
            onPan={onPan}
            onPanEnd={onPanEnd}
          />
        ))}
      </div>
    </div>
  );
}
