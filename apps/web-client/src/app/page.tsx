"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/contexts/cart-context";
import { ShoppingCart, ArrowRight } from "lucide-react";

const featuredPizzas = [
  {
    id: "1",
    name: "Margherita",
    description: "Classic tomato sauce, fresh mozzarella, basil",
    price: 12.99,
    category: "classic",
  },
  {
    id: "2",
    name: "Pepperoni",
    description: "Loaded with spicy pepperoni and melted cheese",
    price: 14.99,
    category: "classic",
  },
  {
    id: "3",
    name: "Hawaiian",
    description: "Sweet pineapple, ham, and mozzarella cheese",
    price: 14.99,
    category: "classic",
  },
];

export default function Home() {
  const { addItem } = useCart();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative flex min-h-[70vh] items-center justify-center bg-gradient-to-br from-red-500/10 via-orange-500/10 to-yellow-500/10">
        <div className="container mx-auto px-4 text-center">
          <span className="text-7xl">🍕</span>
          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
            Pinocchio&apos;s Pizza
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Fresh, handcrafted pizza made with love. Order online and
            get it delivered hot to your door.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/product">
                Browse Menu
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Pizzas */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-8 text-center text-3xl font-bold">Popular Pizzas</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {featuredPizzas.map((pizza) => (
            <Card key={pizza.id} className="overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center text-5xl">
                🍕
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold">{pizza.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {pizza.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-bold">
                    ${pizza.price.toFixed(2)}
                  </span>
                  <Button
                    size="sm"
                    onClick={() =>
                      addItem({
                        id: pizza.id,
                        name: pizza.name,
                        description: pizza.description,
                        price: pizza.price,
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
