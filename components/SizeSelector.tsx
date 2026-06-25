'use client';

import { motion } from 'framer-motion';
import type { PosterSize } from '@/lib/types';
import { formatPrice, getSizeLabel } from '@/lib/utils';

interface SizeSelectorProps {
  selectedSize: PosterSize;
  onChange: (size: PosterSize) => void;
  prices: { '30x40': number; '40x50': number; '50x70': number };
}

const sizes: PosterSize[] = ['30x40', '40x50', '50x70'];

export function SizeSelector({ selectedSize, onChange, prices }: SizeSelectorProps) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#111111] mb-3">
        Размер:{' '}
        <span className="font-normal text-[#666666]">{getSizeLabel(selectedSize)}</span>
      </p>
      <div className="flex gap-3">
        {sizes.map((size) => (
          <motion.button
            key={size}
            onClick={() => onChange(size)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-colors ${
              selectedSize === size
                ? 'bg-[#111111] text-white border-[#111111]'
                : 'bg-white text-[#111111] border-[#E5E5E5] hover:border-[#111111]'
            }`}
          >
            <div>{size}</div>
            <div
              className={`text-xs font-normal mt-0.5 ${
                selectedSize === size ? 'text-white/70' : 'text-[#666666]'
              }`}
            >
              {formatPrice(prices[size])}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
