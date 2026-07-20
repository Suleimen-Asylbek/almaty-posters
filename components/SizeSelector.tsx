'use client';

import { motion } from 'framer-motion';
import type { PosterSize } from '@/lib/types';
import { formatPrice, getSizeLabel } from '@/lib/utils';

interface SizeSelectorProps {
  selectedSize: PosterSize;
  onChange: (size: PosterSize) => void;
  prices: { '30x40': number; '40x50': number; '50x70': number };
  recommendedSize?: PosterSize;
}

const sizes: PosterSize[] = ['30x40', '40x50', '50x70'];

export function SizeSelector({ selectedSize, onChange, prices, recommendedSize }: SizeSelectorProps) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#111111] mb-3">
        Размер
      </p>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <motion.button
            key={size}
            onClick={() => onChange(size)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={`relative px-4 py-2 rounded-full border text-sm font-medium transition-all ${
              selectedSize === size
                ? 'bg-[#111111] text-white border-[#111111]'
                : 'bg-white text-[#111111] border-[#E5E5E5] hover:border-[#111111]'
            }`}
          >
            {size === recommendedSize && (
              <span className="absolute -top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F97316] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F97316]"></span>
              </span>
            )}
            {size}
            <span className="ml-2 opacity-70 font-normal">
              {formatPrice(prices[size])}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
