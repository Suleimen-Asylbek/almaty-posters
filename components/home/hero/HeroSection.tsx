import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Product } from "@/lib/types";
import { HeroStage } from "./HeroStage";
import { FilmStrip } from "./FilmStrip";
import { HeroBackground } from "./HeroBackground";

interface HeroSectionProps {
  products: Product[];
}

/**
 * Full-width viewport shape for the ring row. A single class string —
 * deliberately never combined with any other aspect-* class anywhere in
 * the tree (see HeroStage.tsx's viewportSizingClassName resolution) —
 * so there is no cascade ambiguity about which aspect-ratio actually
 * wins. Still a starting point, not a final number: pick it here, not
 * by hunting for an inline className in JSX.
 */
const HERO_STAGE_VIEWPORT_CLASS = "aspect-[16/10] sm:aspect-[21/9] lg:aspect-[3/1] max-w-none";

/**
 * Two-level Hero:
 *
 *  LEVEL 1 (first screen) — a two-column row: compact text on the left,
 *  a slow decorative FilmStrip on the right. Both exist to give the eye
 *  something to settle on for a second before the ring takes over below
 *  — neither is the main object.
 *
 *  LEVEL 2 — the 3D ring, full viewport width (a genuine `w-screen`
 *  breakout, not boxed in a max-width container) so its perspective
 *  reads correctly and it dominates the composition the way a single
 *  hero object should.
 *
 * HeroBackground spans both levels as one continuous layer so there's
 * no visible seam between "the text row" and "the ring row" — one
 * scene, not two stacked sections.
 */
export function HeroSection({ products }: HeroSectionProps) {
  return (
    <section className="relative pt-10 lg:pt-12 pb-16 lg:pb-24 bg-white overflow-hidden">
      <HeroBackground />

      {/* ── Уровень 1: текст + FilmStrip, первый экран ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-16 items-center">

          {/* Текст — компактный, один эмоциональный statement, один CTA. */}
          <div className="max-w-xl">

            <span className="text-xs font-semibold uppercase tracking-widest text-[#999999] block">
              Almaty Posters · Алматы, Казахстан
            </span>

            <h1 className="mt-3 text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight text-[#111111] leading-[1.05]">
              Искусство, которое меняет твою комнату
            </h1>

            <div className="mt-6">
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#111111] px-6 py-3.5 text-white transition hover:bg-black"
              >
                Выбрать постер
                <ArrowRight size={18} />
              </Link>
            </div>

          </div>

          {/* FilmStrip — вертикальная лента, атмосфера, не второй объект. */}
          <div className="hidden lg:block h-[420px]">
            <FilmStrip products={products} />
          </div>

        </div>
      </div>

      {/* ── Уровень 2: кольцо, full-bleed — 100% ширины экрана,
          не ограничено родительским max-width, чтобы perspective
          работала на полную ширину viewport. ── */}
      <div className="relative z-0 mt-10 lg:mt-16 w-screen left-1/2 -translate-x-1/2 px-4 sm:px-6">
        <HeroStage
          products={products}
          viewportClassName={HERO_STAGE_VIEWPORT_CLASS}
        />
      </div>

    </section>
  );
}
