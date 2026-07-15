import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import {
  STACK_BLUR_PX_BY_POSITION,
  STACK_OPACITY_BY_POSITION,
  STACK_STEP_SCALE,
  STACK_STEP_Y_PX,
  MAX_VISIBLE_CARDS,
} from "../constants";
import type { StackItem, StackVisualStyle } from "../types";

export function mapProductToStackItem(product: Product): StackItem {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    imageUrl: product.image_url,
    priceLabel: formatPrice(product.price_30x40),
  };
}

export function mapProductsToStackItems(
  products: readonly Product[],
): StackItem[] {
  return products
    .filter((p) => Boolean(p.image_url))
    .map(mapProductToStackItem);
}

export function rotateOrderForward(order: readonly number[]): number[] {
  if (order.length <= 1) return [...order];
  return [...order.slice(1), order[0]];
}

export function rotateOrderBackward(order: readonly number[]): number[] {
  if (order.length <= 1) return [...order];
  return [order[order.length - 1], ...order.slice(0, order.length - 1)];
}

export function rotateOrderToFront(
  order: readonly number[],
  targetOriginalIndex: number,
): number[] {
  const pos = order.indexOf(targetOriginalIndex);
  if (pos <= 0) return [...order];
  return [...order.slice(pos), ...order.slice(0, pos)];
}

export function getStackVisualStyle(
  position: number,
  reducedMotion: boolean,
): StackVisualStyle {
  const clamped = Math.min(position, STACK_OPACITY_BY_POSITION.length - 1);
  const opacity = STACK_OPACITY_BY_POSITION[clamped] ?? 0;
  const blurPx = reducedMotion ? 0 : (STACK_BLUR_PX_BY_POSITION[clamped] ?? 0);
  const scale = 1 - position * STACK_STEP_SCALE;
  const y = position * STACK_STEP_Y_PX;
  const zIndex = MAX_VISIBLE_CARDS - position;
  return { y, scale, opacity, blurPx, zIndex };
}
