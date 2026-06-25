import type { Metadata } from 'next';
import { getCategories } from '@/lib/data';
import { ProductForm } from '@/components/admin/ProductForm';

export const metadata: Metadata = {
  title: 'Добавить постер — Админ-панель',
};

export default async function NewProductPage() {
  const { categories } = await getCategories();

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-2xl font-black text-[#111111] tracking-tight mb-1">
        Добавить постер
      </h1>
      <p className="text-sm text-[#666666] mb-8">
        Заполните информацию о новом постере
      </p>

      <ProductForm categories={categories} />
    </div>
  );
}
