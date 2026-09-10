"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/cart-context";
import { Plus, Check } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
}

export function ProductCard({ id, name, description, price, category, imageUrl }: ProductCardProps) {
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);
  const isInCart = items.some((i) => i.id === id);

  const handleAdd = () => {
    addItem({ id, name, description, price, category, imageUrl });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="aspect-video bg-muted flex items-center justify-center text-4xl">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          "🍕"
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold">{name}</h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0 capitalize">
            {category}
          </Badge>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold">${price.toFixed(2)}</span>
          <Button size="sm" onClick={handleAdd} variant={isInCart ? "secondary" : "default"}>
            {added ? (
              <>
                <Check className="size-4" />
                Added
              </>
            ) : (
              <>
                <Plus className="size-4" />
                Add to Cart
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
