"use client";

import type { PanInfo, MotionValue } from "framer-motion";
import { Poster } from "./Poster";
import type { RingLayoutConfig, RingSlot } from "./types";

export interface PosterRingProps {
  readonly slots: readonly RingSlot[];
  readonly config: RingLayoutConfig;
  readonly dragRotationDeg: MotionValue<number>;
  readonly reducedMotion: boolean;
  readonly canDrag: boolean;
  readonly onPanStart: () => void;
  readonly onPan: (event: PointerEvent, info: PanInfo) => void;
  readonly onPanEnd: (event: PointerEvent, info: PanInfo) => void;
}

export function PosterRing({
  slots,
  config,
  dragRotationDeg,
  reducedMotion,
  canDrag,
  onPanStart,
  onPan,
  onPanEnd,
}: PosterRingProps) {
  return (
    <div
      className="relative h-full w-full"
      style={{ perspective: reducedMotion ? undefined : `${config.perspectivePx}px` }}
    >
      <div
        className="relative h-full w-full"
        style={{
          transformStyle: reducedMotion ? undefined : "preserve-3d",
          transform: reducedMotion ? undefined : `rotateX(${config.tiltDeg}deg)`,
        }}
      >
        {slots.map((slot) => (
          <Poster
            key={slot.position}
            item={slot.item}
            offset={slot.offset}
            angleStepDeg={config.angleStepDeg}
            radiusPx={config.radiusPx}
            cardWidthPx={config.cardWidthPx}
            cardAspectRatio={config.cardAspectRatio}
            dragRotationDeg={dragRotationDeg}
            isFront={slot.offset === 0}
            lod={slot.lod}
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
