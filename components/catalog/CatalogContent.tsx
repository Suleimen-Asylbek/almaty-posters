"use client";

import { useState, useMemo, useDeferredValue } from "react";
import { MessageCircle, Search, SearchX, X } from "lucide-react";
import { ProductCard } from "@/components/catalog/ProductCard";
import type { Product, Category } from "@/lib/types";

interface CatalogContentProps {
  products: Product[];
  categories: Category[];
  usingMockData?: boolean;
  initialCategory?: string;
}

export function CatalogContent({
  products,
  categories,
  usingMockData = false,
  initialCategory = "all",
}: CatalogContentProps) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "77077124221";
  const customPosterMessage = encodeURIComponent(
    "Здравствуйте! Не нашёл нужный постер на сайте. Можете помочь подобрать или напечатать свой вариант?",
  );
  const customPosterUrl = `https://wa.me/${phone}?text=${customPosterMessage}`;

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.title
        .toLowerCase()
        .includes(deferredSearch.toLowerCase());
      const matchesCategory =
        activeCategory === "all" || p.category?.slug === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, deferredSearch, activeCategory]);

  return (
    <div className="pt-16 min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#F6F6F6] border-b border-[#E5E5E5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#666666] block mb-3">
              Все постеры
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-[#111111] tracking-tight">
              Каталог
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {usingMockData && (
          <div className="mb-8 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl px-4 py-3">
            ⚠️ Supabase не настроен — отображаются демо-данные.
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999]"
            />
            <input
              id="search"
              name="search"
              type="text"
              placeholder="Поиск постера..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-full border border-[#E5E5E5] bg-white text-sm text-[#111111] placeholder-[#999999] focus:outline-none focus:border-[#111111] transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#111111]"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            <CategoryPill
              label="Все"
              active={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
            />
            {categories.map((cat) => (
              <CategoryPill
                key={cat.slug}
                label={cat.name}
                active={activeCategory === cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
              />
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-[#666666] mb-6">
          {filtered.length === 0
            ? "Ничего не найдено"
            : `${filtered.length} ${pluralize(filtered.length, "постер", "постера", "постеров")}`}
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E5E5E5] bg-[#F6F6F6] px-6 py-16 text-center">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#111111] shadow-sm">
              <SearchX size={22} />
            </div>
            <h3 className="mb-2 text-2xl font-black tracking-tight text-[#111111]">
              Не нашли нужный постер?
            </h3>
            <p className="max-w-md text-sm leading-relaxed text-[#666666]">
              Мы можем напечатать постер по вашему изображению или помочь
              подобрать похожий вариант. Напишите нам в WhatsApp и пришлите
              референс.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href={customPosterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1fb855]"
              >
                <MessageCircle size={17} />
                Написать в WhatsApp
              </a>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory("all");
                }}
                className="rounded-full border border-[#E5E5E5] bg-white px-5 py-3 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#F6F6F6]"
              >
                Сбросить фильтры
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index < 4}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
        active
          ? "bg-[#111111] text-white"
          : "bg-white border border-[#E5E5E5] text-[#666666] hover:border-[#111111] hover:text-[#111111]"
      }`}
    >
      {label}
    </button>
  );
}

function pluralize(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
