import type { MenuProduct } from "@/lib/api";

export interface ProductSelection {
  size?: { label: string; priceCents: number };
  toppings: string[];
  addOns: string[];
}

export function isConfigurable(product: MenuProduct): boolean {
  return (
    product.sizes.length > 0 ||
    product.toppings.length > 0 ||
    product.addOns.length > 0
  );
}

export function selectionPriceCents(
  product: MenuProduct,
  selection: ProductSelection,
): number {
  const base =
    selection.size?.priceCents ?? product.priceCents;

  const toppingCost = product.toppings
    .filter((t) => selection.toppings.includes(t.name))
    .reduce((sum, t) => sum + t.priceCents, 0);

  const addOnCost = product.addOns
    .filter((a) => selection.addOns.includes(a.name))
    .reduce((sum, a) => sum + a.priceCents, 0);

  return base + toppingCost + addOnCost;
}

export function lineKey(
  productId: string,
  selection: ProductSelection,
): string {
  const parts = [
    selection.size?.label,
    selection.toppings.length
      ? selection.toppings.slice().sort().join(",")
      : undefined,
    selection.addOns.length
      ? selection.addOns.slice().sort().join(",")
      : undefined,
  ].filter(Boolean);

  return parts.length ? `${productId}|${parts.join("|")}` : productId;
}