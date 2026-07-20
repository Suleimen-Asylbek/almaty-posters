import { cache } from "react";
import { createClient } from '@/lib/supabase/server';
import type { Product, Category } from '@/lib/types';
import { normalizeProductImages } from '@/lib/product-images';
import { CATALOG_PAGE_SIZE, DEFAULT_PRODUCT_SORT } from '@/lib/catalog/config';
import type { ProductSort } from '@/lib/catalog/config';
import type {
  GetPaginatedProductsOptions,
  PaginatedProductsResult,
  PaginationMeta,
} from '@/lib/catalog/types';

/**
 * Shared wrapper to handle Supabase query boilerplate: try/catch,
 * error logging, and returning a default value on failure.
 */
async function safeQuery<T>(
  builder: PromiseLike<{ data: T | null; error: any }>,
  errorLabel: string,
  defaultValue: T
): Promise<T> {
  try {
    const { data, error } = await builder;
    if (error) {
      console.error(`${errorLabel} ERROR:`, error);
      return defaultValue;
    }
    return data ?? defaultValue;
  } catch (error) {
    console.error(`${errorLabel} EXCEPTION:`, error);
    return defaultValue;
  }
}

export const getProducts = cache(async (): Promise<Product[]> => {
  const supabase = await createClient();
  const data = await safeQuery(
    supabase
      .from("products")
      .select(`
        *,
        category:categories(*)
      `)
      .order("created_at", { ascending: false }),
    "GET PRODUCTS",
    []
  );

  return data.map((product) => normalizeProductImages(product) as Product);
});

export const getProductBySlug = cache(async (
  slug: string,
): Promise<Product | null> => {
  const supabase = await createClient();
  const data = await safeQuery(
    supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('slug', slug)
      .single(),
    "GET PRODUCT BY SLUG",
    null
  );

  return data ? (normalizeProductImages(data) as Product) : null;
});

export const getProductById = cache(async (
  id: string
): Promise<Product | null> => {
  const supabase = await createClient();
  const data = await safeQuery(
    supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('id', id)
      .single(),
    "GET PRODUCT BY ID",
    null
  );

  return data ? (normalizeProductImages(data) as Product) : null;
});

export const getCategories = cache(async (): Promise<Category[]> => {
  const supabase = await createClient();
  return safeQuery(
    supabase
      .from('categories')
      .select('*')
      .order('name'),
    "GET CATEGORIES",
    []
  );
});

export const getFeaturedProducts = cache(async () => {
  const supabase = await createClient();
  const data = await safeQuery(
    supabase
      .from("products")
      .select(`
        *,
        category:categories(*)
      `)
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(4),
    "GET FEATURED PRODUCTS",
    []
  );

  return data.map((product) => normalizeProductImages(product));
});

export const getNewProducts = cache(async () => {
  const supabase = await createClient();
  
  // Try getting explicitly flagged "new" products first
  const newProducts = await safeQuery(
    supabase
      .from("products")
      .select(`
        *,
        category:categories(*)
      `)
      .eq("is_new", true)
      .order("created_at", { ascending: false })
      .limit(4),
    "GET NEW PRODUCTS",
    []
  );

  if (newProducts.length > 0) {
    return newProducts.map((product) => normalizeProductImages(product));
  }

  // fallback to latest 4 if none flagged as new
  const fallbackData = await safeQuery(
    supabase
      .from("products")
      .select(`
        *,
        category:categories(*)
      `)
      .order("created_at", { ascending: false })
      .limit(4),
    "GET NEW PRODUCTS FALLBACK",
    []
  );

  return fallbackData.map((product) => normalizeProductImages(product));
});


/**
 * Applies sort to a products query builder. A dedicated function even
 * though only "new" exists today — adding "price-asc" / "popular" later
 * means adding a case here, not touching getPaginatedProducts()'s query
 * assembly at all.
 *
 * Typed loosely (not exported, not part of any public contract):
 * Supabase's PostgrestFilterBuilder chain type is deeply generic and
 * fighting it for a five-line private helper isn't worth it. The actual
 * safety that matters — that getPaginatedProducts()'s public inputs and
 * outputs are fully typed — is unaffected, since this function is never
 * called from outside this module.
 */
function buildProductSort(query: any, sort: ProductSort) {
  switch (sort) {
    case "new":
    default:
      return query.order("created_at", { ascending: false });
  }
}

/**
 * The public catalog's read path. Category and search are resolved in
 * the SAME query as the same filter pass over the same dataset — not two
 * migrations at different times. Splitting them would mean a window
 * where category is server-filtered but search still runs client-side
 * over an already-paginated (and therefore incomplete) products array,
 * producing wrong "no results" for real matches outside the current
 * page. See the architecture review for why that's not an acceptable
 * intermediate state, not just a rough edge.
 *
 * Category filtering happens IN the same products query via an embedded
 * `categories!inner(*)` join filtered with `.eq('category.slug', ...)` —
 * not a separate getCategoryBySlug() round-trip first. (An earlier
 * version did exactly that: look up the category, then query products —
 * two sequential Supabase calls for one page view, on top of the
 * category *list* the catalog page separately fetches for the filter
 * pills. Same table, two extra round-trips. Production audit fix.) The
 * `!inner` join is only used when a category filter is actually active:
 * unfiltered queries keep the default left join (`categories(*)`, the
 * same as every other query in this file), so a product with a null
 * category_id still appears when browsing "all" — `!inner` would
 * silently drop it, which is correct only once a category filter says
 * "must have a matching category" in the first place.
 *
 * A slug that matches no category now falls out of the *same* query as a
 * natural zero-row result (the inner join has nothing to match), not a
 * special early-return branch — one less state to keep in sync with the
 * rest of this function's pagination math.
 *
 * page is normalized here, not by callers: non-numeric, negative, zero,
 * or fractional input all fall back to page 1; input beyond the last
 * real page clamps down to the last page once the true count is known
 * (self-heals with one extra query only in that case — the common case
 * stays a single round trip). Every RSC that calls this gets a valid
 * page back without re-implementing the same guard.
 *
 * Deliberately NOT wrapped in React's cache(): cache() memoizes by
 * argument reference/value, and every other cached function here takes
 * either no arguments or a single primitive (a slug, an id) — both
 * memoize correctly by value. This function takes an options *object*;
 * a fresh literal built per call (the normal way callers will use it,
 * e.g. from searchParams) has a new identity every time, so cache()
 * would never actually hit and would just add overhead for nothing.
 */
export async function getPaginatedProducts(
  options: GetPaginatedProductsOptions = {},
): Promise<PaginatedProductsResult> {
  const pageSize = CATALOG_PAGE_SIZE;
  const sort = options.sort ?? DEFAULT_PRODUCT_SORT;

  // NaN-safe: Math.max(1, NaN) is NaN in JS, so a plain Math.max guard
  // over unparsed input (e.g. `?page=abc` → Number("abc") → NaN) would
  // silently poison every downstream calculation. Number.isFinite()
  // catches NaN and ±Infinity before Math.max ever runs.
  const requestedPage = Number(options.page);
  const normalizedPage = Number.isFinite(requestedPage)
    ? Math.max(1, Math.floor(requestedPage))
    : 1;

  const buildEmptyMeta = (page: number): PaginationMeta => ({
    page,
    pageSize,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    from: 0,
    to: 0,
  });

  try {
    const supabase = await createClient();

    const categorySlug = options.categorySlug?.trim();

    const buildBaseQuery = () => {
      // Only switch to an inner join when a category filter is actually
      // requested — see the doc comment above for why the default path
      // must stay a left join.
      const selectClause = categorySlug
        ? `*, category:categories!inner(*)`
        : `*, category:categories(*)`;

      let query = supabase
        .from("products")
        .select(selectClause, { count: "exact" });

      if (categorySlug) {
        query = query.eq("category.slug", categorySlug);
      }

      const trimmedSearch = options.search?.trim();
      if (trimmedSearch) {
        // Escape LIKE/ILIKE's own special characters (% = any sequence,
        // _ = any single character) in the *user's* input before it's
        // wrapped in our own %...% pattern. Without this, searching for
        // a title that genuinely contains "_" (e.g. a literal
        // underscore) matches any single character in that position
        // instead of the literal underscore — a real over-matching bug,
        // not a hypothetical one, for any title containing '%' or '_'.
        const escapedSearch = trimmedSearch.replace(/[%_]/g, (char) => `\\${char}`);
        query = query.ilike("title", `%${escapedSearch}%`);
      }

      return buildProductSort(query, sort);
    };

    const rangeFor = (page: number) => {
      const from = (page - 1) * pageSize;
      return { from, to: from + pageSize - 1 };
    };

    let page = normalizedPage;
    let { from, to } = rangeFor(page);
    let { data, error, count } = await buildBaseQuery().range(from, to);

    if (error) {
      console.error("GET PAGINATED PRODUCTS ERROR:", error);
      return { products: [], pagination: buildEmptyMeta(normalizedPage) };
    }

    const totalCount = count ?? 0;
    const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0;

    // Self-heal: page was beyond the real last page. Re-run once for
    // the clamped page rather than returning an empty products array
    // for a page number that was never valid to begin with.
    if (totalPages > 0 && page > totalPages) {
      page = totalPages;
      ({ from, to } = rangeFor(page));
      const clamped = await buildBaseQuery().range(from, to);
      if (clamped.error) {
        console.error("GET PAGINATED PRODUCTS ERROR (clamped):", clamped.error);
        return { products: [], pagination: buildEmptyMeta(normalizedPage) };
      }
      data = clamped.data;
    }

    return {
      products: ((data ?? []) as Product[]).map(
        (product) => normalizeProductImages(product) as Product,
      ),
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        from: totalCount === 0 ? 0 : from + 1,
        to: Math.min(to + 1, totalCount),
      },
    };
  } catch (error) {
    console.error("GET PAGINATED PRODUCTS EXCEPTION:", error);
    return { products: [], pagination: buildEmptyMeta(normalizedPage) };
  }
}