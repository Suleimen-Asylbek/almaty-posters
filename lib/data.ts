import { cache } from "react";
import { createClient } from '@/lib/supabase/server';
import type { Product, Category } from '@/lib/types';
import { normalizeProductImages } from '@/lib/product-images';



export const getProducts = cache(async (): Promise<{
  products: Product[];
  usingMockData: boolean;
}> => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(*)
      `)
      .order("created_at", { ascending: false })
      .limit(24);

if (error) {
  console.error("GET PRODUCTS ERROR:", error);
  return { products: [], usingMockData: false };
}

return {
  products: ((data ?? []) as Product[]).map((product) => normalizeProductImages(product) as Product),
  usingMockData: false
};
  } catch (error) {
  console.error("GET PRODUCTS EXCEPTION:", error);
  return {
    products: [],
    usingMockData: false
  };
}
});

export const getProductBySlug = cache(async (
  slug: string,
): Promise<{
  product: Product | null;
  usingMockData: boolean;
}> => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('GET PRODUCT BY SLUG ERROR:', error);
      return {
        product: null,
        usingMockData: false
      };
    }

    return {
      product: normalizeProductImages(data) as Product,
      usingMockData: false
    };
  } catch (error) {
    console.error('GET PRODUCT BY SLUG EXCEPTION:', error);
    return {
      product: null,
      usingMockData: false
    };
  }
});

export const getProductById = cache(async (
  id: string
): Promise<{
  product: Product | null;
  usingMockData: boolean;
}> => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('GET PRODUCT BY ID ERROR:', error);
      return {
        product: null,
        usingMockData: false
      };
    }

    return {
      product: normalizeProductImages(data) as Product,
      usingMockData: false
    };
  } catch (error) {
    console.error('GET PRODUCT BY ID EXCEPTION:', error);
    return {
      product: null,
      usingMockData: false
    };
  }
});

export const getCategories = cache(async (): Promise<{
  categories: Category[];
  usingMockData: boolean;
}> => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('GET CATEGORIES ERROR:', error);
      return {
        categories: [],
        usingMockData: false
      };
    }

    return {
      categories: (data ?? []) as Category[],
      usingMockData: false
    };
  } catch (error) {
    console.error('GET CATEGORIES EXCEPTION:', error);
    return {
      categories: [],
      usingMockData: false
    };
  }
});

export const getFeaturedProducts = cache(async () => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(*)
      `)
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(4);

    if (error) {
      console.error("GET FEATURED PRODUCTS ERROR:", error);
      return [];
    }

    return (data ?? []).map((product) => normalizeProductImages(product));
  } catch (error) {
    console.error("GET FEATURED PRODUCTS EXCEPTION:", error);
    return [];
  }
});
export const getNewProducts = cache(async () => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(*)
      `)
      .eq("is_new", true)
      .order("created_at", { ascending: false })
      .limit(4);

    if (error) {
      console.error("GET NEW PRODUCTS ERROR:", error);
      return [];
    }

    if (data && data.length > 0) return (data ?? []).map((product) => normalizeProductImages(product));

    // fallback to latest 4 if none flagged as new
    const { data: fallbackData, error: fallbackError } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(*)
      `)
      .order("created_at", { ascending: false })
      .limit(4);

    if (fallbackError) {
      console.error("GET NEW PRODUCTS FALLBACK ERROR:", fallbackError);
      return [];
    }

    return (fallbackData ?? []).map((product) => normalizeProductImages(product));
  } catch (error) {
    console.error("GET NEW PRODUCTS EXCEPTION:", error);
    return [];
  }
});