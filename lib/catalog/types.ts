import type { Product } from "@/lib/types";
import type { ProductSort } from "./config";

export interface GetPaginatedProductsOptions {
  readonly page?: number;
  readonly categorySlug?: string;
  readonly search?: string;
  readonly sort?: ProductSort;
}

export interface PaginationMeta {
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
  /** 1-indexed display range, e.g. "1–24" — computed once here so the UI never does this arithmetic itself. */
  readonly from: number;
  readonly to: number;
}

export interface PaginatedProductsResult {
  readonly products: Product[];
  readonly pagination: PaginationMeta;
}
