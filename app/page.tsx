import { HeroSection } from "@/components/home/HeroSection";
import { PopularPosters, NewArrivals } from "@/components/home/PopularPosters";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { CustomPosterSection } from "@/components/home/CustomPosterSection";
import { WhyUsSection } from "@/components/home/WhyUsSection";
import { InstagramSection } from "@/components/home/InstagramSection";
import { getFeaturedProducts, getNewProducts, getCategories } from "@/lib/data";

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
      <NewArrivals newProducts={newProducts} />
      <CategoriesSection categories={categories} />
      <WhyUsSection />
      <InstagramSection />
      <CustomPosterSection />
    </>
  );
}
