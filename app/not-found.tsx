import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="pt-16 min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-6xl mb-4">🖼️</p>
        <h1 className="text-3xl font-black text-[#111111] tracking-tight mb-2">
          Страница не найдена
        </h1>
        <p className="text-[#666666] text-sm mb-8">
          Похоже, такой страницы не существует или постер был удалён.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-[#111111] text-white font-semibold px-6 py-3 rounded-full text-sm hover:bg-[#333333] transition-colors"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
