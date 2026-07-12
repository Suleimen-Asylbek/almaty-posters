import type { Product } from "@/lib/types";

export type RingDirection = -1 | 1;
export type RingLOD = "front" | "back";

/**
 * Minimal, UI-only representation of a poster used by the ring.
 * Poster must never depend on Product, Supabase, or pricing
 * logic directly — HeroStage is the single Product -> UI mapping
 * boundary.
 */
export interface RingItem {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly imageUrl: string;
  readonly priceLabel: string;
}

/**
 * One rendered poster.
 *
 * `position` is a virtual ring position — one of a FIXED number of slots
 * evenly spaced around the circle (see RING_CAPACITY). It never changes
 * shape or count based on how many real items exist; it is the stable
 * identity used as the React key, so mount/unmount only happens at the
 * actual edge of the rendered window, never as a side effect of content
 * changing underneath a reused DOM node.
 *
 * `itemIndex` is which real item currently occupies that position (from
 * the anti-repeat sequence) — this is what can repeat when there are
 * fewer real items than ring positions.
 *
 * `offset` is the signed, shortest-path angular distance (in position
 * units, not degrees) from the active virtual position — recomputed only
 * when activeVirtualPosition commits, safe to close over as a plain
 * number inside a card's useTransform chain.
 */
export interface RingSlot {
  readonly position: number;
  readonly itemIndex: number;
  readonly offset: number;
  readonly item: RingItem;
  readonly lod: RingLOD;
}

export interface RingLayoutConfig {
  readonly angleStepDeg: number;
  readonly radiusPx: number;
  readonly frontHalfWindow: number;
  readonly backSampleCount: number;
  readonly perspectivePx: number;
  readonly tiltDeg: number;
  readonly cardWidthPx: number;
  readonly cardAspectRatio: number;
}

export interface HeroStageProps {
  readonly products: readonly Product[];
  readonly className?: string;
  /**
   * Extra classes merged onto the ring's own interactive viewport (the
   * element carrying `aspect-[4/5] max-w-xl` by default). HeroStage owns
   * how the ring renders; HeroSection owns Hero's composition — this is
   * the seam between them. Defaults to undefined so every existing call
   * site is visually unchanged unless it opts in.
   *
   * Structurally conflict-free, not merge-order-dependent: HeroStage
   * resolves a single `viewportSizingClassName` internally — either the
   * default `"aspect-[4/5] max-w-xl"` OR this prop, never both — before
   * that one value ever reaches `cn()`. This was previously implemented
   * by relying on `tailwind-merge` to dedupe a default `aspect-[4/5]`
   * against this prop's own `aspect-*` class when both were passed to
   * `cn()` together; that assumption was found to be unverified (there's
   * no guarantee tailwind-merge resolves conflicting *arbitrary-value*
   * `aspect-*` classes correctly) and was replaced. Do not reintroduce
   * a call site that passes both the default and this prop into the same
   * `cn()` call — see HeroStage.tsx's `viewportSizingClassName`.
   */
  readonly viewportClassName?: string;
}
