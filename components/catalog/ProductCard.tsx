import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  showNewBadge?: boolean;
  priority?: boolean;
}

export function ProductCard({
  product,
  showNewBadge = false,
  priority = false,
}: ProductCardProps) {
  // Логика проверки на наличие нескольких фото
  const hasMultipleImages =
    Array.isArray(product.images) && product.images.length > 1;
  const secondImageUrl = hasMultipleImages ? product.images[1] : null;
  const lowestPrice = product.price_30x40 || 0;

  // Динамические классы: эффекты работают только на десктопе (md+) и только если есть 2+ фото
  const cardHoverClasses = hasMultipleImages
    ? "md:hover:-translate-y-1 md:hover:scale-[1.01]"
    : "";

  const firstImageHoverClasses = hasMultipleImages
    ? "md:group-hover:scale-[1.03] md:group-hover:opacity-0"
    : "";

  return (
    <div
      className={`group transition-all duration-[400ms] ease-out ${cardHoverClasses}`}
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative overflow-hidden rounded-xl bg-[#F6F6F6] aspect-[3/4]">
          {/* БАЗОВЫЙ СЛОЙ: Вторая картинка (статичная, просто проявляется из темноты) */}
          {secondImageUrl && (
            <Image
              src={secondImageUrl}
              alt={`${product.title} - ракурс 2`}
              fill
              className="object-cover z-0 opacity-0 transition-opacity duration-[400ms] ease-out md:group-hover:opacity-100"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          )}

          {/* ВЕРХНИЙ СЛОЙ: Главная картинка (увеличивается и растворяется) */}
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            priority={priority}
            className={`object-cover z-10 transition-all duration-[400ms] ease-out ${firstImageHoverClasses}`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Легчайшее затемнение 5% (эффект тени) */}
          {hasMultipleImages && (
            <div className="absolute inset-0 z-20 bg-black/0 transition-colors duration-[400ms] md:group-hover:bg-black/5 pointer-events-none" />
          )}

          {/* Бейджи */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-30">
            {showNewBadge && product.is_new && (
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
        </div>

        {/* Текст */}
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
