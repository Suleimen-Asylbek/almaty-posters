import type { Product } from "@/lib/types";

type ProductImageRow = {
  image_url?: string | null;
  images?: unknown;
};

export function normalizeImages(images: unknown, imageUrl?: string | null): string[] {
  const fallbackUrl = typeof imageUrl === "string" && imageUrl.trim() ? [imageUrl] : [];

  if (!Array.isArray(images)) {
    return fallbackUrl;
  }

  const valid = images.filter(
    (value): value is string => typeof value === "string" && value.trim().length > 0,
  );

  if (valid.length === 0) {
    return fallbackUrl;
  }

  const unique = Array.from(new Set(valid));
  const cover = unique[0] ?? fallbackUrl[0] ?? "";

  if (!cover) {
    return [];
  }

  return [cover, ...unique.filter((url) => url !== cover)];
}

export function normalizeProductImages<T extends ProductImageRow>(row: T): T & Pick<Product, "image_url" | "images"> {
  const fallbackUrl = typeof row.image_url === "string" ? row.image_url : "";
  const images = normalizeImages(row.images, fallbackUrl);
  const coverImage = images[0] ?? fallbackUrl;

  return {
    ...row,
    image_url: coverImage,
    images,
  };
}

export function buildImagePayload(imageUrl: unknown, images: unknown) {
  const fallbackUrl = typeof imageUrl === "string" ? imageUrl : "";
  const normalizedImages = normalizeImages(images, fallbackUrl);
  const coverImage = normalizedImages[0] ?? fallbackUrl;

  return {
    image_url: coverImage,
    images: normalizedImages,
  };
}
