export type Category = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type Product = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  images: string[];
  category_id: string | null;
  category?: Category;
  price_30x40: number;
  price_40x50: number;
  price_50x70: number;
  is_new: boolean;
  featured: boolean;
  slug: string;
  created_at: string;
};

export type PosterSize = '30x40' | '40x50' | '50x70';

export type SizePrice = {
  size: PosterSize;
  price: number;
};

export type AdminUser = {
  id: string;
  email: string;
};
