'use client';

import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const message = encodeURIComponent(
  'Здравствуйте! Хочу узнать про постеры Almaty Posters.'
);

export function StickyWhatsAppButton() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '77077124221';
  const whatsappUrl = `https://wa.me/${phone}?text=${message}`;

  return (
    <>
      {/* Mobile: full-width bar at bottom */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 left-4 right-4 z-40 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 text-sm font-semibold text-white shadow-xl shadow-[#25D366]/30 md:hidden"
        aria-label="Написать в WhatsApp"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.4, ease: 'easeOut' }}
        whileTap={{ scale: 0.97 }}
      >
        <MessageCircle size={18} />
        Написать в WhatsApp
      </motion.a>

      {/* Desktop: floating pill in bottom-right corner */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 hidden md:inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-[#25D366]/30 hover:bg-[#1fb855] transition-colors"
        aria-label="Написать в WhatsApp"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.3, type: 'spring', stiffness: 260 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle size={17} />
        WhatsApp
      </motion.a>
    </>
  );
}
