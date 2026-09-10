"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/cart-context";
import { useRouter } from "next/navigation";

export function CheckoutForm() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      setError("Please enter a delivery address");
      return;
    }
    if (items.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate order placement (will connect to order-service later)
    await new Promise((r) => setTimeout(r, 1500));
    clearCart();
    router.push("/orders");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Delivery Address</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter your full delivery address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { value: "cash", label: "Cash on Delivery" },
            { value: "card", label: "Credit / Debit Card" },
            { value: "upi", label: "UPI" },
          ].map((method) => (
            <label
              key={method.value}
              className="flex items-center gap-3 rounded-md border p-3 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input
                type="radio"
                name="payment"
                value={method.value}
                checked={paymentMethod === method.value}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="accent-primary"
              />
              <span className="text-sm font-medium">{method.label}</span>
            </label>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.name} x{item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? "Placing Order..." : "Place Order"}
      </Button>
    </form>
  );
}
