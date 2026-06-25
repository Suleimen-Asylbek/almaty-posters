import type { Metadata } from 'next';
import { getProducts, getCategories } from '@/lib/data';
import { CatalogContent } from '@/components/catalog/CatalogContent';

export const metadata: Metadata = {
  title: 'Каталог',
  description:
    'Каталог постеров Almaty Posters — аниме, фильмы, игры, музыка, машинки и интерьер. Размеры 30×40, 40×50, 50×70. Доставка по Алматы.',
};

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function CatalogPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const [{ products, usingMockData }, { categories }] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <CatalogContent
      products={products}
      categories={categories}
      usingMockData={usingMockData}
      initialCategory={category ?? 'all'}
    />
  );
}
