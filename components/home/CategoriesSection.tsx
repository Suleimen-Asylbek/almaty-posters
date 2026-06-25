'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { StaggerContainer, staggerItem } from '@/components/ui/FadeIn';

const categories = [
  { name: 'Аниме',    slug: 'anime',    bg: '#1a1a2e', color: '#e94560', emoji: '⛩️' },
  { name: 'Фильмы',   slug: 'movies',   bg: '#0f0f0f', color: '#c9a84c', emoji: '🎬' },
  { name: 'Игры',     slug: 'games',    bg: '#1c1c1c', color: '#8bc34a', emoji: '🎮' },
  { name: 'Музыка',   slug: 'music',    bg: '#111111', color: '#ffffff', emoji: '🎵' },
  { name: 'Машинки',  slug: 'cars',     bg: '#1a0533', color: '#ff6b35', emoji: '🚗' },
  { name: 'Интерьер', slug: 'interior', bg: '#f0ede8', color: '#6b5b45', emoji: '🪴' },
];

export function CategoriesSection() {
  return (
    <section className="py-24 bg-[#F6F6F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <StaggerContainer className="mb-12">
          <motion.span
            variants={staggerItem}
            className="text-xs font-semibold uppercase tracking-widest text-[#666666] block mb-3"
          >
            Коллекции
          </motion.span>
          <motion.h2
            variants={staggerItem}
            className="text-4xl sm:text-5xl font-black text-[#111111] tracking-tight"
          >
            Категории
          </motion.h2>
        </StaggerContainer>

        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <motion.div key={cat.slug} variants={staggerItem}>
              <Link href={`/catalog?category=${cat.slug}`}>
                <motion.div
                  className="relative overflow-hidden rounded-2xl aspect-square flex flex-col items-center justify-center cursor-pointer"
                  style={{ backgroundColor: cat.bg }}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <span className="text-3xl mb-2 relative z-10">{cat.emoji}</span>
                  <span
                    className="text-sm font-bold tracking-wide relative z-10 text-center px-2"
                    style={{ color: cat.color }}
                  >
                    {cat.name}
                  </span>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
