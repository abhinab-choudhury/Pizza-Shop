import { Hono, type Context } from "hono";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { deliveries, deliveryZones, riders } from "../db/schema";
import {
  verifyJwt,
  requireRole,
  isAdmin,
  type AuthVariables,
} from "../middleware/auth";

const router = new Hono<{ Variables: AuthVariables }>();

export const DELIVERY_STATUS = [
  "pending",
  "assigned",
  "accepted",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

export type DeliveryStatus = (typeof DELIVERY_STATUS)[number];

const TERMINAL = new Set<DeliveryStatus>(["delivered", "cancelled"]);

const createDeliverySchema = z.object({
  orderId: z.string().uuid("orderId must be a valid UUID"),
  zoneId: z.string().uuid("zoneId must be a valid UUID").optional(),
  customerName: z.string().min(1, "Customer name is required").max(255),
  customerPhone: z.string().min(1, "Customer phone is required").max(20),
  deliveryAddress: z.string().min(1, "Delivery address is required"),
  deliveryNote: z.string().max(1000).optional(),
  feeCents: z.number().int().min(0).default(0),
  etaMinutes: z.number().int().min(1).optional(),
});

const assignDeliverySchema = z.object({
  riderId: z.string().uuid("riderId must be a valid UUID"),
});

const cancelDeliverySchema = z.object({
  reason: z.string().max(500).optional(),
});

type DeliveryRow = typeof deliveries.$inferSelect;
type RiderRow = typeof riders.$inferSelect;

function toDeliveryResponse(
  delivery: DeliveryRow,
  extra?: { riderName?: string | null; zoneName?: string | null },
) {
  return {
    id: delivery.id,
    orderId: delivery.orderId,
    zoneId: delivery.zoneId,
    zoneName: extra?.zoneName ?? null,
    riderId: delivery.riderId,
    riderName: extra?.riderName ?? null,
    status: delivery.status,
    customerName: delivery.customerName,
    customerPhone: delivery.customerPhone,
    deliveryAddress: delivery.deliveryAddress,
    deliveryNote: delivery.deliveryNote,
    feeCents: delivery.feeCents,
    etaMinutes: delivery.etaMinutes,
    assignedAt: delivery.assignedAt,
    acceptedAt: delivery.acceptedAt,
    pickedUpAt: delivery.pickedUpAt,
    deliveredAt: delivery.deliveredAt,
    cancelledAt: delivery.cancelledAt,
    cancelledReason: delivery.cancelledReason,
    createdAt: delivery.createdAt,
    updatedAt: delivery.updatedAt,
  };
}

async function findRiderByUserId(userId: string): Promise<RiderRow | undefined> {
  const [rider] = await db
    .select()
    .from(riders)
    .where(eq(riders.userId, userId))
    .limit(1);
  return rider;
}

async function findDelivery(id: string): Promise<DeliveryRow | undefined> {
  const [delivery] = await db
    .select()
    .from(deliveries)
    .where(eq(deliveries.id, id))
    .limit(1);
  return delivery;
}

function enrich(deliveriesList: DeliveryRow[]) {
  return Promise.all(
    deliveriesList.map(async (delivery) => {
      const [rider] = delivery.riderId
        ? await db
            .select({ name: riders.name })
            .from(riders)
            .where(eq(riders.id, delivery.riderId))
            .limit(1)
        : [];
      const [zone] = delivery.zoneId
        ? await db
            .select({ name: deliveryZones.name })
            .from(deliveryZones)
            .where(eq(deliveryZones.id, delivery.zoneId))
            .limit(1)
        : [];
      return toDeliveryResponse(delivery, {
        riderName: rider?.name,
        zoneName: zone?.name,
      });
    }),
  );
}

// List deliveries (agent sees own; admin sees all)
router.get("/", verifyJwt, async (c) => {
  const status = c.req.query("status");
  const statusFilter: string[] = status
    ? status.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const conditions = [];
  if (statusFilter.length > 0) {
    for (const s of statusFilter) {
      if (!DELIVERY_STATUS.includes(s as DeliveryStatus)) {
        return c.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: `Invalid status: ${s}`,
            },
          },
          400,
        );
      }
    }
    conditions.push(sql`${deliveries.status} = any(${statusFilter}::varchar[])`);
  }

  if (!isAdmin(c)) {
    const rider = await findRiderByUserId(c.get("userId"));
    if (!rider) {
      return c.json({ deliveries: [] });
    }
    conditions.push(eq(deliveries.riderId, rider.id));
  } else {
    const riderId = c.req.query("riderId");
    if (riderId) conditions.push(eq(deliveries.riderId, riderId));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select()
    .from(deliveries)
    .where(where)
    .orderBy(deliveries.createdAt);

  return c.json({ deliveries: await enrich(rows) });
});

// Get single delivery (agent sees own; admin sees any)
router.get("/:id", verifyJwt, async (c) => {
  const id = c.req.param("id");
  const delivery = await findDelivery(id);

  if (!delivery) {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Delivery not found",
        },
      },
      404,
    );
  }

  if (!isAdmin(c)) {
    const rider = await findRiderByUserId(c.get("userId"));
    if (!rider || delivery.riderId !== rider.id) {
      return c.json(
        {
          error: {
            code: "FORBIDDEN",
            message: "Not your delivery",
          },
        },
        403,
      );
    }
  }

  const [enriched] = await enrich([delivery]);
  return c.json({ delivery: enriched });
});

// Create a delivery from an order (admin only)
router.post("/", verifyJwt, requireRole("admin"), async (c) => {
  const body = createDeliverySchema.safeParse(await c.req.json());

  if (!body.success) {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: body.error.issues[0]?.message ?? "Invalid input",
        },
      },
      400,
    );
  }

  const existing = await db
    .select({ id: deliveries.id })
    .from(deliveries)
    .where(eq(deliveries.orderId, body.data.orderId))
    .limit(1);

  if (existing.length > 0) {
    return c.json(
      {
        error: {
          code: "CONFLICT",
          message: "A delivery for this order already exists",
        },
      },
      409,
    );
  }

  const [delivery] = await db
    .insert(deliveries)
    .values({
      orderId: body.data.orderId,
      zoneId: body.data.zoneId ?? null,
      customerName: body.data.customerName,
      customerPhone: body.data.customerPhone,
      deliveryAddress: body.data.deliveryAddress,
      deliveryNote: body.data.deliveryNote ?? null,
      feeCents: body.data.feeCents,
      etaMinutes: body.data.etaMinutes ?? null,
    })
    .returning();

  if (!delivery) {
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create delivery",
        },
      },
      500,
    );
  }

  const [enriched] = await enrich([delivery]);
  return c.json({ delivery: enriched }, 201);
});

// Assign a rider (admin only)
router.post("/:id/assign", verifyJwt, requireRole("admin"), async (c) => {
  const id = c.req.param("id");
  const body = assignDeliverySchema.safeParse(await c.req.json());

  if (!body.success) {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: body.error.issues[0]?.message ?? "Invalid input",
        },
      },
      400,
    );
  }

  const [rider] = await db
    .select()
    .from(riders)
    .where(eq(riders.id, body.data.riderId))
    .limit(1);

  if (!rider) {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Rider not found",
        },
      },
      404,
    );
  }

  if (rider.status !== "active") {
    return c.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "Rider is not active",
        },
      },
      403,
    );
  }

  const delivery = await findDelivery(id);
  if (!delivery) {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Delivery not found",
        },
      },
      404,
    );
  }

  if (TERMINAL.has(delivery.status as DeliveryStatus)) {
    return c.json(
      {
        error: {
          code: "CONFLICT",
          message: "Cannot assign a delivery that is already finished",
        },
      },
      409,
    );
  }

  const [updated] = await db
    .update(deliveries)
    .set({
      riderId: body.data.riderId,
      status: delivery.status === "pending" ? "assigned" : delivery.status,
      assignedAt: delivery.status === "pending" ? new Date() : delivery.assignedAt,
    })
    .where(eq(deliveries.id, id))
    .returning();

  const [enriched] = await enrich([updated!]);
  return c.json({ delivery: enriched });
});

// Agent accepts an assigned delivery (delivery_agent only)
router.post(
  "/:id/accept",
  verifyJwt,
  requireRole("delivery_agent"),
  async (c) => {
    const result = await agentAction(c, "assigned", "accept");
    if (result) return result;
  },
);

// Agent marks the order picked up (delivery_agent only)
router.post(
  "/:id/pickup",
  verifyJwt,
  requireRole("delivery_agent"),
  async (c) => {
    const result = await agentAction(c, "accepted", "pickup");
    if (result) return result;
  },
);

// Agent marks the order delivered (delivery_agent only)
router.post(
  "/:id/deliver",
  verifyJwt,
  requireRole("delivery_agent"),
  async (c) => {
    const result = await agentAction(c, "out_for_delivery", "deliver");
    if (result) return result;
  },
);

async function agentAction(
  c: Context<{ Variables: AuthVariables }>,
  from: DeliveryStatus,
  action: "accept" | "pickup" | "deliver",
) {
  const id = c.req.param("id");
  if (!id) {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Delivery id is required in the path",
        },
      },
      404,
    );
  }

  const rider = await findRiderByUserId(c.get("userId"));
  if (!rider) {
    return c.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "No rider profile for this account",
        },
      },
      403,
    );
  }

  const delivery = await findDelivery(id);
  if (!delivery) {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Delivery not found",
        },
      },
      404,
    );
  }

  if (delivery.riderId !== rider.id) {
    return c.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "Not your delivery",
        },
      },
      403,
    );
  }

  if ((delivery.status as DeliveryStatus) !== from) {
    return c.json(
      {
        error: {
          code: "CONFLICT",
          message: `Cannot ${action} a delivery in status "${delivery.status}"`,
        },
      },
      409,
    );
  }

  const stamp =
    action === "accept"
      ? { acceptedAt: new Date() }
      : action === "pickup"
        ? { pickedUpAt: new Date() }
        : { deliveredAt: new Date() };

  const [updated] = await db
    .update(deliveries)
    .set({
      ...stamp,
      status: action === "accept"
        ? "accepted"
        : action === "pickup"
          ? "out_for_delivery"
          : "delivered",
    })
    .where(eq(deliveries.id, id))
    .returning();

  const [enriched] = await enrich([updated!]);
  return c.json({ delivery: enriched });
}

// Cancel a delivery (admin only)
router.post("/:id/cancel", verifyJwt, requireRole("admin"), async (c) => {
  const id = c.req.param("id");
  const body = cancelDeliverySchema.safeParse(await c.req.json());

  if (!body.success) {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: body.error.issues[0]?.message ?? "Invalid input",
        },
      },
      400,
    );
  }

  const delivery = await findDelivery(id);
  if (!delivery) {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Delivery not found",
        },
      },
      404,
    );
  }

  if (TERMINAL.has(delivery.status as DeliveryStatus)) {
    return c.json(
      {
        error: {
          code: "CONFLICT",
          message: "Delivery is already finished",
        },
      },
      409,
    );
  }

  const [updated] = await db
    .update(deliveries)
    .set({
      status: "cancelled",
      cancelledAt: new Date(),
      cancelledReason: body.data.reason ?? null,
    })
    .where(eq(deliveries.id, id))
    .returning();

  const [enriched] = await enrich([updated!]);
  return c.json({ delivery: enriched });
});

export default router;