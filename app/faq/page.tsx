import type { Metadata } from 'next';
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
      </div>
    </div>
  );
}
