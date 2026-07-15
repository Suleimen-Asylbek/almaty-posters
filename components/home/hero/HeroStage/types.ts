import type { Product } from "@/lib/types";

export interface StackItem {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly imageUrl: string;
  readonly priceLabel: string;
}

export interface HeroStageProps {
  readonly products: readonly Product[];
  readonly className?: string;
  readonly viewportClassName?: string;
}

export interface StackVisualStyle {
  readonly y: number;
  readonly scale: number;
  readonly opacity: number;
  readonly blurPx: number;
  readonly zIndex: number;
}
