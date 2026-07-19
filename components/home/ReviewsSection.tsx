'use client';

import { motion } from 'framer-motion';
import { FadeIn, StaggerContainer, staggerItem } from '@/components/ui/motion/FadeIn';

const reviews = [
  { name: "Алия М.", district: "Алматы, Бостандык", text: "Заказала постер с аниме для дочки — качество печати отличное, цвета яркие. Доставили на следующий день, упаковка плотная, ничего не помялось.", rating: 5 },
  { name: "Данияр К.", district: "Алматы, Медеу", text: "Брал постер с машиной в подарок другу. Выглядит дорого, бумага плотная. Друг был в восторге. Однозначно буду заказывать ещё.", rating: 5 },
  { name: "Карина Л.", district: "Алматы, Алатау", text: "Заказала свой постер — отправила фото с концерта, напечатали в формате 40×50. Качество супер, цены адекватные. Спасибо!", rating: 5 },
  { name: "Тимур Ш.", district: "Алматы, Наурыз", text: "Оформил через WhatsApp — всё быстро и понятно. Постер с игрой смотрится отлично на стене. Рамку взял отдельно, встало идеально.", rating: 5 },
  { name: "Сабина Р.", district: "Алматы, Бостандык", text: "Долго выбирала между несколькими постерами, написала в WhatsApp — помогли определиться. Очень приятный сервис и быстрая доставка.", rating: 5 },
];

export function ReviewsSection() {
  return (
    <section className="py-24 bg-[#111111] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#999999] block mb-3">
            Отзывы покупателей
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Что говорят наши клиенты
          </h2>
        </div>

        <div className="text-center text-[#666666] text-sm border-b border-[#1A1A1A] pb-6 mb-10">
          ★ 4.9 из 5  ·  Более 200 заказов  ·  Доставка 1–2 дня
        </div>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              className="bg-[#1A1A1A] p-6 rounded-2xl"
            >
              <div className="flex text-[#F97316] mb-4">
                {[...Array(review.rating)].map((_, j) => <span key={j}>★</span>)}
              </div>
              <p className="text-[#AAAAAA] mb-6 leading-relaxed">"{review.text}"</p>
              <div>
                <p className="font-bold text-white">{review.name}</p>
                <p className="text-xs text-[#666666]">{review.district}</p>
              </div>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
