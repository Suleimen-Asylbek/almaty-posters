'use client';

import { motion } from 'framer-motion';
import { buildWhatsAppUrl } from '@/lib/utils';
import type { PosterSize } from '@/lib/types';
import { WhatsAppIcon } from './ui/WhatsAppIcon';

interface WhatsAppButtonProps {
  productTitle: string;
  selectedSize: PosterSize;
}

export function WhatsAppButton({ productTitle, selectedSize }: WhatsAppButtonProps) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '77077124221';
  const url = buildWhatsAppUrl(phone, productTitle, selectedSize);

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white font-bold py-4 rounded-2xl text-base"
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <WhatsAppIcon className="w-5 h-5" />
      Заказать в WhatsApp
    </motion.a>
  );
}
