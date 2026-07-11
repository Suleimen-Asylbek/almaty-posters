"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";
import {
  buildRingSequence,
  computeCardStyle,
  computeDebugInfo,
  getAngleStepDeg,
  getWindowedPositions,
  RING_CAPACITY,
  CARD_ASPECT_RATIO,
  type RingLabParams,
} from "./ringLabMath";

const PLACEHOLDER_COLORS = [
  "1D9E75",
  "D85A30",
  "D4537E",
  "378ADD",
  "639922",
  "BA7517",
  "534AB7",
  "5F5E5A",
];

function placeholderUrl(
  index: number,
  widthPx: number,
  heightPx: number,
): string {
  const bg = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length];
  const w = Math.round(widthPx);
  const h = Math.round(heightPx);
  return `https://placehold.co/${w}x${h}/${bg}/ffffff?text=Poster+${index + 1}`;
}

export interface RingSceneProps {
  readonly params: RingLabParams;
  readonly posterCount: number;
  readonly showDebugOverlay: boolean;
  readonly label?: string;
  readonly hideChrome?: boolean;
  readonly onRenderTick?: (renderCount: number) => void;
}

export function RingScene({
  params,
  posterCount,
  showDebugOverlay,
  label,
  hideChrome,
  onRenderTick,
}: RingSceneProps) {
  const rotationRef = useRef(0);
  const cardRefs = useRef(new Map<number, HTMLDivElement>());
  const debugRefs = useRef(new Map<number, HTMLDivElement>());
  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({ dragging: false, startX: 0, startRotation: 0 });
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  useEffect(() => {
    onRenderTick?.(renderCountRef.current);
  }, []);

  const sequence = useMemo(
    () => buildRingSequence(posterCount, RING_CAPACITY),
    [posterCount],
  );
  const windowed = useMemo(
    () => getWindowedPositions(params.visibleBackCards),
    [params.visibleBackCards],
  );
  const angleStepDeg = useMemo(() => getAngleStepDeg(params), [params]);
  const cardHeightPx = params.cardWidthPx * CARD_ASPECT_RATIO;

  const applyTransforms = useCallback(() => {
    for (const { position, lod } of windowed) {
      const el = cardRefs.current.get(position);
      if (el) {
        const style = computeCardStyle(position, rotationRef.current, params);
        el.style.transform = style.transform;
        el.style.opacity = String(style.opacity);
        el.style.filter = style.filter;
        el.style.zIndex = String(style.zIndex);
      }

      if (showDebugOverlay) {
        const debugEl = debugRefs.current.get(position);
        if (debugEl) {
          const info = computeDebugInfo(
            position,
            rotationRef.current,
            params,
            lod,
          );
          debugEl.style.transform = `rotateY(${-info.thetaDeg}deg)`;
          debugEl.textContent =
            `θ ${info.thetaDeg.toFixed(0)}°  z ${Math.round(info.depthZ)}  ` +
            `zi ${info.zIndex}  x≈${Math.round(info.approxScreenX)}  ${info.lod}` +
            (Math.abs(info.thetaDeg) < angleStepDeg / 2 ? "  FRONT" : "");
        }
      }
    }
  }, [windowed, params, showDebugOverlay, angleStepDeg]);

  useEffect(() => {
    applyTransforms();
  });

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      dragStateRef.current = {
        dragging: true,
        startX: event.clientX,
        startRotation: rotationRef.current,
      };
      stageRef.current?.setPointerCapture(event.pointerId);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragStateRef.current.dragging) return;
      const dx = event.clientX - dragStateRef.current.startX;
      rotationRef.current = dragStateRef.current.startRotation + dx * 0.22;
      applyTransforms();
    },
    [applyTransforms],
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      dragStateRef.current.dragging = false;
      stageRef.current?.releasePointerCapture(event.pointerId);
    },
    [],
  );

  const ambientLightness = 96 + params.ambientIntensity * 3;

  return (
    <div
      ref={stageRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        cursor: "grab",
        touchAction: "pan-y",
        perspective: `${params.perspectivePx}px`,
        background: `radial-gradient(ellipse 70% 60% at 50% 42%, hsl(0 0% ${ambientLightness}%) 0%, hsl(0 0% ${ambientLightness - 3}%) 100%)`,
        overflow: "hidden",
        borderRadius: hideChrome ? 0 : 12,
        border: hideChrome ? "none" : "1px solid #E5E5E5",
      }}
    >
      {/* Top light: soft brightening from above, distinct from ambient —
          simulates an overhead source rather than uniform fill light. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to bottom, rgba(255,255,255,${params.topLightIntensity * 0.5}) 0%, rgba(255,255,255,0) 45%)`,
          pointerEvents: "none",
        }}
      />

      {/* Floor shadow: static, never rotates with the ring. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          top: "68%",
          width: params.radiusPx * 2.4,
          height: params.radiusPx * 0.5,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(ellipse closest-side, rgba(0,0,0,${params.floorShadowOpacity}) 0%, rgba(0,0,0,0) 72%)`,
          pointerEvents: "none",
        }}
      />

      {/* Vignette */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 75% 75% at 50% 50%, transparent 55%, rgba(0,0,0,${params.vignetteIntensity * 0.35}) 100%)`,
          pointerEvents: "none",
        }}
      />

      {!hideChrome && label && (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            fontSize: 12,
            fontWeight: 600,
            color: "#111111",
            background: "rgba(255,255,255,0.85)",
            padding: "3px 8px",
            borderRadius: 6,
            zIndex: 2000,
          }}
        >
          {label}
        </div>
      )}

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: `calc(50% + ${params.verticalOffsetPx}px)`,
          transformStyle: "preserve-3d",
          transform: `translate(-50%, -50%) rotateX(${params.tiltDeg}deg)`,
        }}
      >
        {windowed.map(({ position }) => {
          const itemIndex =
            sequence[position % Math.max(sequence.length, 1)] ?? 0;
          const isFront = position === 0;
          const imageSrc = placeholderUrl(
            itemIndex,
            params.cardWidthPx,
            cardHeightPx,
          );
          const shouldUnoptimize = imageSrc.includes("placehold.co");
          return (
            <div
              key={position}
              ref={(node) => {
                if (node) cardRefs.current.set(position, node);
                else cardRefs.current.delete(position);
              }}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: params.cardWidthPx,
                height: cardHeightPx,
                marginLeft: -params.cardWidthPx / 2,
                marginTop: -cardHeightPx / 2,
                borderRadius: 16,
                overflow: "hidden",
                backfaceVisibility: "visible",
                boxShadow: isFront
                  ? `0 20px 60px -20px rgba(0,0,0,0.35), 0 0 0 ${1 + params.rimLightIntensity * 3}px rgba(255,255,255,${params.rimLightIntensity})`
                  : "0 20px 60px -20px rgba(0,0,0,0.35)",
              }}
            >
              <Image
                src={imageSrc}
                alt={`Test poster ${itemIndex + 1}`}
                fill
                sizes="480px"
                style={{ objectFit: "cover" }}
                unoptimized={shouldUnoptimize}
              />

              {showDebugOverlay && (
                <div
                  ref={(node) => {
                    if (node) debugRefs.current.set(position, node);
                    else debugRefs.current.delete(position);
                  }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    fontSize: 10,
                    fontFamily: "monospace",
                    color: "#ffffff",
                    background: "rgba(0,0,0,0.45)",
                    padding: 4,
                    lineHeight: 1.4,
                    whiteSpace: "pre-wrap",
                    pointerEvents: "none",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {!hideChrome && (
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 10,
            fontSize: 11,
            color: "#666666",
            fontFamily: "monospace",
            lineHeight: 1.5,
            zIndex: 2000,
          }}
        >
          <div>
            posters: {posterCount} / mounted: {windowed.length}
          </div>
          <div>
            LOD front: {windowed.filter((w) => w.lod === "front").length} /
            back: {windowed.filter((w) => w.lod === "back").length}
          </div>
          <div>
            angleStep: {angleStepDeg.toFixed(2)}° / radius:{" "}
            {Math.round(params.radiusPx)}px
          </div>
          <div>renders: {renderCountRef.current}</div>
        </div>
      )}
    </div>
  );
}


