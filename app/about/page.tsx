import type { Metadata } from 'next';
import { AboutContent } from '@/components/about/AboutContent';

export const metadata: Metadata = {
  title: 'О нас',
  description:
    'Almaty Posters — мы создаём постеры, которые превращают комнату в отражение твоей личности. Узнайте больше о нашей истории и подходе.',
};

export default function AboutPage() {
  return <AboutContent />;
}
