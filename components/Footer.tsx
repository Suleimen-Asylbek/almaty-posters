import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#111111] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="mb-4 inline-flex font-black text-xl tracking-tight transition-opacity hover:opacity-80"
              aria-label="Almaty Posters"
            >
              ALMATY POSTERS
            </Link>
            <p className="text-[#999999] text-sm leading-relaxed">
              Постеры, которые превращают комнату в отражение твоей личности. Алматы, Казахстан.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="font-semibold text-sm uppercase tracking-widest text-[#666666] mb-4">
              Навигация
            </p>
            <nav className="flex flex-col gap-2">
              {[
                { href: '/catalog', label: 'Каталог' },
                { href: '/about', label: 'О нас' },
                { href: '/faq', label: 'FAQ' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[#999999] hover:text-white transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className="font-semibold text-sm uppercase tracking-widest text-[#666666] mb-4">
              Контакты
            </p>
            <div className="flex flex-col gap-2">
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '77077124221'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#25D366] hover:text-[#1fb855] transition-colors text-sm font-medium"
              >
                WhatsApp
              </a>
              <a
                href="https://instagram.com/almatyposters"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#999999] hover:text-white transition-colors text-sm"
              >
                Instagram
              </a>
              <p className="text-[#666666] text-sm">Алматы, Казахстан</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#222222] mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[#666666] text-xs">
            © {new Date().getFullYear()} Almaty Posters. Все права защищены.
          </p>
          <p className="text-[#666666] text-xs">
            Сделано с ❤️ в Алматы
          </p>
        </div>
      </div>
    </footer>
  );
}
