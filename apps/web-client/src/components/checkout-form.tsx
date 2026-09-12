"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { formatRupees } from "@/lib/format";
import { loadRazorpay, openRazorpay } from "@/lib/razorpay";
import {
  Store,
  Wallet,
  ReceiptText,
  HandCoins,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

const PAYMENT_METHODS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "cash", label: "Cash on Pickup", icon: HandCoins },
  { value: "upi", label: "Turbo UPI", icon: Smartphone },
];

export function CheckoutForm() {
  const { items, total, clearCart } = useCart();
  const { token: accessToken } = useAuth();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!accessToken) {
        throw new Error("You must be signed in to place an order");
      }

      const order = await api.orders.create(
        accessToken,
        {
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            priceCents: Math.round(item.price * 100),
            options: item.options,
          })),
          paymentMethod,
        },
      );

      if (paymentMethod !== "upi") {
        clearCart();
        router.push("/orders");
        return;
      }

      const pay = await api.payments.createOrder(order.id, order.totalCents);

      const RazorpayCtor = await loadRazorpay();
      if (!RazorpayCtor) {
        setError("Couldn't load the payment gateway. Please try again.");
        setIsLoading(false);
        return;
      }

      const rzp = openRazorpay({
        key: pay.keyId,
        order_id: pay.id,
        amount: pay.amount,
        currency: pay.currency,
        name: "Pinocchio's Pizza",
        description: `Order #${order.id.slice(0, 8)} · Turbo UPI`,
        prefill: { method: "upi" },
        method: { upi: true },
        theme: { color: "#e11d48" },
        modal: {
          ondismiss: () => {
            setError("Payment was cancelled. Your order is still pending.");
            setIsLoading(false);
          },
        },
        handler: async (response) => {
          try {
            await api.payments.verify(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
            );
            clearCart();
            router.push("/orders");
          } catch {
            setError(
              "Payment verification failed. Please contact us with your order number.",
            );
            setIsLoading(false);
          }
        },
      });

      if (!rzp) {
        setError("Couldn't start payment. Please try again.");
        setIsLoading(false);
        return;
      }

      rzp.on("payment.failed", (response) => {
        const error = (response as {
          error?: { code?: string; description?: string };
        }).error;
        setError(
          error?.description ?? error?.code ?? "Payment failed. Please try again.",
        );
        setIsLoading(false);
      });

      rzp.open();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to place your order",
      );
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-start gap-3 rounded-md border bg-primary/5 p-4 text-sm">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Store className="size-4" />
        </span>
        <div>
          <p className="font-semibold">Take-away pick-up</p>
          <p className="mt-0.5 text-muted-foreground">
            No delivery — your order will be hot and ready at our counter. Pay
            by cash on pickup or pay online instantly with Turbo UPI.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Wallet className="size-4" />
            </span>
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {PAYMENT_METHODS.map((method) => {
            const Icon = method.icon;
            return (
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
                <span className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Icon className="size-4" />
                </span>
                <span className="text-sm font-medium">{method.label}</span>
              </label>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <ReceiptText className="size-4" />
            </span>
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
          <Separator />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span className="text-primary">{formatRupees(total)}</span>
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