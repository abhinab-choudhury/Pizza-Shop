import express, { type Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { orders, type orders as OrdersTable } from "../db/schema";
import { verifyJwt, requireAdmin } from "../middleware/auth";

const router: Router = express.Router();

const orderItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(255),
  quantity: z.number().int().min(1),
  priceCents: z.number().int().min(0),
  options: z
    .object({
      size: z.string().max(100).optional(),
      toppings: z.array(z.string().max(255)).optional(),
      addOns: z.array(z.string().max(255)).optional(),
    })
    .optional(),
});

const createOrderSchema = z.object({
  customerName: z.string().max(255).optional(),
  customerEmail: z
    .string()
    .max(255)
    .email()
    .or(z.literal(""))
    .transform((value) => (value === "" ? undefined : value))
    .optional(),
  items: z
    .array(orderItemSchema)
    .min(1, "Order must contain at least one item"),
  address: z.string().max(2000).optional(),
  paymentMethod: z
    .enum(["cash", "upi"], {
      message: "Invalid payment method",
    })
    .optional()
    .default("cash"),
});

type OrderRow = typeof OrdersTable.$inferSelect;

const ALLOWED_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "completed",
  "cancelled",
] as const;

type OrderStatusValue = (typeof ALLOWED_STATUSES)[number];

const ALLOWED_TRANSITIONS: Record<OrderStatusValue, OrderStatusValue[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

const updateOrderSchema = z.object({
  status: z.enum(ALLOWED_STATUSES, {
    message: "Invalid order status",
  }),
});

function toOrderResponse(order: OrderRow) {
  return {
    id: order.id,
    userId: order.userId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    items: order.items.map((item) => ({
      ...item,
      price: item.priceCents / 100,
    })),
    address: order.address,
    paymentMethod: order.paymentMethod,
    totalCents: order.totalCents,
    total: order.totalCents / 100,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

// List orders (authenticated users see only their own, admins see all)
router.get("/", verifyJwt, async (req, res) => {
  const { status: statusParam } = req.query;

  const status =
    typeof statusParam === "string" &&
    ALLOWED_STATUSES.includes(statusParam as OrderStatusValue)
      ? (statusParam as OrderStatusValue)
      : undefined;

  const isAdmin = res.locals.role === "admin";
  const userId = res.locals.userId as string | undefined;

  const conditions = [];
  if (status) {
    conditions.push(eq(orders.status, status));
  }
  if (!isAdmin && userId) {
    conditions.push(eq(orders.userId, userId));
  }

  const rows = await db
    .select()
    .from(orders)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt));

  res.json({ orders: rows.map(toOrderResponse) });
});

// Get single order (auth required; non-admins may only fetch their own)
router.get("/:id", verifyJwt, async (req, res) => {
  const id = req.params.id as string;

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) {
    res
      .status(404)
      .json({ error: { code: "NOT_FOUND", message: "Order not found" } });
    return;
  }

  const isAdmin = res.locals.role === "admin";
  if (!isAdmin && order.userId !== res.locals.userId) {
    res
      .status(403)
      .json({ error: { code: "FORBIDDEN", message: "Access denied" } });
    return;
  }

  res.json({ order: toOrderResponse(order) });
});

// Create order (authenticated users only, placed from checkout)
router.post("/", verifyJwt, async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message ?? "Invalid input",
      },
    });
    return;
  }

  const data = parsed.data;
  const totalCents = data.items.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0,
  );

  const [order] = await db
    .insert(orders)
    .values({
      userId: res.locals.userId,
      customerName: data.customerName ?? null,
      customerEmail: data.customerEmail ?? null,
      items: data.items,
      address: data.address,
      paymentMethod: data.paymentMethod,
      totalCents,
      status: "pending",
    })
    .returning();

  if (!order) {
    res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: "Failed to create order" },
    });
    return;
  }

  res.status(201).json({ order: toOrderResponse(order) });
});

// Update order status (admin only, take-away fulfilment flow)
router.patch("/:id", verifyJwt, requireAdmin, async (req, res) => {
  const parsed = updateOrderSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.issues[0]?.message ?? "Invalid input",
      },
    });
    return;
  }

  const id = req.params.id as string;

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);

  if (!order) {
    res
      .status(404)
      .json({ error: { code: "NOT_FOUND", message: "Order not found" } });
    return;
  }

  const nextStatus = parsed.data.status;

  if (
    order.status !== nextStatus &&
    !ALLOWED_TRANSITIONS[order.status].includes(nextStatus)
  ) {
    res.status(409).json({
      error: {
        code: "INVALID_TRANSITION",
        message: `Cannot change order from "${order.status}" to "${nextStatus}"`,
      },
    });
    return;
  }

  const [updated] = await db
    .update(orders)
    .set({ status: nextStatus, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning();

  if (!updated) {
    res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: "Failed to update order" },
    });
    return;
  }

  res.json({ order: toOrderResponse(updated) });
});

export default router;