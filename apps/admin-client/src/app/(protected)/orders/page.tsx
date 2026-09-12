"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Clock,
  ChefHat,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Loader,
  type LucideIcon,
} from "lucide-react";
import { api, getStoredToken, type ApiOrder } from "@/lib/api";

type Tab = "current" | "past";

const currentStatuses = new Set([
  "pending",
  "confirmed",
  "preparing",
  "ready",
]);

const statusMeta: Record<
  string,
  { label: string; icon: LucideIcon; className: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-100 text-amber-700",
  },
  confirmed: {
    label: "Confirmed",
    icon: ChefHat,
    className: "bg-blue-100 text-blue-700",
  },
  preparing: {
    label: "Preparing",
    icon: ChefHat,
    className: "bg-blue-100 text-blue-700",
  },
  ready: {
    label: "Ready for pickup",
    icon: ShoppingBag,
    className: "bg-purple-100 text-purple-700",
  },
  completed: {
    label: "Picked up",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-red-100 text-red-700",
  },
};

function formatMoney(cents: number): string {
  return `₹${(cents / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const NEXT_STATUSES: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

function OrderCard({
  order,
  onStatusChange,
}: {
  order: ApiOrder;
  onStatusChange: (id: string, status: string) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const meta = statusMeta[order.status] ?? {
    label: order.status.replace(/_/g, " "),
    icon: Clock,
    className: "bg-muted text-muted-foreground",
  };
  const StatusIcon = meta.icon;
  const nextStatuses = NEXT_STATUSES[order.status] ?? [];

  const handleStatusChange = async (status: string) => {
    if (status === order.status) return;
    setSaving(true);
    setUpdateError(null);
    try {
      await onStatusChange(order.id, status);
    } catch {
      setUpdateError("Couldn't update status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium">
            {order.customerName ?? "Guest"}
          </p>
          <p className="text-xs text-muted-foreground">
            #{order.id.slice(0, 8)}
            {order.customerEmail ? ` · ${order.customerEmail}` : ""}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${meta.className}`}
          >
            <StatusIcon className="size-3" />
            {meta.label}
          </span>

          {nextStatuses.length > 0 && (
            <select
              value={order.status}
              disabled={saving}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="rounded-md border bg-background px-2 py-1 text-xs font-medium text-muted-foreground outline-none transition-colors hover:border-primary focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value={order.status}>Update status…</option>
              {nextStatuses.map((s) => (
                <option key={s} value={s}>
                  {statusMeta[s]?.label ?? s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          )}

          {saving && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Loader className="size-3 animate-spin" />
              Updating…
            </span>
          )}
          {updateError && (
            <span className="text-xs text-destructive">{updateError}</span>
          )}
        </div>
      </div>

      <ul className="mt-3 space-y-1 text-sm">
        {order.items.map((item) => (
          <li
            key={item.id}
            className="text-muted-foreground"
          >
            <div className="flex justify-between">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatMoney(item.priceCents * item.quantity)}</span>
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
          </li>
        ))}
      </ul>

      <div className="mt-3 flex items-center justify-between border-t pt-3">
        <span className="text-xs text-muted-foreground">
          {new Date(order.createdAt).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>
        <span className="font-bold">
          Total{" "}
          <span className="text-primary">{formatMoney(order.totalCents)}</span>
        </span>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("current");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const token = getStoredToken();
    if (!token) return;
    api.orders
      .list(token)
      .then((items) => {
        if (cancelled) return;
        setOrders(items);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load orders");
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    const token = getStoredToken();
    if (!token) throw new Error("Not authenticated");
    const updated = await api.orders.updateStatus(token, id, status);
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
  };

  const currentOrders = orders.filter((o) => currentStatuses.has(o.status));
  const pastOrders = orders.filter((o) => !currentStatuses.has(o.status));
  const visibleOrders = activeTab === "current" ? currentOrders : pastOrders;

  const tabs: { value: Tab; label: string; count: number }[] = [
    { value: "current", label: "Current Orders", count: currentOrders.length },
    { value: "past", label: "Past Orders", count: pastOrders.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <ShoppingCart className="size-6 text-primary" />
          Orders
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track and review customer orders.
        </p>
      </div>

      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            {tab.label}
            <span
              className={`rounded-full px-1.5 py-0.5 text-xs ${
                activeTab === tab.value
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-background text-muted-foreground"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader className="size-5 animate-spin" />
          Loading orders...
        </div>
      ) : error ? (
        <div className="py-16 text-center text-destructive">{error}</div>
      ) : visibleOrders.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No {activeTab === "current" ? "active" : "past"} orders right now.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visibleOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}