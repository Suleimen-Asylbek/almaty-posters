'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { StaggerContainer, staggerItem } from '@/components/ui/FadeIn';
import { buildCategoryHref } from '@/lib/catalog/url';
import type { Category } from '@/lib/types';

interface CategoriesSectionProps {
  categories: Category[];
}

/**
 * Presentation only — bg/color/emoji have no equivalent column in the
 * `categories` table, so this stays a local lookup keyed by slug, not
 * data fetched from Supabase. What categories *exist* and what they're
 * *named* now comes from getCategories() (passed in as a prop) instead
 * of being duplicated here — a second, hardcoded slug/name list here
 * used to be able to drift out of sync with the real categories table
 * (rename a category in Supabase, this list still linked to the old
 * slug — every link here silently pointed at a category-filtered
 * catalog page with zero results). Production audit fix.
 *
 * Any category not listed here (e.g. one added in Supabase after this
 * map was last updated) still renders correctly via DEFAULT_CATEGORY_STYLE
 * — a new category is never silently dropped from the grid for lack of a
 * custom color.
 */
const CATEGORY_STYLES: Record<string, { bg: string; color: string; emoji: string }> = {
  anime: { bg: '#1a1a2e', color: '#e94560', emoji: '⛩️' },
  movies: { bg: '#0f0f0f', color: '#c9a84c', emoji: '🎬' },
  games: { bg: '#1c1c1c', color: '#8bc34a', emoji: '🎮' },
  music: { bg: '#111111', color: '#ffffff', emoji: '🎵' },
  cars: { bg: '#1a0533', color: '#ff6b35', emoji: '🚗' },
  interior: { bg: '#f0ede8', color: '#6b5b45', emoji: '🪴' },
};

const DEFAULT_CATEGORY_STYLE = { bg: '#111111', color: '#ffffff', emoji: '🖼️' };

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  if (categories.length === 0) return null;

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
          {categories.map((cat) => {
            const style = CATEGORY_STYLES[cat.slug] ?? DEFAULT_CATEGORY_STYLE;
            return (
              <motion.div key={cat.slug} variants={staggerItem}>
                <Link href={buildCategoryHref(cat.slug)}>
                  <motion.div
                    className="relative overflow-hidden rounded-2xl aspect-square flex flex-col items-center justify-center cursor-pointer"
                    style={{ backgroundColor: style.bg }}
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <span className="text-3xl mb-2 relative z-10">{style.emoji}</span>
                    <span
                      className="text-sm font-bold tracking-wide relative z-10 text-center px-2"
                      style={{ color: style.color }}
                    >
                      {cat.name}
                    </span>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
