import { Product } from "@/lib/types";
import { ProductCard } from "@/components/catalog/ProductCard";

interface RelatedProductsProps {
  products: Product[];
  currentSlug: string;
}

export function RelatedProducts({ products, currentSlug }: RelatedProductsProps) {
  const related = products
    .filter((p) => p.slug !== currentSlug)
    .slice(0, 4);

  if (related.length === 0) return null;

  return (
    <section className="mt-20 pt-16 border-t border-[#E5E5E5]">
      <h2 className="text-2xl font-black text-[#111111] mb-8">Вам также понравится</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {related.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
