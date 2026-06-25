'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="pt-16 min-h-screen flex items-center bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-24 lg:py-0 lg:min-h-screen">
          {/* Text column */}
          <motion.div
            className="order-2 lg:order-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <motion.span
              className="text-xs font-semibold uppercase tracking-widest text-[#666666] mb-6 block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              Алматы, Казахстан
            </motion.span>

            <motion.h1
              className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#111111] leading-none"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              ALMATY
              <br />
              <span className="text-[#666666]">POSTERS</span>
            </motion.h1>

            <motion.p
              className="mt-6 text-lg sm:text-xl text-[#666666] max-w-md leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Постеры для твоей комнаты
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/catalog"
                  className="transition-transform hover:scale-[1.03]"
                >
                  Смотреть каталог
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '77077124221'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-[1.03]"
                >
                  Написать в WhatsApp
                </a>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex items-center gap-8 mt-14 pt-10 border-t border-[#E5E5E5]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <div>
                <p className="text-3xl font-black text-[#111111]">100+</p>
                <p className="text-xs text-[#666666] mt-0.5">Постеров</p>
              </div>
              <div className="w-px h-10 bg-[#E5E5E5]" />
              <div>
                <p className="text-3xl font-black text-[#111111]">3</p>
                <p className="text-xs text-[#666666] mt-0.5">Размера</p>
              </div>
              <div className="w-px h-10 bg-[#E5E5E5]" />
              <div>
                <p className="text-3xl font-black text-[#111111]">1–2</p>
                <p className="text-xs text-[#666666] mt-0.5">Дня доставки</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Image column */}
          <motion.div
            className="order-1 lg:order-2 flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            <div className="relative w-full max-w-sm">
              {/* Background shapes */}
              <div className="absolute -top-8 -right-8 w-64 h-64 bg-[#F6F6F6] rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-[#F6F6F6] rounded-full blur-2xl" />

              {/* Floating poster */}
              <motion.div
                className="relative z-10 rounded-2xl overflow-hidden shadow-2xl aspect-[3/4] w-full max-w-xs mx-auto"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
              >
                <Image
                  src="https://placehold.co/600x800.png?text=ALMATY+POSTERS"
                  alt="Featured poster"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 80vw, 35vw"
                />
              </motion.div>

              {/* Floating tag */}
              <motion.div
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white shadow-xl rounded-2xl px-5 py-3 flex items-center gap-3 z-20 whitespace-nowrap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-[#111111]">Новинки каждую неделю</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
