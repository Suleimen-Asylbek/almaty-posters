import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StickyWhatsAppButton } from "@/components/StickyWhatsAppButton";

const inter = Inter({ subsets: ["latin", "cyrillic"], display: "swap" });

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
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={inter.className}>
      <body className="antialiased text-primary bg-background">
        <Header />
        <main>{children}</main>
        <Footer />
        <StickyWhatsAppButton />
      </body>
    </html>
  );
}
