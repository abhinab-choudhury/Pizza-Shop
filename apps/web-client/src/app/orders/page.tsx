"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package } from "lucide-react";

const mockOrders = [
  {
    id: "ORD-001",
    items: [
      { name: "Margherita", quantity: 2, price: 12.99 },
      { name: "Pepperoni", quantity: 1, price: 14.99 },
    ],
    total: 40.97,
    status: "delivered",
    createdAt: "2024-01-15",
  },
  {
    id: "ORD-002",
    items: [
      { name: "BBQ Chicken", quantity: 1, price: 15.99 },
    ],
    total: 15.99,
    status: "preparing",
    createdAt: "2024-01-20",
  },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">My Orders</h1>

      {mockOrders.length === 0 ? (
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
          {mockOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">Order {order.id}</h3>
                    <p className="text-sm text-muted-foreground">
                      {order.createdAt}
                    </p>
                  </div>
                  <Badge className={statusColors[order.status]}>
                    {order.status}
                  </Badge>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.name} x{item.quantity}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    ${order.total.toFixed(2)}
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
