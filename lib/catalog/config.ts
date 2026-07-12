/**
 * Catalog-specific configuration — deliberately not lib/constants.ts.
 * A project-wide constants file tends to become a junk drawer over time;
 * keeping catalog concerns (page size, default/allowed sort values, etc.)
 * together here means anything added later for the catalog lands next to
 * what's already here instead of in an unrelated global file.
 */

export const CATALOG_PAGE_SIZE = 24;

/**
 * Sort is an enum-like union from day one, even though only one value is
 * supported today — adding "popular" / "price-asc" / "price-desc" later
 * extends this union without changing getPaginatedProducts()'s contract.
 */
export type ProductSort = "new";

export const DEFAULT_PRODUCT_SORT: ProductSort = "new";
