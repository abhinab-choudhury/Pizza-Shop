"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, getStoredToken } from "@/lib/api";
import ProductForm from "@/components/product-form";

export default function NewProductPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add Product</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new item to your catalog.
        </p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <ProductForm
        submitLabel="Create Product"
        onSubmit={async (input) => {
          const token = getStoredToken();
          if (!token) {
            setError("Not authenticated");
            throw new Error("Not authenticated");
          }
          await api.products.create(token, input);
          router.push("/products");
        }}
      />
    </div>
  );
}