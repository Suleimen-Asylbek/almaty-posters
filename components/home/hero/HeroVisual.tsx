"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import type { Product } from "@/lib/types";

interface HeroVisualProps {
  readonly products: readonly Product[];
}

/**
 * Reflection can look expensive-premium or can look like a stock Figma
 * template, depending entirely on the actual poster art. Defaulted off
 * after a Stage 2 design pass: with the hard frame removed (see below),
 * a reflection has nothing solid to reflect *off of* anymore, so it read
 * as a stray artifact rather than a surface cue. One constant so it can
 * be turned back on in a second if a future visual pass disagrees.
 */
const ENABLE_REFLECTION = false;

/**
 * Deliberately subtle — "if the user doesn't consciously notice the
 * effect, it's correct". 2.5° / a fraction of the frame's own size is
 * closer to "this feels solid, not flat" than to "the image is chasing
 * my cursor".
 */
const MAX_TILT_DEG = 2.5;

/**
 * Purely decorative right-side Hero atmosphere — one large, soft-edged
 * poster image with real depth cues instead of a Dribbble-style card
 * stack: ambient glow, an optional soft reflection, and a very subtle
 * mouse-parallax tilt. No drag, no navigation state, no shared code with
 * HeroStage/PosterRing — the parallax here is local to this component
 * and unrelated to the ring's own physics.
 *
 * The featured poster is the first item in `products` (deterministic —
 * same on server and client, same across refreshes), not cycled — a
 * premium hero shouldn't keep living its own life next to the ring; see
 * the earlier design review for why a recurring crossfade was dropped in
 * favor of this.
 *
 * Stage 2 design pass: this used to be a full "glass card" — hard
 * rounded border, backdrop blur, drop shadow, a continuous float-in-place
 * loop, and a mirror reflection underneath. On a real screen next to the
 * ring, that read as a second, fully-formed product photo competing with
 * it — two framed objects side by side, two independent motion sources
 * (the card bobbing, the ring turning). A Hero can have exactly one main
 * object; this one lost that competition on purpose:
 *  - the hard frame (border/bg/backdrop-blur/shadow) is gone — the image
 *    itself fades out at its own edges via a mask, so there's no crisp
 *    rectangle for the eye to register as "a second thing here";
 *  - the continuous float loop is gone — the ring is now the only thing
 *    in Hero that moves on its own; a static image can't compete with it
 *    for peripheral-motion attention;
 *  - reflection is off by default (see ENABLE_REFLECTION above) — it was
 *    the strongest "product photography" cue of all, and there's no
 *    hard frame left for it to visually sit under anyway;
 *  - the footprint is smaller (`max-w-xs` vs. the previous `max-w-md`).
 *
 * What's left is intentionally closer to "a soft shape of light and
 * color that happens to be a poster" than to "a poster on a stand".
 *
 * prefers-reduced-motion: the parallax tilt is skipped — the poster
 * renders fully static, matching how HeroStage treats the same
 * preference.
 */
export function HeroVisual({ products }: HeroVisualProps) {
  const reducedMotion = useReducedMotion();

  // Deterministic — the same product every render, on server and client.
  // Math.random() here would pick a different poster on the server than
  // on the client (hydration mismatch), and a different one on every
  // refresh, making the composition impossible to control. `products` is
  // already the featured list in its intended display order; the first
  // entry is the one meant to lead.
  const front = products[0];

  // Mouse-parallax tilt — local motion values, nothing shared with the
  // ring's own MotionValue-driven rotation. Kept deliberately small (see
  // MAX_TILT_DEG) and heavily damped so it reads as weight, not tracking.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 120, damping: 26 });
  const springY = useSpring(pointerY, { stiffness: 120, damping: 26 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [MAX_TILT_DEG, -MAX_TILT_DEG]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-MAX_TILT_DEG, MAX_TILT_DEG]);

  const frameRef = useRef<HTMLDivElement | null>(null);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  if (!front) return null;

  return (
    <div className="relative mx-auto w-full max-w-xs" style={{ perspective: 1200 }}>
      {/* Ambient glow — should be felt, not seen; if it's noticeable at
          a glance, it's too strong. */}
      <div
        aria-hidden
        className="absolute inset-[-16%] -z-10 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, #EADFCB 0%, #E7ECF1 45%, transparent 75%)",
        }}
      />

      <div
        ref={frameRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative aspect-[4/5] w-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* The poster itself, no card underneath it — no border, no
            background fill, no backdrop blur, no drop shadow. A radial
            mask fades the image out at its own edges, so there's no
            crisp rectangle for the eye to register as a second framed
            object next to the ring. Static (no float loop) — the ring
            is Hero's one moving object. */}
        <motion.div
          className="absolute inset-0 overflow-hidden rounded-[28px]"
          style={{
            rotateX: reducedMotion ? 0 : rotateX,
            rotateY: reducedMotion ? 0 : rotateY,
            maskImage: "radial-gradient(ellipse 78% 82% at 50% 50%, black 55%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 78% 82% at 50% 50%, black 55%, transparent 100%)",
          }}
        >
          <Image
            src={front.image_url}
            alt={front.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 40vw, 320px"
          />
        </motion.div>
      </div>

      {/* Reflection — off by default, see ENABLE_REFLECTION above. */}
      {ENABLE_REFLECTION && (
        <div
          aria-hidden
          className="relative mt-2 h-20 w-full overflow-hidden rounded-2xl opacity-[0.1]"
          style={{
            maskImage: "linear-gradient(to bottom, black, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
          }}
        >
          <Image
            src={front.image_url}
            alt=""
            fill
            className="scale-y-[-1] object-cover"
            sizes="320px"
          />
        </div>
      )}
    </div>
  );
}
