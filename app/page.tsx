import { HeroSection } from "@/components/home/HeroSection";
import { PopularPosters, NewArrivals } from "@/components/home/PopularPosters";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { CustomPosterSection } from "@/components/home/CustomPosterSection";
import { WhyUsSection } from "@/components/home/WhyUsSection";
import { InstagramSection } from "@/components/home/InstagramSection";
import { getFeaturedProducts, getNewProducts } from "@/lib/data";

export default async function HomePage() {
  const featured = await getFeaturedProducts();
  const newProducts = await getNewProducts();

  return (
    <>
      <HeroSection />
      <PopularPosters featuredProducts={featured} />
      <NewArrivals newProducts={newProducts} />
      <CategoriesSection />
      <WhyUsSection />
      <InstagramSection />
      <CustomPosterSection />
    </>
  );
}
