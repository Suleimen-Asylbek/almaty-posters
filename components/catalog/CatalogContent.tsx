import Link from "next/link";
import { MessageCircle, Search, SearchX, X } from "lucide-react";
import { ProductCard } from "@/components/catalog/ProductCard";
import type { Product, Category } from "@/lib/types";
import type { PaginationMeta } from "@/lib/catalog/types";
import { buildCatalogHref, type CatalogFilters } from "@/lib/catalog/url";

interface CatalogContentProps {
  products: Product[];
  categories: Category[];
  pagination: PaginationMeta;
  filters: CatalogFilters;
}

/**
 * Fully server-driven: every product on the page, the total count, and
 * every pagination fact (totalPages/hasNextPage/hasPreviousPage/from/to)
 * already come from getPaginatedProducts() via props. This component
 * does not filter, search, paginate, or compute page counts — it only
 * renders what it was given and links to URLs that will make the server
 * recompute the next view.
 */
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
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          {/* Search — a plain GET form; submitting navigates to a new
              /catalog URL, which is what triggers the server re-render.
              No client state, no onChange handler. */}
          <form action="/catalog" className="relative flex-1 max-w-sm">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999999]"
            />
            <input
              id="search"
              name="search"
              type="text"
              placeholder="Поиск постера..."
              defaultValue={filters.search}
              className="w-full pl-10 pr-10 py-3 rounded-full border border-[#E5E5E5] bg-white text-sm text-[#111111] placeholder-[#999999] focus:outline-none focus:border-[#111111] transition-colors"
            />
            {filters.category !== "all" && (
              <input type="hidden" name="category" value={filters.category} />
            )}
            {filters.sort && <input type="hidden" name="sort" value={filters.sort} />}
            {filters.search && (
              <Link
                href={buildCatalogHref(filters, { search: "" })}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#111111]"
                aria-label="Очистить поиск"
              >
                <X size={16} />
              </Link>
            )}
          </form>

          {/* Category pills — real links, not client state */}
          <div className="flex flex-wrap gap-2">
            <CategoryPill
              label="Все"
              active={filters.category === "all"}
              href={buildCatalogHref(filters, { category: "all" })}
            />
            {categories.map((cat) => (
              <CategoryPill
                key={cat.slug}
                label={cat.name}
                active={filters.category === cat.slug}
                href={buildCatalogHref(filters, { category: cat.slug })}
              />
            ))}
          </div>
        </div>

        {/* Results count — straight from pagination.totalCount, no local count */}
        <p className="text-sm text-[#666666] mb-6">
          {pagination.totalCount === 0
            ? "Ничего не найдено"
            : `${pagination.totalCount} ${pluralize(pagination.totalCount, "постер", "постера", "постеров")}`}
        </p>

        {/* Grid */}
        {products.length === 0 ? (
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
              <Link
                href="/catalog"
                className="rounded-full border border-[#E5E5E5] bg-white px-5 py-3 text-sm font-semibold text-[#111111] text-center transition-colors hover:bg-[#F6F6F6]"
              >
                Сбросить фильтры
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 4}
                />
              ))}
            </div>

            <CatalogPaginationControls pagination={pagination} filters={filters} />
          </>
        )}
      </div>
    </div>
  );
}

function CategoryPill({
  label,
  active,
  href,
}: {
  label: string;
  active: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
        active
          ? "bg-[#111111] text-white"
          : "bg-white border border-[#E5E5E5] text-[#666666] hover:border-[#111111] hover:text-[#111111]"
      }`}
    >
      {label}
    </Link>
  );
}

/**
 * Every fact rendered here (totalPages, hasNextPage, hasPreviousPage,
 * from, to, totalCount) comes directly from PaginationMeta — nothing is
 * recomputed. The only arithmetic here is `page ± 1` to build the target
 * URL for a prev/next link, which is unavoidable link construction, not
 * a re-derivation of any pagination fact the data layer already owns.
 */
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
