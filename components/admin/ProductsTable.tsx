'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, Loader2, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

interface ProductsTableProps {
  products: Product[];
  usingMockData?: boolean;
}

export function ProductsTable({ products, usingMockData }: ProductsTableProps) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/products/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Не удалось удалить постер');
      }
      setDeleteTarget(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Произошла ошибка');
    } finally {
      setDeleting(false);
    }
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-[#E5E5E5] p-16 text-center">
        <p className="text-[#666666]">Постеров пока нет</p>
        <Link
          href="/admin/products/new"
          className="inline-block mt-4 text-sm font-semibold text-[#111111] underline"
        >
          Добавить первый постер
        </Link>
      </div>
    );
  }


  return (
    <>
      <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden">
        {/* Desktop table */}
        <table className="w-full hidden md:table">
          <thead>
            <tr className="border-b border-[#E5E5E5] text-left">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#999999]">Постер</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#999999]">Категория</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#999999]">30×40 / 40×50 / 50×70</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#999999]">Топ</th>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#999999] text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-[#F0F0F0] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-[#F6F6F6] flex-shrink-0">
                      <Image src={p.image_url} alt={p.title} fill className="object-cover" sizes="48px" />
                    </div>
                    <span className="font-medium text-[#111111] text-sm line-clamp-2">{p.title}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-[#666666]">
                  {p.category?.name || '—'}
                </td>
                <td className="px-5 py-3 text-sm text-[#666666] whitespace-nowrap">
                  {formatPrice(p.price_30x40)} / {formatPrice(p.price_40x50)} / {formatPrice(p.price_50x70)}
                </td>
                <td className="px-5 py-3">
                  {p.featured && (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 text-xs font-semibold px-2 py-1 rounded-full">
                      <Star size={12} fill="currentColor" />
                      Топ
                    </span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={usingMockData ? '#' : `/admin/products/${p.id}/edit`}
                      className="p-2 text-[#666666] hover:text-[#111111] hover:bg-[#F6F6F6] rounded-lg transition-colors"
                      title="Редактировать"
                    >
                      <Pencil size={15} />
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="p-2 text-[#666666] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Удалить"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-[#F0F0F0]">
          {products.map((p) => (
            <div key={p.id} className="p-4 flex gap-3">
              <div className="relative w-14 h-20 rounded-lg overflow-hidden bg-[#F6F6F6] flex-shrink-0">
                <Image src={p.image_url} alt={p.title} fill className="object-cover" sizes="56px" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#111111] text-sm">{p.title}</p>
                <p className="text-xs text-[#666666] mt-0.5">{p.category?.name || '—'}</p>
                <p className="text-xs text-[#666666] mt-1">
                  {formatPrice(p.price_30x40)} / {formatPrice(p.price_40x50)} / {formatPrice(p.price_50x70)}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <Link
                    href={usingMockData ? '#' : `/admin/products/${p.id}/edit`}
                    className="text-xs font-semibold text-[#111111] flex items-center gap-1"
                  >
                    <Pencil size={12} /> Изменить
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(p)}
                    className="text-xs font-semibold text-red-600 flex items-center gap-1"
                  >
                    <Trash2 size={12} /> Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => !deleting && setDeleteTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm"
            >
              <h3 className="font-bold text-[#111111] text-lg mb-2">Удалить постер?</h3>
              <p className="text-sm text-[#666666] mb-1">
                Вы уверены, что хотите удалить «{deleteTarget.title}»?
              </p>
              <p className="text-sm text-[#999999] mb-5">Это действие нельзя отменить.</p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5 mb-4">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl border border-[#E5E5E5] text-sm font-semibold text-[#111111] hover:bg-[#F6F6F6] transition-colors disabled:opacity-50"
                >
                  Отмена
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleting && <Loader2 size={14} className="animate-spin" />}
                  Удалить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
