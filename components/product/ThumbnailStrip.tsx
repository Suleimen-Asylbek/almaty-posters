'use client';

import Image from 'next/image';

interface ThumbnailStripProps {
  images: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  productTitle: string;
}

export default function ThumbnailStrip({
  images,
  selectedIndex,
  onSelect,
  productTitle,
}: ThumbnailStripProps) {
  if (images.length <= 1) return null;

  return (
    <div className="mt-3 grid grid-cols-4 gap-2">
      {images.map((image, index) => (
        <button
          key={`${image}-${index}`}
          type="button"
          onClick={() => onSelect(index)}
          className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-colors ${
            selectedIndex === index
              ? 'border-[#111111]'
              : 'border-[#E5E5E5] hover:border-[#999999]'
          }`}
          aria-label={`Показать изображение ${index + 1}`}
          aria-current={selectedIndex === index ? 'true' : undefined}
        >
          <Image
            src={image}
            alt={`${productTitle} ${index + 1}`}
            fill
            className="object-cover"
            sizes="80px"
          />
        </button>
      ))}
    </div>
  );
}