'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FadeIn } from '@/components/ui/FadeIn';

export function AboutContent() {
  return (
    <div className="pt-16 min-h-screen bg-white">
      {/* Hero with background image */}
      <section className="relative h-[60vh] min-h-[420px] flex items-center justify-center overflow-hidden">
        <Image
          src="https://placehold.co/1600x900/0d0d0d/333333?text=ALMATY+POSTERS"
          alt="Almaty Posters"
          fill
          priority
          className="object-cover scale-105 blur-[2px]"
        />
        <div className="absolute inset-0 bg-black/50" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 text-center px-4 max-w-2xl"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-white/70 block mb-4">
            Наша история
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Мы создаём постеры, которые превращают комнату в отражение твоей личности
          </h1>
        </motion.div>
      </section>

      {/* Body */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <FadeIn className="space-y-6 text-[#666666] text-lg leading-relaxed">
            <p>
              Всё началось с простой идеи: стены вокруг нас должны говорить о том, кто мы есть.
              Любимый фильм, культовый альбом, персонаж аниме, который вдохновляет — каждая
              деталь интерьера может рассказывать историю.
            </p>
            <p>
              <span className="font-semibold text-[#111111]">Almaty Posters</span> — это не просто
              магазин постеров. Это пространство, где искусство встречается с повседневной жизнью.
              Мы тщательно отбираем каждый постер, печатаем его на качественной бумаге и
              доставляем прямо к твоей двери в Алматы.
            </p>
            <p>
              Мы верим, что хорошая комната начинается не с дорогой мебели, а с деталей, которые
              откликаются именно тебе. Поэтому мы не гонимся за массовостью — мы создаём коллекцию,
              в которой хочется задержаться взглядом.
            </p>
            <p>
              Если ты не нашёл то, что искал — напиши нам. Мы с радостью поможем подобрать постер
              или напечатаем что-то по твоей собственной идее.
            </p>
          </FadeIn>

          <FadeIn delay={0.15} className="mt-12 grid grid-cols-3 gap-6 border-t border-[#E5E5E5] pt-10">
            <div className="text-center">
              <p className="text-3xl font-black text-[#111111]">100+</p>
              <p className="text-xs text-[#666666] mt-1">Постеров в каталоге</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-[#111111]">6</p>
              <p className="text-xs text-[#666666] mt-1">Категорий</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-[#111111]">100%</p>
              <p className="text-xs text-[#666666] mt-1">Любви к деталям</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.25} className="mt-14 text-center">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center gap-2 bg-[#111111] text-white font-semibold px-8 py-4 rounded-full hover:bg-[#333333] transition-colors duration-200 text-sm"
            >
              Смотреть каталог
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
