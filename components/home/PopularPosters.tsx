import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/catalog/ProductCard";
import type { Product } from "@/lib/types";

// ─── Хиты продаж ────────────────────────────────────────────────────────────

interface PopularPostersProps {
  featuredProducts: Product[];
}

export function PopularPosters({ featuredProducts }: PopularPostersProps) {
  const featured = (featuredProducts ?? []).slice(0, 4);
  if (featured.length === 0) return null;

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#666666] block mb-3">
              Лучшие продажи
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-[#111111] tracking-tight">
              Хиты продаж
            </h2>
          </div>

          <Link
            href="/catalog"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-[#111111] hover:opacity-60 transition-opacity"
          >
            Смотреть все
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featured.map((product, index) => (
            <div key={product.id}>
              <ProductCard product={product} priority={index < 4} />
            </div>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#111111] border border-[#E5E5E5] px-6 py-3 rounded-full hover:bg-[#F6F6F6] transition-colors"
          >
            Смотреть все постеры
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Новинки ─────────────────────────────────────────────────────────────────

interface NewArrivalsProps {
  newProducts: Product[];
}

export function NewArrivals({ newProducts }: NewArrivalsProps) {
  const display = (newProducts ?? []).slice(0, 4);

  if (display.length === 0) return null;

  return (
    <section className="py-24 bg-[#F6F6F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#F97316] block mb-3">
              Только что добавили
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-[#111111] tracking-tight">
              Новинки
            </h2>
          </div>

          <Link
            href="/catalog"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-[#111111] hover:opacity-60 transition-opacity"
          >
            Весь каталог
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {display.map((product, index) => (
            <div key={product.id}>
              <ProductCard
                product={product}
                showNewBadge
                priority={index < 4}
              />
            </div>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#111111] border border-[#E5E5E5] px-6 py-3 rounded-full hover:bg-[#F6F6F6] transition-colors"
          >
            Смотреть все новинки
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
