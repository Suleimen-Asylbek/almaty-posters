import { mapProductsToStackItems } from "./utils/stackMath";
import { StackCarousel } from "./StackCarousel";
import type { HeroStageProps } from "./types";

export function HeroStage({
  products,
  className,
  viewportClassName,
}: HeroStageProps) {
  const items = mapProductsToStackItems(products);

  return (
    <StackCarousel
      items={items}
      className={className}
      viewportClassName={viewportClassName ?? "aspect-[3/4] max-w-[420px]"}
    />
  );
}
