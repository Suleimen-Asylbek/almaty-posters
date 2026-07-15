import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Product } from "@/lib/types";
import { HeroStage } from "./HeroStage";
import { HeroBackground } from "./HeroBackground";

interface HeroSectionProps {
  products: Product[];
}

export function HeroSection({ products }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-white pb-12 pt-8 lg:pb-20 lg:pt-14">
      <HeroBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {/* Two-column grid: text left, carousel right */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_420px] lg:gap-16 xl:grid-cols-[1fr_460px]">

          {/* ── Text block ── */}
          <div className="max-w-lg">
            <span className="block text-xs font-semibold uppercase tracking-widest text-[#999999]">
              Almaty Posters · Алматы
            </span>

            <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight text-[#111111] sm:text-5xl lg:text-[3.25rem]">
              Искусство,{" "}
              <span className="text-[#111111]">которое меняет</span>{" "}
              твою комнату
            </h1>

            <p className="mt-5 text-base leading-relaxed text-[#555555] sm:text-lg">
              Постеры на заказ из Алматы. Выбери готовый или пришли
              свой дизайн — напечатаем и доставим.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 rounded-xl bg-[#111111] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-black active:scale-95"
              >
                Смотреть постеры
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-xl border border-[#E5E5E5] bg-white px-6 py-3.5 text-sm font-semibold text-[#111111] transition hover:border-[#CCCCCC] active:scale-95"
              >
                О нас
              </Link>
            </div>

            {/* Subtle social proof */}
            <div className="mt-8 flex items-center gap-6 border-t border-[#F0F0F0] pt-6">
              <div>
                <p className="text-xl font-black text-[#111111]">100+</p>
                <p className="text-xs text-[#999999]">постеров в каталоге</p>
              </div>
              <div className="h-8 w-px bg-[#EBEBEB]" />
              <div>
                <p className="text-xl font-black text-[#111111]">3 размера</p>
                <p className="text-xs text-[#999999]">30×40, 40×50, 50×70</p>
              </div>
              <div className="h-8 w-px bg-[#EBEBEB]" />
              <div>
                <p className="text-xl font-black text-[#111111]">Алматы</p>
                <p className="text-xs text-[#999999]">печать и доставка</p>
              </div>
            </div>
          </div>

          {/* ── Carousel ── */}
          <div className="w-full">
            <HeroStage products={products} />
          </div>

        </div>
      </div>
    </section>
  );
}
