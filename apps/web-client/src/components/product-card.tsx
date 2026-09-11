"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/cart-context";
import { cn } from "@/lib/utils";
import { Plus, Check, SlidersHorizontal, X } from "lucide-react";
import type { MenuProduct } from "@/lib/api";
import {
  isConfigurable,
  selectionPriceCents,
  lineKey,
  type ProductSelection,
} from "@/lib/product-config";
import { formatCentsRupees } from "@/lib/format";

const emptySelection: ProductSelection = { toppings: [], addOns: [] };

const categorySvg: Record<string, string> = {
  pizza: "/pizza.svg",
  sicilian: "/pizza.svg",
  subs: "/sandwich.svg",
  pasta: "/spaghetti.svg",
  salads: "/salad.svg",
  platters: "/platter.svg",
  toppings: "/pizza.svg",
  classic: "/pizza.svg",
  specialty: "/pizza.svg",
  vegetarian: "/salad.svg",
  dessert: "/pizza.svg",
};

const defaultCategorySvg = "/pizza.svg";

const categoryGradient: Record<string, string> = {
  pizza: "from-rose-100 via-orange-50 to-amber-100",
  sicilian: "from-red-100 via-rose-50 to-amber-100",
  subs: "from-amber-100 via-yellow-50 to-orange-100",
  pasta: "from-orange-100 via-red-50 to-rose-100",
  salads: "from-green-100 via-emerald-50 to-lime-100",
  platters: "from-orange-100 via-amber-50 to-yellow-100",
  toppings: "from-yellow-100 via-amber-50 to-orange-100",
  classic: "from-rose-100 via-orange-50 to-amber-100",
  specialty: "from-purple-100 via-fuchsia-50 to-pink-100",
  vegetarian: "from-green-100 via-emerald-50 to-lime-100",
  dessert: "from-pink-100 via-rose-50 to-fuchsia-100",
};

const defaultGradient = "from-rose-100 via-orange-50 to-amber-100";

export function ProductCard({ product }: { product: MenuProduct }) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [selection, setSelection] = useState<ProductSelection>(emptySelection);
  const [flashKey, setFlashKey] = useState<string | null>(null);

  const configurable = isConfigurable(product);

  function openConfig() {
    setSelection({
      size: product.sizes.length === 1 ? product.sizes[0] : undefined,
      toppings: [],
      addOns: [],
    });
    setConfigOpen(true);
  }

  function handleAdd(sel: ProductSelection = emptySelection) {
    const key = lineKey(product.id, sel);
    addItem({
      id: key,
      productId: product.id,
      name: product.name,
      description: product.description,
      price: selectionPriceCents(product, sel) / 100,
      category: product.category,
      imageUrl: product.imageUrl,
      options: {
        size: sel.size?.label,
        toppings: sel.toppings.length ? sel.toppings : undefined,
        addOns: sel.addOns.length ? sel.addOns : undefined,
      },
    });
    setFlashKey(key);
    setAdded(true);
    setConfigOpen(false);
    setTimeout(() => {
      setAdded(false);
      setFlashKey(null);
    }, 1500);
  }

  const selectedId = flashKey ?? product.id;
  const isInCart = items.some((i) => i.id === selectedId);

  const priceCents = configurable ? product.sizes[0]?.priceCents ?? product.priceCents : product.priceCents;
  const configPriceCents = configurable
    ? selectionPriceCents(product, {
        size: selection.size,
        toppings: selection.toppings,
        addOns: selection.addOns,
      })
    : priceCents;

  return (
    <>
      <Card className="overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        <div
          className={cn(
            "relative aspect-video flex items-center justify-center bg-gradient-to-br",
            categoryGradient[product.category] ?? defaultGradient,
          )}
        >
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={categorySvg[product.category] ?? defaultCategorySvg}
              alt={product.name}
              className="size-14 object-contain opacity-80"
            />
          )}
          {configurable && (
            <Badge className="absolute left-3 top-3 gap-1 shadow-sm">
              <SlidersHorizontal className="size-3" />
              Customizable
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-semibold">{product.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>
            </div>
            <Badge variant="secondary" className="shrink-0 capitalize">
              {product.category.replace(/-/g, " ")}
            </Badge>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-lg font-bold">
              {configurable
                ? `from ${formatCentsRupees(priceCents)}`
                : formatCentsRupees(product.priceCents)}
            </span>
            <Button
              size="sm"
              onClick={() => (configurable ? openConfig() : handleAdd())}
              variant={isInCart ? "secondary" : "default"}
            >
              {added && isInCart ? (
                <>
                  <Check className="size-4" />
                  Added
                </>
              ) : configurable ? (
                <>
                  <SlidersHorizontal className="size-4" />
                  Customize
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  Add
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {configOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
          onClick={() => setConfigOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-xl bg-background p-6 shadow-xl sm:max-w-md sm:rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">{product.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {product.description}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                aria-label="Close"
                onClick={() => setConfigOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>

            {product.sizes.length > 1 && (
              <div className="mb-5">
                <p className="mb-2 text-sm font-semibold">Size</p>
                <div className="flex gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size.label}
                      type="button"
                      onClick={() =>
                        setSelection((s) => ({ ...s, size }))
                      }
                      className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                        selection.size?.label === size.label
                          ? "border-primary bg-primary/5 text-primary"
                          : "hover:bg-muted"
                      }`}
                    >
                      <span className="block">{size.label}</span>
                      <span className="block text-xs font-normal text-muted-foreground">
                        {formatCentsRupees(size.priceCents)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.toppings.length > 0 && (
              <div className="mb-5">
                <p className="mb-2 text-sm font-semibold">Toppings</p>
                <p className="mb-3 text-xs text-muted-foreground">
                  {formatCentsRupees(product.toppings[0]?.priceCents ?? 0)} each
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.toppings.map((topping) => {
                    const selected = selection.toppings.includes(topping.name);
                    return (
                      <button
                        key={topping.name}
                        type="button"
                        onClick={() =>
                          setSelection((s) => ({
                            ...s,
                            toppings: selected
                              ? s.toppings.filter((t) => t !== topping.name)
                              : [...s.toppings, topping.name],
                          }))
                        }
                        className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        {topping.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {product.addOns.length > 0 && (
              <div className="mb-5">
                <p className="mb-2 text-sm font-semibold">Add-ons</p>
                <div className="flex flex-wrap gap-2">
                  {product.addOns.map((addOn) => {
                    const selected = selection.addOns.includes(addOn.name);
                    return (
                      <button
                        key={addOn.name}
                        type="button"
                        onClick={() =>
                          setSelection((s) => ({
                            ...s,
                            addOns: selected
                              ? s.addOns.filter((a) => a !== addOn.name)
                              : [...s.addOns, addOn.name],
                          }))
                        }
                        className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        {addOn.name} · {formatCentsRupees(addOn.priceCents)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <p className="text-xs text-muted-foreground">Price</p>
                <p className="text-lg font-bold text-primary">
                  {formatCentsRupees(configPriceCents)}
                </p>
              </div>
              <Button onClick={() => handleAdd(selection)}>
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}