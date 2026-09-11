"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api, type MenuProduct } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Search,
  Pizza,
  Sparkles,
  Leaf,
  CakeSlice,
  Flame,
  Sandwich,
  UtensilsCrossed,
  Salad,
  ChefHat,
  Loader,
  Store,
  type LucideIcon,
} from "lucide-react";

const categoryIcons: Record<string, LucideIcon> = {
  pizza: Pizza,
  sicilian: Flame,
  subs: Sandwich,
  pasta: UtensilsCrossed,
  salads: Salad,
  platters: ChefHat,
  classic: Pizza,
  specialty: Sparkles,
  vegetarian: Leaf,
  dessert: CakeSlice,
};

const categoryLabels: Record<string, string> = {
  pizza: "Pizza",
  sicilian: "Sicilian Pizza",
  subs: "Subs",
  pasta: "Pasta",
  salads: "Salads",
  platters: "Dinner Platters",
  classic: "Classic",
  specialty: "Specialty",
  vegetarian: "Vegetarian",
  dessert: "Dessert",
};

const defaultCategoryIcon: LucideIcon = Pizza;

function toCategoryList(products: MenuProduct[]) {
  const seen = new Set<string>();
  const categories: { value: string; label: string; icon: LucideIcon; count: number }[] = [];

  for (const product of products) {
    if (seen.has(product.category)) continue;
    seen.add(product.category);
    const Icon = categoryIcons[product.category] ?? defaultCategoryIcon;
    categories.push({
      value: product.category,
      label: categoryLabels[product.category] ?? product.category,
      icon: Icon,
      count: 0,
    });
  }

  for (const product of products) {
    const entry = categories.find((c) => c.value === product.category);
    if (entry) entry.count += 1;
  }

  return categories;
}

export default function ProductPage() {
  const [products, setProducts] = useState<MenuProduct[]>([]);
  const [categories, setCategories] = useState<{ value: string; label: string; icon: LucideIcon; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Toppings are add-ons attached to pizzas - they are not sold standalone.
  const menuProducts = products;

  useEffect(() => {
    let cancelled = false;
    api.products
      .getAll()
      .then((items) => {
        if (cancelled) return;
        const visible = items.filter((p) => p.category !== "toppings");
        setProducts(visible);
        setCategories(toCategoryList(visible));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Failed to load the menu",
        );
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = menuProducts.filter((pizza) => {
    const matchesSearch =
      pizza.name.toLowerCase().includes(search.toLowerCase()) ||
      pizza.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || pizza.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero header */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-8 sm:p-10">
        <div className="pointer-events-none absolute -right-8 -top-10 w-40 opacity-15 select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/pizza.svg" alt="" aria-hidden />
        </div>
        <div className="relative max-w-lg">
          <Badge variant="secondary" className="mb-4 gap-1.5">
            <Store className="size-3.5" />
            Take-away only · Hot &amp; ready to collect
          </Badge>
          <h1 className="text-3xl font-bold sm:text-4xl">Our Menu</h1>
          <p className="mt-2 text-muted-foreground">
            Fresh, handcrafted pizzas — choose your size and pile on toppings,
            subs, pastas, salads and platters made to order.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search the menu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "gap-1.5",
            selectedCategory !== "all" && "text-muted-foreground hover:text-foreground",
          )}
        >
          <Pizza className="size-3.5" />
          All
          <span className="rounded-full bg-background/40 px-1.5 text-xs opacity-80">
            {menuProducts.length}
          </span>
        </Button>
        {categories.map(({ value, label, icon: Icon, count }) => (
          <Button
            key={value}
            variant={selectedCategory === value ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(value)}
            className={cn(
              "gap-1.5",
              selectedCategory !== value && "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" />
            {label}
            <span
              className={cn(
                "rounded-full px-1.5 text-xs",
                selectedCategory === value
                  ? "bg-background/40"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {count}
            </span>
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader className="size-5 animate-spin" />
          Loading menu...
        </div>
      ) : error ? (
        <div className="py-16 text-center text-destructive">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          No items found. Try a different search.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((pizza) => (
            <ProductCard key={pizza.id} product={pizza} />
          ))}
        </div>
      )}
    </div>
  );
}