import { Metadata } from 'next';
import { HeroSection } from "@/components/home/HeroSection";
import { PopularPosters, NewArrivals } from "@/components/home/PopularPosters";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { CustomPosterSection } from "@/components/home/CustomPosterSection";
import { WhyUsSection } from "@/components/home/WhyUsSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { InstagramSection } from "@/components/home/InstagramSection";
import { getFeaturedProducts, getNewProducts, getCategories } from "@/lib/data";

export const metadata: Metadata = {
  title: 'Almaty Posters — Постеры в Алматы',
  description:
    'Магазин постеров в Алматы. Аниме, фильмы, игры, музыка, интерьер. Высокое качество печати, быстрая доставка. Заказывайте постеры на Almaty Posters.',
};

export default async function HomePage() {
  const [featured, newProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getNewProducts(),
    getCategories(),
  ]);

  return (
    <>
      <HeroSection products={featured} />
      <PopularPosters featuredProducts={featured} />
      <ReviewsSection />
      <CategoriesSection categories={categories} />
      <CustomPosterSection />
      <NewArrivals newProducts={newProducts} />
      <WhyUsSection />
      <InstagramSection />
    </>
  );
}
