"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Loader, WifiOff, RefreshCw } from "lucide-react";
import { api, type ApiOrder } from "@/lib/api";
import { formatRupees } from "@/lib/format";

const statusVariants: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending: "secondary",
  confirmed: "outline",
  preparing: "default",
  ready: "default",
  completed: "secondary",
  cancelled: "destructive",
};

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(() => {
    api.orders
      .getAll()
      .then((items) => {
        setOrders(items);
        setError(null);
      })
      .catch(() => {
        setError("We couldn't reach the kitchen right now");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">My Orders</h1>

      {isLoading ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center text-muted-foreground">
          <Loader className="size-10 animate-spin" />
          <p className="mt-4">Loading orders...</p>
        </div>
      ) : error ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-muted">
            <WifiOff className="size-9 text-muted-foreground" />
          </div>
          <h2 className="mt-6 text-2xl font-bold">Couldn&apos;t load your orders</h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            {error}. Please check your connection and try again — your tasty
            treats are still waiting at the counter.
          </p>
          <Button
            className="mt-6"
            onClick={() => {
              setIsLoading(true);
              loadOrders();
            }}
          >
            <RefreshCw className="mr-2 size-4" />
            Try again
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center">
          <Package className="size-16 text-muted-foreground" />
          <h2 className="mt-4 text-2xl font-bold">No orders yet</h2>
          <p className="mt-2 text-muted-foreground">
            Place your first order to see it here
          </p>
          <Button asChild className="mt-6">
            <Link href="/product">Browse Menu</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">
                      Order #{order.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <Badge
                    variant={statusVariants[order.status] ?? "secondary"}
                    className="shrink-0 capitalize"
                  >
                    {formatStatus(order.status)}
                  </Badge>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {item.name} x{item.quantity}
                        </span>
                        <span>
                          {formatRupees(item.price * item.quantity)}
                        </span>
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

                <Separator className="my-4" />

                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatRupees(order.total)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}