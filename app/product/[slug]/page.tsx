import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/data";
import { ProductDetail } from "@/components/catalog/ProductDetail";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Постер не найден" };
  }

  return {
    title: `${product.title} — постер`,
    description:
      product.description ||
      `Купить постер «${product.title}» в Алматы. Размеры 30×40, 40×50, 50×70. Доставка по Алматы.`,
    openGraph: {
      title: `${product.title} | Almaty Posters`,
      description: product.description,
      images: product.image_url ? [{ url: product.image_url }] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return <ProductDetail product={product} />;
}
