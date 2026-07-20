'use client';

import Link from "next/link";
import { MessageCircle, SearchX } from "lucide-react";
import { ProductCard } from "@/components/catalog/ProductCard";
import type { Product, Category } from "@/lib/types";
import type { PaginationMeta } from "@/lib/catalog/types";
import { CatalogToolbar } from "@/components/catalog/CatalogToolbar";
import { buildCatalogHref, type CatalogFilters } from "@/lib/catalog/url";
import { motion } from "framer-motion";

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

interface CatalogContentProps {
  products: Product[];
  categories: Category[];
  pagination: PaginationMeta;
  filters: CatalogFilters;
}

export function CatalogContent({
  products,
  categories,
  pagination,
  filters,
}: CatalogContentProps) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "77077124221";
  const customPosterMessage = encodeURIComponent(
    "Здравствуйте! Не нашёл нужный постер на сайте. Можете помочь подобрать или напечатать свой вариант?",
  );
  const customPosterUrl = `https://wa.me/${phone}?text=${customPosterMessage}`;

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.1 } }
      }}
      className="min-h-screen bg-white"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="bg-[#F6F6F6] border-b border-[#E5E5E5]">
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
      </motion.div>

      <motion.div variants={staggerItem}>
        <CatalogToolbar filters={filters} categories={categories} />
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">

        {/* Results count — straight from pagination.totalCount, no local count */}
        <motion.p variants={staggerItem} className="text-sm text-[#666666] mb-6">
          {pagination.totalCount === 0
            ? "Ничего не найдено"
            : `${pagination.totalCount} ${pluralize(pagination.totalCount, "постер", "постера", "постеров")}`}
        </motion.p>

        {/* Grid */}
        {products.length === 0 ? (
          <motion.div variants={staggerItem} className="flex flex-col items-center justify-center rounded-2xl border border-[#E5E5E5] bg-[#F6F6F6] px-6 py-16 text-center">
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
              <Link
                href="/catalog"
                className="rounded-full border border-[#E5E5E5] bg-white px-5 py-3 text-sm font-semibold text-[#111111] text-center transition-colors hover:bg-[#F6F6F6]"
              >
                Сбросить фильтры
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div variants={staggerItem} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 4}
                />
              ))}
            </motion.div>

            <motion.div variants={staggerItem}>
                <CatalogPaginationControls pagination={pagination} filters={filters} />
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}

function CatalogPaginationControls({
  pagination,
  filters,
}: {
  pagination: PaginationMeta;
  filters: CatalogFilters;
}) {
  if (pagination.totalPages <= 1) return null;

  return (
    <nav
      aria-label="Пагинация каталога"
      className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      <p className="text-sm text-[#666666]">
        {pagination.from}–{pagination.to} из {pagination.totalCount}
      </p>

      <div className="flex items-center gap-2">
        {pagination.hasPreviousPage ? (
          <Link
            href={buildCatalogHref(filters, { page: pagination.page - 1 })}
            className="px-4 py-2 rounded-full text-sm font-semibold border border-[#E5E5E5] text-[#111111] hover:border-[#111111] transition-colors"
          >
            Назад
          </Link>
        ) : (
          <span className="px-4 py-2 rounded-full text-sm font-semibold border border-[#E5E5E5] text-[#999999] opacity-50 cursor-not-allowed">
            Назад
          </span>
        )}

        <span className="text-sm text-[#666666] px-2">
          {pagination.page} / {pagination.totalPages}
        </span>

        {pagination.hasNextPage ? (
          <Link
            href={buildCatalogHref(filters, { page: pagination.page + 1 })}
            className="px-4 py-2 rounded-full text-sm font-semibold border border-[#E5E5E5] text-[#111111] hover:border-[#111111] transition-colors"
          >
            Далее
          </Link>
        ) : (
          <span className="px-4 py-2 rounded-full text-sm font-semibold border border-[#E5E5E5] text-[#999999] opacity-50 cursor-not-allowed">
            Далее
          </span>
        )}
      </div>
    </nav>
  );
}

function pluralize(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
