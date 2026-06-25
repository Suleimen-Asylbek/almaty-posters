import { ImagePlus, MessageCircle, Ruler, Sparkles } from 'lucide-react';

const customPosterMessage = encodeURIComponent(
  'Здравствуйте! Хочу заказать свой постер. Могу отправить изображение или идею, подскажите по размеру и стоимости.'
);

const steps = [
  {
    icon: ImagePlus,
    title: 'Пришлите изображение',
    text: 'Фото, арт, кадр из фильма, обложка или просто идею.',
  },
  {
    icon: Ruler,
    title: 'Выберем размер',
    text: 'Подскажем, что лучше смотрится в 30×40, 40×50 или 50×70.',
  },
  {
    icon: Sparkles,
    title: 'Подготовим к печати',
    text: 'Согласуем детали и напечатаем аккуратный постер.',
  },
];

export function CustomPosterSection() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '77077124221';
  const whatsappUrl = `https://wa.me/${phone}?text=${customPosterMessage}`;

  return (
    <section className="bg-[#1a1a1a] text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-[#F97316]">
            Свой постер
          </span>
          <h2 className="max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">
            Не нашли нужный постер?
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            Мы можем изготовить постер по вашему изображению или идее. Пришлите
            референс в WhatsApp, а мы подскажем размер, качество файла и
            стоимость печати.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#F97316] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#ea580c]"
          >
            <MessageCircle size={18} />
            Заказать свой постер
          </a>
        </div>

        <div className="grid gap-4">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#F97316]">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/60">
                    {step.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
