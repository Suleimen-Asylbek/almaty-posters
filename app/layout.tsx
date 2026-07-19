import type { Metadata } from "next";
import "../styles/globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StickyWhatsAppButton } from "@/components/StickyWhatsAppButton";

export const metadata: Metadata = {
  title: {
    default: "Almaty Posters — Постеры для твоей комнаты",
    template: "%s | Almaty Posters",
  },
  description:
    "Almaty Posters — магазин качественных постеров в Алматы. Аниме, фильмы, игры, музыка. Размеры 30×40, 40×50, 50×70. Доставка по Алматы.",
  keywords: [
    "постеры",
    "Алматы",
    "аниме",
    "фильмы",
    "игры",
    "музыка",
    "печать постеров",
  ],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
  },
  openGraph: {
    title: "Almaty Posters — Постеры для твоей комнаты",
    description:
      "Качественные постеры с доставкой по Алматы. Аниме, фильмы, игры, музыка и многое другое.",
    type: "website",
    locale: "ru_RU",
    siteName: "Almaty Posters",
    url: "https://almatyposters.kz",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Almaty Posters — постеры для твоей комнаты',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Almaty Posters — Постеры для твоей комнаты",
    description:
      "Качественные постеры с доставкой по Алматы и всему Казахстану.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
        <StickyWhatsAppButton />
      </body>
    </html>
  );
}
