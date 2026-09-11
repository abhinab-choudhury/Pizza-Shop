"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { api, getStoredToken, type ApiProduct, type CreateProductInput } from "@/lib/api";
import ProductForm from "@/components/product-form";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [initial, setInitial] = useState<ApiProduct | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    const req = token
      ? api.products.get(token, id)
      : Promise.reject(new Error("Not authenticated"));

    req
      .then(setInitial)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load product"),
      )
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  if (error || !initial) {
    return <p className="text-sm text-destructive">{error ?? "Product not found"}</p>;
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update {initial.name} in your catalog.
        </p>
      </div>
      <ProductForm
        initial={initial}
        submitLabel="Save Changes"
        onSubmit={async (input: CreateProductInput) => {
          const token = getStoredToken();
          if (!token) throw new Error("Not authenticated");
          await api.products.update(token, id, input);
          router.push("/products");
        }}
      />
    </div>
  );
}