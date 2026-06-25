# Almaty Posters

Премиальный, минималистичный интернет-магазин постеров для Алматы. Оформление заказов происходит через WhatsApp — без онлайн-оплаты.

## Стек технологий

- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS** — стилизация
- **Framer Motion** — анимации
- **Supabase** — база данных (PostgreSQL), аутентификация, хранилище файлов
- **Vercel** — деплой

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка Supabase

1. Создайте проект на [supabase.com](https://supabase.com).
2. Откройте **SQL Editor** и выполните содержимое файла `supabase/schema.sql` — это создаст таблицы `categories`, `products`, политики RLS, бакет хранилища `posters` и заполнит базовые категории.
3. В **Authentication → Users** создайте одного пользователя-администратора (email + пароль) — это и будет аккаунт для входа в `/admin`.

### 3. Переменные окружения

Скопируйте `.env.local.example` в `.env.local` и заполните:

```bash
cp .env.local.example .env.local
```

| Переменная | Где взять |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (⚠️ держите в секрете, используется только на сервере) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Номер WhatsApp в формате `77077124221` (без `+`) |
| `ADMIN_EMAIL` | Email администратора, созданного на шаге 2.3 |

### 4. Запуск в режиме разработки

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

> Пока Supabase не настроен (или переменные окружения пустые), главная страница, каталог и карточки товаров используют демо-данные из `lib/mock-data.ts`, поэтому интерфейс полностью кликабелен с первого запуска. Админ-панель при этом покажет предупреждение и тоже отобразит демо-данные в режиме чтения.

### 5. Деплой на Vercel

1. Запушьте проект в свой Git-репозиторий.
2. Импортируйте репозиторий в [Vercel](https://vercel.com/new).
3. Добавьте те же переменные окружения в настройках проекта Vercel (Settings → Environment Variables).
4. Задеплойте.

## Структура проекта

```
app/
├── layout.tsx                  Корневой layout, метатеги
├── page.tsx                    Главная страница
├── catalog/page.tsx            Каталог с поиском и фильтрами
├── product/[slug]/page.tsx     Страница товара
├── about/page.tsx               О нас
├── faq/page.tsx                FAQ
├── sitemap.ts / robots.ts      SEO
├── admin/
│   ├── login/page.tsx          Вход (вне защищённой группы)
│   └── (protected)/            Все страницы ниже требуют авторизации
│       ├── layout.tsx          Проверка сессии + email администратора
│       ├── page.tsx            Список постеров
│       └── products/
│           ├── new/page.tsx
│           └── [id]/edit/page.tsx
└── api/admin/products/         Server Actions / API-роуты для CRUD
components/
├── Header.tsx, Footer.tsx
├── SizeSelector.tsx, WhatsAppButton.tsx
├── home/                       Секции главной страницы
├── catalog/                    ProductCard, ProductDetail
├── about/, faq/                Контент соответствующих страниц
├── admin/                      Sidebar, форма, таблица, логин
└── ui/                         Переиспользуемые анимационные обёртки
lib/
├── types.ts                    Типы Product, Category, PosterSize
├── utils.ts                    Форматирование цен, ссылка WhatsApp, slugify
├── mock-data.ts                Демо-данные для разработки без Supabase
└── supabase/                   client.ts, server.ts, admin.ts, auth.ts
supabase/schema.sql             Полная SQL-схема + RLS + сиды
```

## Как устроена авторизация в админке

- `/admin/login` — публичная страница входа (Supabase Auth `signInWithPassword`).
- `/admin/(protected)/*` — все вложенные страницы оборачиваются в `layout.tsx`, который вызывает `requireAdmin()`: если сессии нет — редирект на `/admin/login`; если email не совпадает с `ADMIN_EMAIL` — редирект с ошибкой `unauthorized`.
- Мутации (создание/изменение/удаление постеров) идут через `app/api/admin/products/*`, где **повторно** проверяется сессия и email, а сама запись в базу выполняется через клиент с `SUPABASE_SERVICE_ROLE_KEY` (минуя RLS, так как авторизация уже подтверждена на уровне API-роута).
- Загрузка изображений идёт напрямую из браузера в Supabase Storage (бакет `posters`) с использованием анонимного клиента — это разрешено политикой `Authenticated users can upload poster images`, которая проверяет, что пользователь залогинен.

## Поток заказа через WhatsApp

1. Пользователь выбирает постер и размер (A4 / A3 / A2) — цена обновляется мгновенно.
2. Нажимает «Заказать в WhatsApp».
3. Открывается `wa.me/<номер>` с заранее заполненным сообщением:
   ```
   Здравствуйте! Хочу заказать постер:
   Название: {название}
   Размер: {размер}
   Доставка по Алматы.
   ```
4. Дальнейшее общение, оплата и согласование доставки происходят вручную в чате — на сайте нет корзины и онлайн-оплаты.
