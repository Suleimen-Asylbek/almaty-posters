import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Product, PosterSize } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return `${price.toLocaleString('ru-RU')} ₸`;
}

const SIZE_LABELS: Record<PosterSize, string> = {
  '30x40': '30×40 см',
  '40x50': '40×50 см',
  '50x70': '50×70 см',
};

export function getSizeLabel(size: PosterSize): string {
  return SIZE_LABELS[size];
}

export function getPriceForSize(product: Product, size: PosterSize): number {
  switch (size) {
    case '30x40': return product.price_30x40;
    case '40x50': return product.price_40x50;
    case '50x70': return product.price_50x70;
  }
}

export function buildWhatsAppUrl(
  phoneNumber: string,
  productTitle: string,
  size: PosterSize
): string {
  const label = getSizeLabel(size);
  const message = `Здравствуйте! Хочу заказать постер:\nНазвание: ${productTitle}\nРазмер: ${label}\nДоставка по Алматы.`;
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

function transliterate(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map((char) => CYRILLIC_TO_LATIN[char] ?? char)
    .join('');
}

export function slugify(text: string): string {
  return transliterate(text)
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
