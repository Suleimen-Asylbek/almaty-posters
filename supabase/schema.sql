-- =========================================================
-- Almaty Posters — Supabase schema
-- Run this in the Supabase SQL editor (or via `supabase db push`)
-- =========================================================

-- ---------------------------------------------------------
-- Tables
-- ---------------------------------------------------------

create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,          -- Russian name (e.g., "Аниме")
  slug text not null unique,   -- e.g., "anime"
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  title text not null,              -- Russian title
  description text default '',
  image_url text not null,          -- public URL from Supabase Storage (cover image)
  images text[] default array[]::text[],
  category_id uuid references categories(id) on delete set null,
  price_30x40 integer not null,     -- price in ₸ for 30×40 cm
  price_40x50 integer not null,     -- price in ₸ for 40×50 cm
  price_50x70 integer not null,     -- price in ₸ for 50×70 cm
  featured boolean default false,   -- show in "Хиты продаж"
  is_new boolean default false,     -- show in "Новинки"
  slug text not null unique,
  created_at timestamptz default now()
);

create index if not exists products_category_id_idx on products(category_id);
create index if not exists products_featured_idx on products(featured);
create index if not exists products_is_new_idx on products(is_new);
create index if not exists products_slug_idx on products(slug);

-- ---------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------

alter table categories enable row level security;
alter table products enable row level security;

create policy "Public can read categories"
  on categories for select
  to anon, authenticated
  using (true);

create policy "Public can read products"
  on products for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------
-- Storage bucket for poster images
-- ---------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('posters', 'posters', true)
on conflict (id) do nothing;

create policy "Public can view poster images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'posters');

-- No insert/update/delete policy for anon/authenticated, intentionally.
-- All poster-image writes go through POST /api/admin/upload, which uses
-- the service_role client (lib/supabase/admin.ts) and is gated by
-- isAuthorizedAdminEmail() at the application layer — the same admin
-- check every other write in this project already goes through. The
-- service_role key bypasses RLS entirely, so it needs no policy here to
-- write; browser clients (anon key, any authenticated Supabase user)
-- correspondingly get none, closing the gap where any authenticated
-- Supabase user — not just the app's one admin — could previously write
-- to this public bucket directly.

-- ---------------------------------------------------------
-- Seed categories (matches business requirements)
-- ---------------------------------------------------------

insert into categories (name, slug) values
  ('Аниме',    'anime'),
  ('Фильмы',   'movies'),
  ('Игры',     'games'),
  ('Музыка',   'music'),
  ('Машинки',  'cars'),
  ('Интерьер', 'interior')
on conflict (slug) do nothing;

-- ---------------------------------------------------------
-- Migration helper (run if upgrading from old A-series schema)
-- ---------------------------------------------------------
-- alter table products rename column price_a4 to price_30x40;
-- alter table products rename column price_a3 to price_40x50;
-- alter table products rename column price_a2 to price_50x70;
-- alter table products add column if not exists is_new boolean default false;
-- update categories set name = 'Машинки'  where slug = 'cars';
-- update categories set name = 'Интерьер', slug = 'interior' where slug = 'minimal';
