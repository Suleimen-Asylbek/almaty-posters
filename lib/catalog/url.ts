import type { ProductSort } from "./config";

export interface CatalogFilters {
  /** "all" when no category filter is active. */
  category: string;
  /** "" when no search filter is active. */
  search: string;
  sort?: ProductSort;
}

/**
 * The one place that knows the /catalog query-string format
 * (category/search/sort/page). Every link that points at the catalog —
 * from inside it (pagination, category pills, clearing search) or from
 * outside it (a product's category badge, the homepage categories grid)
 * — goes through this module. Nothing else should build a `/catalog?...`
 * string by hand: that's what let two of these formats drift out of sync
 * during the pagination migration.
 */

/**
 * Builds a /catalog URL that preserves every current filter except the
 * ones explicitly overridden. Any override of category/search/sort omits
 * `page` unless the override itself sets one — which is what makes
 * "changing a filter resets to page 1" true by construction, not by an
 * explicit reset step.
 *
 * For links that start a fresh catalog visit from outside it (a product's
 * category badge, the homepage categories grid) and have no existing
 * filters to preserve, use buildCategoryHref() instead.
 */
export function buildCatalogHref(
  filters: CatalogFilters,
  overrides: Partial<CatalogFilters> & { page?: number } = {},
): string {
  const category = overrides.category ?? filters.category;
  const search = overrides.search ?? filters.search;
  const sort = overrides.sort ?? filters.sort;
  const page = overrides.page;

  const params = new URLSearchParams();
  if (category && category !== "all") params.set("category", category);
  if (search) params.set("search", search);
  if (sort) params.set("sort", sort);
  if (page && page > 1) params.set("page", String(page));

  const query = params.toString();
  return query ? `/catalog?${query}` : "/catalog";
}

/**
 * A fresh /catalog link filtered to a single category — no existing
 * filters to preserve, because these are entry points from outside the
 * catalog (a product's category badge, the homepage categories grid),
 * not navigation within it. Equivalent to
 * `buildCatalogHref({ category: "all", search: "", sort: undefined }, { category: slug })`,
 * but named for what these call sites actually mean.
 */
export function buildCategoryHref(slug: string): string {
  return buildCatalogHref(
    { category: "all", search: "" },
    { category: slug },
  );
}
