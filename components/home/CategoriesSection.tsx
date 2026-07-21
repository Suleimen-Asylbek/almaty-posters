import Link from 'next/link';
import { buildCategoryHref } from '@/lib/catalog/url';
import type { Category } from '@/lib/types';

const CATEGORY_STYLES: Record<string, { bg: string; color: string; emoji: string }> = {
  anime: { bg: '#1a1a2e', color: '#e94560', emoji: '⛩️' },
  movies: { bg: '#0f0f0f', color: '#c9a84c', emoji: '🎬' },
  games: { bg: '#1c1c1c', color: '#8bc34a', emoji: '🎮' },
  music: { bg: '#111111', color: '#ffffff', emoji: '🎵' },
  cars: { bg: '#1a0533', color: '#ff6b35', emoji: '🚗' },
  interior: { bg: '#f0ede8', color: '#6b5b45', emoji: '🪴' },
};

const DEFAULT_CATEGORY_STYLE = { bg: '#111111', color: '#ffffff', emoji: '🖼️' };

interface CategoriesSectionProps {
  categories: Category[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  if (categories.length === 0) return null;

  return (
    <section className="py-24 bg-[#F6F6F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#666666] block mb-3">
            Коллекции
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-[#111111] tracking-tight">
            Категории
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const style = CATEGORY_STYLES[cat.slug] ?? DEFAULT_CATEGORY_STYLE;
            return (
              <Link key={cat.slug} href={buildCategoryHref(cat.slug)} className="group">
                <div
                  className="relative overflow-hidden rounded-2xl aspect-square flex flex-col items-center justify-center transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-lg"
                  style={{ backgroundColor: style.bg }}
                >
                  <span className="text-3xl mb-2 relative z-10">{style.emoji}</span>
                  <span
                    className="text-sm font-bold tracking-wide relative z-10 text-center px-2"
                    style={{ color: style.color }}
                  >
                    {cat.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
