"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Truck, Package } from "lucide-react";
import type { Product, PosterSize } from "@/lib/types";
import {
  formatPrice,
  getPriceForSize,
  getSizeLabel,
  buildWhatsAppUrl,
  buildWhatsAppMessageUrl,
} from "@/lib/utils";
import { SizeSelector } from "@/components/SizeSelector";
import ImageGallery from "@/components/product/ImageGallery";
import { buildCategoryHref } from "@/lib/catalog/url";

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState<PosterSize>("40x50");

  const images = useMemo(() => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    return product.image_url ? [product.image_url] : [];
  }, [product.image_url, product.images]);

  const currentPrice = getPriceForSize(product, selectedSize);
  const prices = {
    "30x40": product.price_30x40,
    "40x50": product.price_40x50,
    "50x70": product.price_50x70,
  };

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "77077124221";
  const whatsappUrl = buildWhatsAppUrl(phone, product.title, selectedSize);
  const customWhatsappUrl = buildWhatsAppMessageUrl(
    phone,
    "Здравствуйте! Хочу уточнить детали по постеру.",
  );

  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 text-sm text-[#666666] hover:text-[#111111] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Назад в каталог
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
          <ImageGallery
            images={images}
            productTitle={product.title}
            isNew={product.is_new}
            featured={product.featured}
            priority
          />

          <div className="flex flex-col">
            {product.category && (
              <Link href={buildCategoryHref(product.category.slug)}>
                <span className="inline-block bg-[#F6F6F6] text-[#666666] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 hover:bg-[#E5E5E5] transition-colors">
                  {product.category.name}
                </span>
              </Link>
            )}

            <h1 className="text-3xl sm:text-4xl font-black text-[#111111] tracking-tight leading-tight mb-3">
              {product.title}
            </h1>

            {product.description && (
              <p className="text-[#666666] text-base leading-relaxed mb-6">
                {product.description}
              </p>
            )}

            <div className="mb-5">
              <p className="text-4xl font-black text-[#111111]">
                {formatPrice(currentPrice)}
              </p>
              <p className="text-[#999999] text-sm mt-1">
                за постер {getSizeLabel(selectedSize)}
              </p>
            </div>

            <div className="mb-8">
              <SizeSelector
                selectedSize={selectedSize}
                onChange={setSelectedSize}
                prices={prices}
              />
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white font-bold py-4 rounded-2xl text-base shadow-lg shadow-[#25D366]/30 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
            >
              <WhatsAppIcon />
              Заказать в WhatsApp
            </a>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-[#F6F6F6] rounded-xl p-3">
                <Truck size={16} className="text-[#666666] shrink-0" />
                <p className="text-xs text-[#666666] leading-tight">
                  Доставка по Алматы и всему Казахстану
                </p>
              </div>
              <div className="flex items-center gap-2 bg-[#F6F6F6] rounded-xl p-3">
                <Package size={16} className="text-[#666666] shrink-0" />
                <p className="text-xs text-[#666666] leading-tight">
                  Тубус или плотный конверт
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-[#E5E5E5] pt-6 space-y-2.5">
              <DetailRow label="Материал" value="Матовая фотобумага 230 г/м²" />
              <DetailRow label="Печать" value="Профессиональная струйная" />
              <DetailRow label="Размер" value={getSizeLabel(selectedSize)} />
            </div>

            <div className="mt-6 rounded-2xl border border-[#E5E5E5] p-4">
              <p className="text-sm font-semibold text-[#111111] mb-1">
                Нужен другой размер или свой постер?
              </p>
              <p className="text-xs text-[#666666] mb-3">
                Напишите — обсудим всё в WhatsApp.
              </p>

              <a
                href={customWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#25D366] hover:text-[#1fb855] transition-colors"
              >
                <MessageCircle size={15} />
                Написать в WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-[#666666]">{label}</span>
      <span className="font-medium text-[#111111]">{value}</span>
    </div>
  );
}
