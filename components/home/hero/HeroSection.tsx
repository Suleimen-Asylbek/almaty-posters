'use client';

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
    <section className="relative overflow-hidden bg-white py-24 lg:py-32">
      <HeroBackground />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[1fr_460px] lg:gap-20">
          <div className="max-w-xl">
            <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#999999] mb-6">
              Almaty Posters · Алматы
            </span>

            <h1 className="text-5xl font-bold leading-[1.1] tracking-tighter text-[#111111] sm:text-6xl lg:text-[3.5rem]">
              Искусство,{" "}
              <span className="text-[#F97316]">которое меняет</span>{" "}
              интерьер
            </h1>

            <p className="mt-8 text-lg leading-relaxed text-[#555555]">
              Постеры на заказ из Алматы. Выбери из нашего кураторского каталога или пришли свой дизайн.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-4">
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#111111] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#222222] active:scale-[0.98]"
              >
                Смотреть каталог
                <ArrowRight size={16} />
              </Link>
              <a
                href={`https://wa.me/${phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E5E5E5] bg-white px-8 py-4 text-sm font-semibold text-[#111111] transition hover:border-[#CCCCCC] active:scale-[0.98]"
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
              ].map((stat, i) => (
                <div key={i} className="relative flex-1">
                  {i > 0 && <div className="absolute -left-4 top-1 h-8 w-px bg-[#E5E5E5]" />}
                  <p className="text-lg font-bold text-[#111111]">{stat.label}</p>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[#999999] mt-0.5">{stat.sub}</p>
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
