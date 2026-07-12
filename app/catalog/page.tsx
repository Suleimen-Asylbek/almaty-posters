import type { Metadata } from 'next';
import { getPaginatedProducts, getCategories } from '@/lib/data';
import type { ProductSort } from '@/lib/catalog/config';
import { CatalogContent } from '@/components/catalog/CatalogContent';

export const metadata: Metadata = {
  title: 'Каталог',
  description:
    'Каталог постеров Almaty Posters — аниме, фильмы, игры, музыка, машинки и интерьер. Размеры 30×40, 40×50, 50×70. Доставка по Алматы.',
};

interface Props {
  searchParams: Promise<{
    page?: string;
    category?: string;
    search?: string;
    sort?: string;
  }>;
}

// Only "new" exists in ProductSort today. An unrecognized/absent value
// falls through to undefined so getPaginatedProducts() applies its own
// default — the page never invents a fallback value of its own.
function parseSort(value: string | undefined): ProductSort | undefined {
  return value === 'new' ? value : undefined;
}

export default async function CatalogPage({ searchParams }: Props) {
  const { page, category, search, sort } = await searchParams;
  const parsedSort = parseSort(sort);

  const [{ products, pagination }, categories] = await Promise.all([
    getPaginatedProducts({
      page: page !== undefined ? Number(page) : undefined,
      categorySlug: category,
      search,
      sort: parsedSort,
    }),
    getCategories(),
  ]);

  return (
    <CatalogContent
      products={products}
      categories={categories}
      pagination={pagination}
      filters={{
        category: category ?? 'all',
        search: search ?? '',
        sort: parsedSort,
      }}
    />
  );
}
