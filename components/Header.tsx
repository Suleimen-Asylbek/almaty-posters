"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

const navLinks = [
  { href: "/catalog", label: "Каталог" },
  { href: "/about", label: "О нас" },
  { href: "/faq", label: "FAQ" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      setIsScrolled(latest > 20);
    });
  }, [scrollY]);

  const isActiveLink = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 border-b border-[#E5E5E5] transition-all duration-300"
      initial={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
      animate={{
        backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.9)",
        backdropFilter: isScrolled ? "blur(12px)" : "blur(8px)",
        height: isScrolled ? "56px" : "64px",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-black text-lg tracking-tight text-[#111111] transition-opacity hover:opacity-70"
          aria-label="Almaty Posters"
        >
          ALMATY POSTERS
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = isActiveLink(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative py-1 text-sm font-medium transition-colors after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:origin-left after:rounded-full after:bg-[#F97316] after:transition-transform ${
                  active
                    ? "text-[#111111] after:scale-x-100"
                    : "text-[#666666] hover:text-[#111111] after:scale-x-0 hover:after:scale-x-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "77077124221"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#1fb855] hover:scale-[1.03] transition-all"
          >
            <WhatsAppIcon />
            WhatsApp
          </a>
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden rounded-full p-2 text-[#111111] transition-colors hover:bg-[#F6F6F6]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-[#E5E5E5] bg-white shadow-lg shadow-black/5"
          >
            <nav className="px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => {
                const active = isActiveLink(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-lg px-3 py-2 text-base font-medium transition-colors ${
                      active
                        ? "bg-[#F97316]/10 text-[#F97316]"
                        : "text-[#111111] hover:bg-[#F6F6F6]"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "77077124221"}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white text-sm font-semibold px-4 py-3 rounded-full justify-center mt-2"
              >
                <WhatsAppIcon />
                Написать в WhatsApp
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.47
5-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207
-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.7
09.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 
0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99
4c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 00
5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
