'use client';

import { Search, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { buildCatalogHref, type CatalogFilters } from '@/lib/catalog/url';
import type { Category } from '@/lib/types';
import { useState } from 'react';

interface CatalogToolbarProps {
  filters: CatalogFilters;
  categories: Category[];
}

export function CatalogToolbar({ filters, categories }: CatalogToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md py-4 border-b border-neutral-100 mb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Search */}
        <form action="/catalog" className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            name="search"
            type="text"
            placeholder="Поиск..."
            defaultValue={filters.search}
            className="w-full pl-11 pr-4 py-2.5 rounded-full border border-neutral-100 bg-neutral-50 text-sm focus:outline-none focus:border-neutral-300 transition-all"
          />
          {filters.category !== 'all' && (
            <input type="hidden" name="category" value={filters.category} />
          )}
          {filters.sort && <input type="hidden" name="sort" value={filters.sort} />}
        </form>

        {/* Filters trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
        >
          {isOpen ? "Скрыть" : "Фильтры и сортировка"}
          <ChevronDown size={14} className={isOpen ? "rotate-180 transition-transform" : "transition-transform"} />
        </button>
      </div>

      {/* Expanded filters */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-neutral-100 mt-4"
          >
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Категории</h4>
                  <div className="flex flex-wrap gap-2">
                    <FilterPill
                      label="Все"
                      active={filters.category === 'all'}
                      href={buildCatalogHref(filters, { category: 'all' })}
                    />
                    {categories.map((cat) => (
                      <FilterPill
                        key={cat.slug}
                        label={cat.name}
                        active={filters.category === cat.slug}
                        href={buildCatalogHref(filters, { category: cat.slug })}
                      />
                    ))}
                  </div>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Сортировка</h4>
                    <div className="flex flex-wrap gap-2">
                      <FilterPill
                        label="Новинки"
                        active={filters.sort === 'new'}
                        href={buildCatalogHref(filters, { sort: 'new' })}
                      />
                    </div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterPill({ label, active, href }: { label: string; active: boolean; href: string }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
        active
          ? 'bg-neutral-900 text-white'
          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
      }`}
    >
      {label}
    </Link>
  );
}
