import type { Metadata } from 'next';
import Link from 'next/link';
import { FaqAccordion } from '@/components/faq/FaqAccordion';

export const metadata: Metadata = {
  title: 'FAQ — Часто задаваемые вопросы',
  description:
    'Ответы на частые вопросы о размерах постеров, доставке по Алматы, индивидуальных заказах и оформлении заказа в Almaty Posters.',
};

const faqs = [
  {
    question: 'Какие размеры доступны?',
    answer:
      'Мы печатаем постеры в трёх форматах: 30×40 см, 40×50 см и 50×70 см. Размер можно выбрать прямо на странице товара — цена обновится автоматически.',
  },
  {
    question: 'Как проходит доставка?',
    answer:
      'После того как вы оформите заказ через WhatsApp, мы согласуем удобное время и адрес доставки. Курьер привозит постер аккуратно упакованным в тубус или плотный конверт.',
  },
  {
    question: 'Сколько занимает доставка?',
    answer:
      'В большинстве случаев доставка по Алматы занимает 1–2 дня. Точные сроки зависят от загруженности и района — уточняйте при оформлении заказа в WhatsApp.',
  },
  {
    question: 'Можно ли заказать свой постер?',
    answer:
      'Да! Мы можем напечатать постер по вашему собственному изображению или идее. Напишите нам в WhatsApp, пришлите референс — и мы обсудим детали и стоимость.',
  },
  {
    question: 'Как оформить заказ?',
    answer:
      'Выберите понравившийся постер в каталоге, укажите нужный размер и нажмите кнопку «Заказать в WhatsApp». Откроется чат с готовым сообщением — останется только отправить его.',
  },
];

export default function FaqPage() {
  return (
    <div className="pt-16 min-h-screen bg-white">
      <div className="bg-[#F6F6F6] border-b border-[#E5E5E5]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#666666] block mb-3">
            Вопросы и ответы
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-[#111111] tracking-tight">
            FAQ
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <FaqAccordion items={faqs} />
        
        <div className="mt-16 text-center border-t border-[#E5E5E5] pt-12">
          <p className="text-[#666666] text-base mb-6">
            Не нашли ответ? Напишите нам — ответим быстро.
          </p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '77077124221'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#111111] text-white font-bold px-8 py-3.5 rounded-2xl text-sm hover:bg-black transition-colors"
          >
            Написать в WhatsApp
          </a>
          <div className="mt-8">
            <Link href="/catalog" className="text-sm text-[#666666] hover:text-[#111111] transition-colors underline underline-offset-4">
              Перейти в каталог →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
