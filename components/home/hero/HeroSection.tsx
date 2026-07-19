import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

import type { Product } from "@/lib/types";
import { HeroStage } from "./HeroStage";
import { HeroBackground } from "./HeroBackground";

interface HeroSectionProps {
  products: Product[];
}

export function HeroSection({ products }: HeroSectionProps) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '77077124221';

  return (
    <section className="relative overflow-hidden bg-white pt-12 pb-18 lg:pt-18 lg:pb-28">
      <HeroBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[1fr_460px] lg:gap-20">

          <div className="max-w-xl">
            <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#999999] mb-6">
              Almaty Posters · Алматы
            </span>

            <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tighter text-[#111111] sm:text-6xl lg:text-[3.25rem]">
              Искусство,{" "}
              <span className="text-[#F97316]">которое меняет</span>{" "}
              твою комнату
            </h1>

            <p className="mt-8 text-lg leading-relaxed text-[#555555] max-w-md">
              Постеры на заказ из Алматы. Выбери готовый из нашего кураторского каталога или пришли свой дизайн.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#111111] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-black active:scale-[0.98]"
              >
                Смотреть каталог
                <ArrowRight size={16} />
              </Link>
              <a
                href={`https://wa.me/${phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E5E5E5] bg-white px-7 py-3.5 text-sm font-bold text-[#111111] transition hover:border-[#CCCCCC] active:scale-[0.98]"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            </div>

            <div className="mt-16 flex items-center gap-8 border-t border-[#F0F0F0] pt-10">
              {[
                { label: '100+', sub: 'постеров' },
                { label: '3 размера', sub: '30×40, 40×50, 50×70' },
                { label: 'Алматы', sub: 'быстрая печать' }
              ].map((item, i) => (
                <div key={i} className="relative flex-1">
                  {i > 0 && <div className="absolute -left-4 top-1 h-8 w-px bg-[#E5E5E5]" />}
                  <p className="text-lg font-bold text-[#111111]">{item.label}</p>
                  <p className="text-[11px] uppercase tracking-wider text-[#999999] mt-0.5">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full">
            <HeroStage products={products} />
          </div>

        </div>
      </div>
    </section>
  );
}
