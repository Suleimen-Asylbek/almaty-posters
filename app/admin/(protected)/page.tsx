import type { Metadata } from 'next';
import { getProducts } from '@/lib/data';
import { ProductsTable } from '@/components/admin/ProductsTable';

export const metadata: Metadata = {
  title: 'Все постеры — Админ-панель',
};

export default async function AdminDashboardPage() {
  const { products, usingMockData } = await getProducts();

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-[#111111] tracking-tight">
            Все постеры
          </h1>
          <p className="text-sm text-[#666666] mt-1">
            {products.length} {products.length === 1 ? 'постер' : 'постеров'} в каталоге
          </p>
        </div>
      </div>

      {usingMockData && (
        <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl px-4 py-3">
          ⚠️ Supabase не настроен — отображаются демо-данные. Добавьте переменные окружения,
          чтобы подключить реальную базу данных.
        </div>
      )}

      <ProductsTable products={products} usingMockData={usingMockData} />
    </div>
  );
}
