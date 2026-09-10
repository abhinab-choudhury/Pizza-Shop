"use client";

import { CheckoutForm } from "@/components/checkout-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/cart">
            <ArrowLeft className="size-4" />
            Back to Cart
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="mt-2 text-muted-foreground">
          Complete your order details below
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <CheckoutForm />
      </div>
    </div>
  );
}
