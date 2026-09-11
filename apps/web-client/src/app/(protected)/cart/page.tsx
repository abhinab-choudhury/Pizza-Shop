"use client";

import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { formatRupees } from "@/lib/format";

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4">
        <ShoppingBag className="size-16 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-bold">Your cart is empty</h2>
        <p className="mt-2 text-muted-foreground">
            Add some delicious items to get started
          </p>
        <Button asChild className="mt-6">
          <Link href="/product">Browse Menu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <Button variant="ghost" size="sm" onClick={clearCart}>
          <Trash2 className="size-4" />
          Clear
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex size-16 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/pizza.svg"
                      alt=""
                      aria-hidden
                      className="size-10 object-contain"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatRupees(item.price)} each
                    </p>
                    {item.options && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {[
                          item.options.size,
                          ...(item.options.toppings ?? []),
                          ...(item.options.addOns ?? []),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-destructive"
                    aria-label={`Remove ${item.name}`}
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4 border-t pt-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      aria-label="Decrease quantity"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="size-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      aria-label="Increase quantity"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="size-3" />
                    </Button>
                  </div>

                  <span className="font-bold">
                    {formatRupees(item.price * item.quantity)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-20">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-bold">Order Summary</h2>
              <Separator />
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {item.name} x{item.quantity}
                      </span>
                      <span>{formatRupees(item.price * item.quantity)}</span>
                    </div>
                    {item.options && (
                      <p className="text-xs text-muted-foreground">
                        {[
                          item.options.size,
                          ...(item.options.toppings ?? []),
                          ...(item.options.addOns ?? []),
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatRupees(total)}</span>
              </div>
              <Button asChild className="w-full" size="lg">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/product">
                  <ArrowLeft className="size-4" />
                  Continue Shopping
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
