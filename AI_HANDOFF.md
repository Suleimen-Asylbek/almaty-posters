# AI Handoff — Almaty Posters

This document orients the next engineer (human or AI) picking up this
repository. Its immediate purpose: **implement a new premium hero carousel
from scratch.** Everything below explains the project so that work can start
without first reverse-engineering the codebase.

---

## 1. Overall architecture

Next.js 15 (App Router) + React 18 + TypeScript, styled with Tailwind CSS,
animated with Framer Motion, backed by Supabase (Postgres + Auth + Storage).

- **Rendering**: mostly React Server Components. Data is fetched in
  `app/**/page.tsx` files (server-side) and passed down as props to client
  components that need interactivity.
- **`"use client"`** is only added to components that actually need
  state, effects, or event handlers (forms, carousels, lightboxes, admin
  UI). Everything else stays a server component by default.
- **Auth**: Supabase Auth, cookie-based sessions, used only for `/admin`.
- **No global client state library** (no Redux/Zustand/Context store) —
  state is local to whatever component needs it, or passed via server
  props.

## 2. Folder structure

```
app/                  Next.js routes (App Router)
  page.tsx            Homepage — composes the home/ section components
  catalog/             Product listing
  product/[slug]/      Product detail page
  admin/               Admin dashboard (protected route group)
  api/admin/           Admin REST endpoints (product CRUD)
  about/, faq/         Static content pages
  sitemap.ts, robots.ts

components/
  Header.tsx, Footer.tsx, StickyWhatsAppButton.tsx, WhatsAppButton.tsx
                        Global chrome, used in app/layout.tsx
  SizeSelector.tsx      Shared poster-size selector (catalog + product page)
  home/                 Homepage sections, one file per section,
                         composed in that order by app/page.tsx
    HeroSection.tsx      Barrel — re-exports from home/hero/HeroSection
    hero/                Hero-specific implementation lives here
      HeroSection.tsx     Left copy column + right poster showcase
                           ⚠️ THIS IS WHERE THE NEW HeroCarousel BELONGS
    PopularPosters.tsx, CategoriesSection.tsx, CustomPosterSection.tsx,
    WhyUsSection.tsx, InstagramSection.tsx
  catalog/              Catalog grid + product card + product detail view
  product/               Image gallery / lightbox / thumbnails for the PDP
  admin/                 Admin sidebar, login form, product table/form
  about/, faq/           Content-only components for those pages
  ui/                    Small reusable primitives (currently: FadeIn.tsx)

lib/
  types.ts               Domain types (Product, Category, PosterSize, ...)
  data.ts                All Supabase reads, wrapped in React `cache()`
  product-images.ts       Normalizes product.images / image_url shape
  utils.ts                cn(), formatPrice(), slugify(), WhatsApp URL builders
  supabase/               client.ts (browser), server.ts (RSC, cookie-based),
                           admin.ts (service-role, admin API routes only),
                           auth.ts

styles/globals.css        Tailwind base + a handful of global rules
supabase/schema.sql        Reference copy of the DB schema
```

## 3. Data flow (Supabase → UI)

1. A server component (usually `app/**/page.tsx`) calls a function from
   `lib/data.ts`, e.g. `getFeaturedProducts()`.
2. That function creates a request-scoped Supabase client via
   `lib/supabase/server.ts` (reads the session cookie, RLS applies),
   queries a table, and runs the result through
   `normalizeProductImages()` (`lib/product-images.ts`) so every `Product`
   has a consistent `image_url` + `images[]` shape regardless of what's
   actually in the DB row.
3. Every `lib/data.ts` function is wrapped in React's `cache()`, so it's
   safe to call the same query from multiple places in one request — it
   only hits Supabase once.
4. The page passes the resulting `Product[]` / `Category[]` down as props
   to (mostly server) components. Only components that need interaction
   (image galleries, forms, the future carousel) are `"use client"`.
5. Admin writes go through `app/api/admin/**/route.ts`, which use
   `lib/supabase/admin.ts` (service-role key) instead of the cookie-based
   client.

## 4. Important reusable components

- **`SizeSelector`** — shared between catalog cards and the product page;
  don't fork it.
- **`FadeIn` / `StaggerContainer` / `staggerItem`** (`components/ui/FadeIn.tsx`)
  — the project's one existing animation primitive, built on Framer
  Motion's `useInView`. This is the established pattern for "fade up on
  scroll" — reuse it rather than reinventing scroll-reveal animation.
- **`ProductCard`** (`components/catalog/ProductCard.tsx`) — canonical
  poster card markup (image + title + price), reused by
  `PopularPosters`. If the new carousel needs a card, check this first
  for visual consistency rather than styling one from scratch.

## 5. Utility functions (`lib/utils.ts`)

- `cn(...)` — clsx + tailwind-merge, use for all conditional class names.
- `formatPrice(price)` — `"12 000 ₸"` formatting, always use this instead
  of ad hoc `toLocaleString` calls.
- `getSizeLabel`, `getPriceForSize` — poster-size helpers.
- `slugify` — Cyrillic-aware transliteration + slugify, used for
  product slugs.
- `buildWhatsAppUrl` / `buildWhatsAppMessageUrl` — WhatsApp deep links.

## 6. Design conventions

- Palette is hard-coded hex, not Tailwind theme tokens:
  `#111111` (near-black text), `#666666` (secondary text), `#E5E5E5`
  (borders), `#F6F6F6` / `#F8F8F8` (subtle backgrounds), white
  background. Follow this palette for consistency; don't introduce new
  colors without reason.
- Corners: `rounded-3xl` on poster cards/media, `rounded-xl` on buttons.
- Card shadow convention:
  `shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)]` — reuse this for any new
  poster/media card so depth reads consistently across sections.
- Copy is in Russian throughout; keep new user-facing strings in Russian.
- Layout: sections are full-width `<section>`s with an inner
  `max-w-7xl mx-auto px-4 sm:px-6` container — match this in the hero
  section.

## 7. Animation conventions

- Framer Motion is the only animation library in the project — don't add
  another one.
- Scroll-reveal: `FadeIn` / `StaggerContainer` (see §4).
- For anything with drag/gesture/physics (i.e. the new carousel), prefer
  **MotionValues + `useTransform`** over React state, so per-frame
  updates don't trigger re-renders. This project has no existing
  drag/carousel code to copy — the previous attempt was removed (see §11)
  specifically so the next implementation isn't built on top of it.
- Respect `prefers-reduced-motion` for anything non-trivial.

## 8. Performance considerations

- `lib/data.ts` calls are `cache()`-wrapped — don't duplicate queries,
  just call the existing function again from wherever it's needed.
- Product images always go through `next/image` with `fill` + explicit
  `sizes`, never a raw `<img>`.
- `next.config.ts` whitelists exactly two image hosts (Supabase storage +
  `placehold.co`) — add any new host there if needed.
- Keep client-side bundles small: don't mark a component `"use client"`
  unless it truly needs interactivity; split interactive pieces out of
  otherwise-static sections.
- Any future carousel should only mount the DOM nodes for currently
  visible items, not the entire product list, if it needs to support
  large catalogs (100+ posters).

## 9. Coding style

- TypeScript, strict-ish; prefer explicit `interface`/`type` for props.
- Named exports for components (no default exports for components; pages
  are the exception, per Next.js convention).
- Small, single-responsibility files — logic (hooks/utils) is generally
  kept separate from presentation, especially in anything with
  animation/interaction.
- `cn()` for conditional classnames, not template-string concatenation.
- ESLint (`next/core-web-vitals` config) and `tsc --noEmit` both pass
  clean on the current tree — keep it that way.

## 10. Where the new HeroCarousel goes

**`components/home/hero/`** is the dedicated folder for hero-specific
code. Right now it contains only `HeroSection.tsx`, which renders a
temporary static poster grid (`HeroPosterGrid`, defined inline in that
file) in place of the old carousel.

To build the new carousel:

1. Create the carousel implementation inside `components/home/hero/`
   (e.g. `HeroCarousel.tsx` plus whatever supporting hooks/utils files it
   needs — follow the existing pattern of small, single-purpose files).
2. Replace the `<HeroPosterGrid products={products} />` usage inside
   `components/home/hero/HeroSection.tsx` with the new carousel,
   passing it the same `products: Product[]` the section already
   receives.
3. Nothing outside `components/home/hero/` needs to change —
   `components/home/HeroSection.tsx` (the barrel) and `app/page.tsx`
   already wire everything up correctly and don't need to know the
   carousel's internals.

## 11. Files removed during cleanup

- `components/home/hero/stack-carousel/` (entire folder) — the previous
  carousel implementation (components, hooks, constants, utils). Removed
  in full per instructions; not refactored or partially kept.
- `components/home/HeroCarousel.tsx` — an orphaned stub (`return null`)
  that was never imported anywhere.
- `lib/data.ts`: `getLatestProducts()` and `getHeroProducts()` — unused
  exports with no callers anywhere in the app.
- `lib/types.ts`: `HeroProduct` type — only used by `getHeroProducts()`,
  removed alongside it.
- `styles/logo.png` — unreferenced asset (no import, no `<img>`/`url()`
  anywhere in the codebase).
- `tsconfig.tsbuildinfo` — a local TypeScript build cache that should
  never have been committed; now covered by `.gitignore`.

Also added: a `.gitignore` (the repo had none — `node_modules`,
`.next`, and the build cache were previously at risk of being committed).

## 12. Remaining technical debt

- **No `/public` directory.** There's no favicon, no static asset folder
  — worth setting up if the project doesn't already have one on another
  branch.
- **`lib/data.ts` has a lot of repeated try/catch/`console.error`
  boilerplate** across `getProducts`, `getProductBySlug`,
  `getProductById`, `getCategories`, `getFeaturedProducts`,
  `getNewProducts`. A small shared wrapper (e.g.
  `safeQuery(queryFn, errorLabel)`) would remove most of the
  duplication. Left as-is in this pass since it's working code, not
  something blocking the carousel work.
- **`usingMockData` field** returned by several `lib/data.ts` functions
  is always `false` and never read by any caller — worth confirming
  it's genuinely dead before removing (kept for this pass since it's a
  return-shape change, not an isolated deletion).
- Two of the homepage sections (`PopularPosters` / `NewArrivals`) are
  exported from a single `PopularPosters.tsx` file — fine for now, but if
  more "product row" sections are added, consider extracting a shared
  `ProductRow` component.

## 13. Recommendations for the next engineer

- Read `components/catalog/ProductCard.tsx` and `components/ui/FadeIn.tsx`
  before writing new UI/animation code — matching existing patterns will
  save review cycles.
- Build the carousel with MotionValues driving all visual properties
  (position, scale, opacity, rotation) continuously from a single drag
  input, rather than swapping between discrete React states — that's the
  main lesson from the previous attempt.
- Keep the carousel's public API to a single props object
  (`{ products: Product[]; className?: string }`) so it drops into
  `HeroSection.tsx` without touching any other file.
- Run `npx tsc --noEmit` and `npx eslint .` before considering the work
  done — both are currently clean on this tree.
