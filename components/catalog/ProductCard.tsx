import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  showButton?: boolean;
  showNewBadge?: boolean;
  priority?: boolean;
}



export function ProductCard({
  product,
  showButton = false,
  showNewBadge = false,
  priority = false,
}: ProductCardProps) {
  const lowestPrice = product.price_30x40;

  return (
    <div className="group transition-transform duration-300 hover:-translate-y-1">
      <Link href={`/product/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden rounded-xl bg-[#F6F6F6] aspect-[3/4]">
          <div className="relative w-full h-full transition-transform duration-300 group-hover:scale-105">
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              priority={priority}
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>

          {/* Badges — top-left stack */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {(showNewBadge && product.is_new) && (
              <span className="bg-[#F97316] text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-tight">
                НОВИНКА
              </span>
            )}
            {product.category && (
              <span className="bg-white/90 backdrop-blur-sm text-[#111111] text-xs font-semibold px-2.5 py-1 rounded-full">
                {product.category.name}
              </span>
            )}
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

          {/* Hover CTA */}
          {showButton && (
            <div className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="w-full bg-white text-[#111111] text-sm font-semibold py-2.5 rounded-lg text-center shadow-sm">
                Подробнее
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-3 px-0.5">
          <p className="font-semibold text-[#111111] text-sm leading-snug line-clamp-1">
            {product.title}
          </p>
          <p className="text-[#666666] text-sm mt-0.5">
            от {formatPrice(lowestPrice)}
          </p>
        </div>
      </Link>
    </div>
  );
}
