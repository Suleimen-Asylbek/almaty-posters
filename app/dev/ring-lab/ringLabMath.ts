export interface RingLabParams {
  radiusPx: number;
  perspectivePx: number;
  tiltDeg: number;
  frontLiftPx: number;
  verticalOffsetPx: number;
  cardWidthPx: number;
  spacingMul: number;
  visibleBackCards: number;
  maxBlurPx: number;
  minOpacity: number;
  minScale: number;
  vignetteIntensity: number;
  floorShadowOpacity: number;
  ambientIntensity: number;
  topLightIntensity: number;
  rimLightIntensity: number;
}

/**
 * Corrected starting point (not a final answer) based on the first-pass
 * review: the previous defaults (perspective 4000, tilt 1deg, radius 582,
 * lift 118) were mathematically valid but produced weak perspective —
 * distance between ring positions barely affected screen position, which
 * reads as a flat fan rather than a cylinder. These values put the ring
 * back in a range where depth is actually perceptible; they are a better
 * starting point for iteration, not a claim that the geometry is "done."
 */
export const DEFAULT_PARAMS: RingLabParams = {
  radiusPx: 340,
  perspectivePx: 1300,
  tiltDeg: 10,
  frontLiftPx: 40,
  verticalOffsetPx: 0,
  cardWidthPx: 220,
  spacingMul: 1,
  visibleBackCards: 6,
  maxBlurPx: 3,
  minOpacity: 0,
  minScale: 0.42,
  vignetteIntensity: 0.35,
  floorShadowOpacity: 0.18,
  ambientIntensity: 0.5,
  topLightIntensity: 0.25,
  rimLightIntensity: 0.2,
};

export interface CameraPresetQuickSelect {
  readonly label: string;
  readonly params: Partial<RingLabParams>;
}

/**
 * Starting points per device class, not final tuned values — same
 * reasoning as DEFAULT_PARAMS above, just varied by the amount of screen
 * real estate available. Meant to save re-discovering "weak perspective"
 * from scratch on each breakpoint; still needs visual iteration per case.
 */
export const CAMERA_PRESET_QUICK_SELECT: readonly CameraPresetQuickSelect[] = [
  {
    label: "Desktop",
    params: { radiusPx: 340, perspectivePx: 1300, tiltDeg: 10, frontLiftPx: 40, cardWidthPx: 220 },
  },
  {
    label: "Tablet",
    params: { radiusPx: 260, perspectivePx: 1100, tiltDeg: 9, frontLiftPx: 32, cardWidthPx: 170 },
  },
  {
    label: "Mobile portrait",
    params: { radiusPx: 170, perspectivePx: 900, tiltDeg: 7, frontLiftPx: 22, cardWidthPx: 140 },
  },
  {
    label: "Mobile landscape",
    params: { radiusPx: 220, perspectivePx: 1000, tiltDeg: 8, frontLiftPx: 26, cardWidthPx: 150 },
  },
];

export const RING_CAPACITY = 24;
export const CARD_ASPECT_RATIO = 1.35;

/**
 * Distributes `count` items across RING_CAPACITY ring positions so that no
 * two adjacent positions (including the wrap-around seam) hold the same
 * item, using a greedy max-remaining-count scheduler. When count >=
 * capacity, items map 1:1 (mod count) and no repetition occurs at all.
 */
export function buildRingSequence(count: number, capacity: number): number[] {
  if (count <= 0 || capacity <= 0) return [];
  if (count >= capacity) {
    return Array.from({ length: capacity }, (_, i) => i % count);
  }

  const remaining = Array.from({ length: count }, (_, id) => ({
    id,
    remaining: Math.ceil(capacity / count),
  }));

  let total = remaining.reduce((sum, item) => sum + item.remaining, 0);
  let cursor = 0;
  while (total > capacity) {
    remaining[cursor % count].remaining -= 1;
    total -= 1;
    cursor += 1;
  }

  const sequence: number[] = [];
  let last = -1;

  for (let step = 0; step < capacity; step += 1) {
    remaining.sort((a, b) => b.remaining - a.remaining);
    const pick =
      remaining.find((item) => item.id !== last && item.remaining > 0) ??
      remaining.find((item) => item.remaining > 0);
    if (!pick) break;
    pick.remaining -= 1;
    sequence.push(pick.id);
    last = pick.id;
  }

  if (sequence.length > 1 && sequence[sequence.length - 1] === sequence[0]) {
    for (let i = 1; i < sequence.length - 1; i += 1) {
      if (
        sequence[i] !== sequence[0] &&
        sequence[i] !== sequence[sequence.length - 1] &&
        sequence[i - 1] !== sequence[sequence.length - 1]
      ) {
        const tmp = sequence[i];
        sequence[i] = sequence[sequence.length - 1];
        sequence[sequence.length - 1] = tmp;
        break;
      }
    }
  }

  return sequence;
}

export function normalizeAngle(deg: number): number {
  const wrapped = (((deg + 180) % 360) + 360) % 360 - 180;
  return wrapped === -180 ? 180 : wrapped;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export interface RingCardStyle {
  transform: string;
  opacity: number;
  filter: string;
  zIndex: number;
}

export function getAngleStepDeg(params: RingLabParams): number {
  return (360 / RING_CAPACITY) * params.spacingMul;
}

export function computeCardStyle(position: number, rotationDeg: number, params: RingLabParams): RingCardStyle {
  const angleStep = getAngleStepDeg(params);
  const theta = normalizeAngle(position * angleStep - rotationDeg);
  const ratio = clamp(Math.abs(theta) / 180, 0, 1);

  const scale = 1 - ratio * (1 - params.minScale);
  const opacity = clamp(1 - ratio * (1 - params.minOpacity), params.minOpacity, 1);
  const blurPx = ratio <= 0.22 ? 0 : ((ratio - 0.22) / 0.78) * params.maxBlurPx;
  const isFront = Math.abs(theta) < angleStep / 2;
  const lift = isFront ? params.frontLiftPx : 0;
  const zIndex = Math.round(1000 - ratio * 1000);

  return {
    transform: `rotateY(${theta}deg) translateZ(${params.radiusPx + lift}px) scale(${scale.toFixed(4)})`,
    opacity,
    filter: blurPx > 0.05 ? `blur(${blurPx.toFixed(2)}px)` : "none",
    zIndex,
  };
}

/**
 * Windowing: a fixed front half of the ring is always mounted; the
 * remaining far positions are sparsely sampled, count controlled by
 * `visibleBackCards` (0 = only the front half is mounted at all).
 */
export interface WindowedPosition {
  readonly position: number;
  readonly lod: "front" | "back";
}

export function getWindowedPositions(visibleBackCards: number): WindowedPosition[] {
  const frontHalf = Math.floor(RING_CAPACITY / 4);
  const front = new Set<number>();
  for (let offset = -frontHalf; offset <= frontHalf; offset += 1) {
    front.add(((offset % RING_CAPACITY) + RING_CAPACITY) % RING_CAPACITY);
  }

  const remainingCount = Math.max(0, RING_CAPACITY - front.size);
  const sampleCount = Math.min(visibleBackCards, remainingCount);
  const back = new Set<number>();

  if (sampleCount > 0) {
    const step = RING_CAPACITY / sampleCount;
    for (let i = 0; i < sampleCount; i += 1) {
      let candidate = Math.round(i * step);
      let guard = 0;
      while (front.has(candidate) || back.has(candidate)) {
        candidate = (candidate + 1) % RING_CAPACITY;
        guard += 1;
        if (guard > RING_CAPACITY) break;
      }
      if (!front.has(candidate)) back.add(candidate);
    }
  }

  const result: WindowedPosition[] = [
    ...[...front].map((position) => ({ position, lod: "front" as const })),
    ...[...back].map((position) => ({ position, lod: "back" as const })),
  ];

  return result.sort((a, b) => a.position - b.position);
}

export interface RingCardDebugInfo {
  readonly thetaDeg: number;
  readonly depthZ: number;
  readonly zIndex: number;
  readonly approxScreenX: number;
  readonly lod: "front" | "back";
}

/**
 * Debug-only figures for the overlay — not used to render the card itself
 * (that's computeCardStyle, driven by real CSS 3D transforms). approxScreenX
 * is a manual perspective-divide approximation purely for the readout;
 * the actual on-screen position is whatever the browser's real 3D
 * pipeline produces from rotateY/translateZ, which this does not replace.
 */
export function computeDebugInfo(
  position: number,
  rotationDeg: number,
  params: RingLabParams,
  lod: "front" | "back",
): RingCardDebugInfo {
  const angleStep = getAngleStepDeg(params);
  const theta = normalizeAngle(position * angleStep - rotationDeg);
  const thetaRad = (theta * Math.PI) / 180;
  const isFrontByAngle = Math.abs(theta) < angleStep / 2;
  const depthZ = (params.radiusPx + (isFrontByAngle ? params.frontLiftPx : 0)) * Math.cos(thetaRad);
  const approxScreenX =
    (params.radiusPx * Math.sin(thetaRad) * params.perspectivePx) / (params.perspectivePx - depthZ);
  const ratio = clamp(Math.abs(theta) / 180, 0, 1);
  const zIndex = Math.round(1000 - ratio * 1000);

  return {
    thetaDeg: theta,
    depthZ,
    zIndex,
    approxScreenX,
    lod,
  };
}
