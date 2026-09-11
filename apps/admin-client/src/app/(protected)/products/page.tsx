"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Plus, Loader2, Pencil, Trash2 } from "lucide-react";
import { api, getStoredToken, type ApiProduct } from "@/lib/api";
import { Button } from "@/components/ui/button";

function formatPrice(cents: number): string {
  return `₹${(cents / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    const token = getStoredToken();
    const req = token
      ? api.products.list(token)
      : Promise.reject(new Error("Not authenticated"));

    req
      .then((res) => {
        setProducts(res.products);
        setError(null);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load"),
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (product: ApiProduct) => {
    if (!window.confirm(`Delete "${product.name}" from the catalog?`)) return;
    const token = getStoredToken();
    if (!token) return;
    try {
      await api.products.remove(token, product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} product{products.length === 1 ? "" : "s"} in
            your catalog
          </p>
        </div>
        <Button asChild>
          <Link href="/products/new">
            <Plus className="size-4" />
            Add Product
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : products.length === 0 ? (
        <div className="rounded-lg border bg-background py-16 text-center">
          <Package className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No products yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first product to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="rounded-lg border bg-background p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium">{p.name}</h3>
                <span className="text-sm font-semibold text-primary">
                  {formatPrice(p.priceCents)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {p.category}
              </p>
              {p.description && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {p.description}
                </p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    p.isAvailable
                      ? "bg-green-100 text-green-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {p.isAvailable ? "Available" : "Hidden"}
                </span>
                <div className="flex items-center gap-1">
                  <Button asChild variant="ghost" size="icon-sm">
                    <Link href={`/products/${p.id}`} aria-label={`Edit ${p.name}`}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(p)}
                    aria-label={`Delete ${p.name}`}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}