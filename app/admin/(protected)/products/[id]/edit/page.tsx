import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductById, getCategories } from '@/lib/data';
import { ProductForm } from '@/components/admin/ProductForm';

export const metadata: Metadata = {
  title: 'Редактировать постер — Админ-панель',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;

  const [{ product }, { categories }] = await Promise.all([
    getProductById(id),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-2xl font-black text-[#111111] tracking-tight mb-1">
        Редактировать постер
      </h1>
      <p className="text-sm text-[#666666] mb-8">{product.title}</p>

      <ProductForm categories={categories} product={product} />
    </div>
  );
}
