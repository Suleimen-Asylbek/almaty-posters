/**
 * Decorative depth layer for Hero — spans the whole section (both
 * the text/visual row and the ring row) as one continuous background, so
 * the two rows read as one composition instead of "section, then another
 * section". Light-themed, per the brand's white/light design goal.
 *
 * 100% CSS, deliberately:
 *  - no SVG;
 *  - no canvas;
 *  - no CSS `filter`.
 *
 * Three stacked layer groups, all aria-hidden, all decorative:
 *  1. mesh — two soft, large radial-gradient blobs in brand-adjacent
 *     warm/cool tints, blurred until they read as a gradient mesh rather
 *     than distinct shapes.
 *  2. grain — a small pre-baked grayscale noise tile
 *     (`/public/hero-noise.png`, 64×64, generated once and committed)
 *     repeated as a plain `background-image` at very low opacity.
 *  3. vignette — an extremely subtle radial darkening at the very edges
 *     only, not a heavy black-corners vignette.
 */
export function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Mesh */}
      <div
        className="absolute -top-1/4 -left-1/4 h-[70%] w-[60%] rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle, #F3E8DA 0%, transparent 70%)" }}
      />
      <div
        className="absolute -top-1/3 right-0 h-[65%] w-[55%] rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, #E9EEF3 0%, transparent 70%)" }}
      />

      {/* Grain — static PNG tile, plain background-image */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-multiply"
        style={{ backgroundImage: "url(/hero-noise.png)", backgroundRepeat: "repeat" }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(17,17,17,0.035) 100%)",
        }}
      />
    </div>
  );
}
