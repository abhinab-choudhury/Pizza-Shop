"use client";

import { useState } from "react";
import { ProductCard } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

const mockPizzas = [
  {
    id: "1",
    name: "Margherita",
    description: "Classic tomato sauce, fresh mozzarella, basil, and olive oil on a thin crust",
    price: 12.99,
    category: "classic",
  },
  {
    id: "2",
    name: "Pepperoni",
    description: "Loaded with spicy pepperoni slices and generous melted mozzarella",
    price: 14.99,
    category: "classic",
  },
  {
    id: "3",
    name: "Hawaiian",
    description: "Sweet pineapple chunks, smoky ham, and mozzarella cheese",
    price: 14.99,
    category: "classic",
  },
  {
    id: "4",
    name: "Veggie Supreme",
    description: "Bell peppers, mushrooms, onions, olives, and tomatoes",
    price: 13.99,
    category: "vegetarian",
  },
  {
    id: "5",
    name: "BBQ Chicken",
    description: "Grilled chicken, BBQ sauce, red onions, and cilantro",
    price: 15.99,
    category: "specialty",
  },
  {
    id: "6",
    name: "Meat Lovers",
    description: "Pepperoni, sausage, bacon, ham, and ground beef",
    price: 16.99,
    category: "specialty",
  },
  {
    id: "7",
    name: "Four Cheese",
    description: "Mozzarella, parmesan, gorgonzola, and ricotta blend",
    price: 14.99,
    category: "specialty",
  },
  {
    id: "8",
    name: "Chocolate Dessert Pizza",
    description: "Nutella, fresh strawberries, banana slices, and powdered sugar",
    price: 9.99,
    category: "dessert",
  },
];

const categories = ["all", "classic", "specialty", "vegetarian", "dessert"];

export default function ProductPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filtered = mockPizzas.filter((pizza) => {
    const matchesSearch =
      pizza.name.toLowerCase().includes(search.toLowerCase()) ||
      pizza.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || pizza.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Our Menu</h1>
        <p className="mt-2 text-muted-foreground">
          Fresh, handcrafted pizzas made to order
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search pizzas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Badge
            key={cat}
            variant={selectedCategory === cat ? "default" : "secondary"}
            className="cursor-pointer capitalize"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>

      {/* Products Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          No pizzas found. Try a different search.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((pizza) => (
            <ProductCard key={pizza.id} {...pizza} />
          ))}
        </div>
      )}
    </div>
  );
}
