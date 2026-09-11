"use client";

import Link from "next/link";
import { PackagePlus, Package } from "lucide-react";
import { useAdminAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user } = useAdminAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.name ?? "Admin"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your pizza shop from here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border bg-background p-6">
          <div className="flex items-center gap-2 text-sm font-medium">
            <PackagePlus className="size-5 text-primary" />
            Add a new product
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a pizza, side or drink and make it available in your
            shop right away.
          </p>
          <Button asChild className="mt-4">
            <Link href="/products/new">
              <PackagePlus className="size-4" />
              Add Product
            </Link>
          </Button>
        </div>

        <div className="rounded-lg border bg-background p-6">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Package className="size-5 text-primary" />
            Manage your catalog
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            View everything currently in your product catalog.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/products">
              <Package className="size-4" />
              View Products
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}