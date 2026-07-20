import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/lib/data";
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

  const title = `${product.title} — постер`;
  const description =
    product.description ||
    `Купить постер «${product.title}» в Алматы. Размеры 30×40, 40×50, 50×70. Доставка по Алматы.`;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/product/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      images: product.image_url ? [{ url: product.image_url }] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, allProducts] = await Promise.all([
    getProductBySlug(slug),
    getProducts(),
  ]);

  if (!product) notFound();

  // JSON-LD Product & Breadcrumb Schema
  const jsonLd = [
    {
        "@context": "https://schema.org/",
        "@type": "Product",
        name: product.title,
        description: product.description || `Постер ${product.title}`,
        image: product.images || [product.image_url],
        sku: product.id,
        brand: { "@type": "Brand", name: "Almaty Posters" },
        offers: {
            "@type": "Offer",
            priceCurrency: "KZT",
            price: String(product.price_40x50), // Default price
            availability: "https://schema.org/InStock",
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/product/${slug}`
        },
    },
    {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "name": "Каталог",
            "item": `${process.env.NEXT_PUBLIC_SITE_URL}/catalog`
        }, {
            "@type": "ListItem",
            "position": 2,
            "name": product.title,
            "item": `${process.env.NEXT_PUBLIC_SITE_URL}/product/${slug}`
        }]
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} relatedProducts={allProducts} />
    </>
  );
}
