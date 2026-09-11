"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/contexts/cart-context";
import { api, type MenuProduct } from "@/lib/api";
import { formatCentsRupees } from "@/lib/format";
import {
  ShoppingCart,
  ArrowRight,
  Flame,
  Leaf,
  Store,
  Clock,
  Pizza,
} from "lucide-react";

const highlights = [
  { icon: Flame, label: "Wood-fired" },
  { icon: Leaf, label: "Fresh ingredients" },
  { icon: Store, label: "Take away" },
  { icon: Clock, label: "Open late" },
];

export default function Home() {
  const { addItem } = useCart();
  const [featured, setFeatured] = useState<MenuProduct[]>([]);

  useEffect(() => {
    let cancelled = false;
    api.products
      .getAll()
      .then((products) => {
        if (cancelled) return;
        const popular = products.filter((p) =>
          ["pizza", "sicilian", "subs"].includes(p.category),
        );
        setFeatured(
          (popular.length ? popular : products).slice(0, 3),
        );
      })
      .catch(() => {
        if (!cancelled) setFeatured([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative flex min-h-[70vh] items-center justify-center bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10">
        <div className="container mx-auto px-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/pizza.svg"
            alt="Pinocchio's Pizza"
            className="mx-auto size-20 drop-shadow-md sm:size-28"
          />
          <h1 className="mt-6 bg-gradient-to-r from-green-700 via-emerald-600 to-green-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-7xl">
            Pinocchio&apos;s Pizza
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Fresh, handcrafted pizza made with love. Order online for
            take-away — hot and ready at our counter.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/product">
                Browse Menu
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>

          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {highlights.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 text-sm font-medium text-muted-foreground"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-8 flex items-center justify-center gap-2 text-center text-3xl font-bold">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Pizza className="size-5" />
          </span>
          Popular Picks
        </h2>
        <div className="grid gap-6 md:grid-cols-3 max-w-7xl mx-auto">
          {featured.map((pizza) => (
            <Card key={pizza.id} className="overflow-hidden">
              <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-rose-100 via-orange-50 to-amber-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/pizza.svg"
                  alt={pizza.name}
                  className="size-16 object-contain opacity-80"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold">{pizza.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {pizza.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-bold">
                    {pizza.sizes.length > 0
                      ? `from ${formatCentsRupees(pizza.priceCents)}`
                      : formatCentsRupees(pizza.priceCents)}
                  </span>
                  <Button
                    size="sm"
                    onClick={() =>
                      addItem({
                        id: pizza.id,
                        productId: pizza.id,
                        name: pizza.name,
                        description: pizza.description,
                        price: pizza.sizes[0]?.priceCents
                          ? pizza.sizes[0].priceCents / 100
                          : pizza.priceCents / 100,
                        category: pizza.category,
                      })
                    }
                  >
                    <ShoppingCart className="size-4" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}