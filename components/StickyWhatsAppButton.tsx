'use client';

import { MessageCircle } from 'lucide-react';

const message = encodeURIComponent(
  'Здравствуйте! Хочу узнать про постеры Almaty Posters.'
);

export function StickyWhatsAppButton() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '77077124221';
  const whatsappUrl = `https://wa.me/${phone}?text=${message}`;

  return (
    <>
      {/* Mobile: full-width bar at bottom */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 left-4 right-4 z-40 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 text-sm font-semibold text-white shadow-xl shadow-[#25D366]/30 md:hidden active:scale-[0.98] transition-transform"
        aria-label="Написать в WhatsApp"
      >
        <MessageCircle size={18} />
        Написать в WhatsApp
      </a>

      {/* Desktop: floating pill in bottom-right corner */}
      <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 hidden md:inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-[#25D366]/30 transition-all duration-300 ease-out hover:bg-[#1fb855] hover:scale-[1.05] active:scale-[0.95]"
      aria-label="Написать в WhatsApp"
      >
        <MessageCircle size={17} />
        WhatsApp
      </a>
    </>
  );
}
