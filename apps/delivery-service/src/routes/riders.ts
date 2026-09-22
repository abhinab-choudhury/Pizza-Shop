import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { riders } from "../db/schema";
import {
  verifyJwt,
  requireRole,
  type AuthVariables,
} from "../middleware/auth";

const router = new Hono<{ Variables: AuthVariables }>();

const upsertRiderSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  phone: z.string().max(20).optional(),
  vehicleType: z.string().max(50).optional(),
});

const statusSchema = z.object({
  isOnline: z.boolean(),
});

const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

function toRiderResponse(rider: typeof riders.$inferSelect) {
  return {
    id: rider.id,
    userId: rider.userId,
    name: rider.name,
    phone: rider.phone,
    vehicleType: rider.vehicleType,
    isOnline: rider.isOnline,
    currentLat: rider.currentLat,
    currentLng: rider.currentLng,
    lastSeenAt: rider.lastSeenAt,
    status: rider.status,
    createdAt: rider.createdAt,
    updatedAt: rider.updatedAt,
  };
}

async function findRiderByUserId(userId: string) {
  const [rider] = await db
    .select()
    .from(riders)
    .where(eq(riders.userId, userId))
    .limit(1);
  return rider;
}

// Create or update the current agent's rider profile (delivery_agent only)
router.post("/me", verifyJwt, requireRole("delivery_agent"), async (c) => {
  const body = upsertRiderSchema.safeParse(await c.req.json());

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

  const existing = await findRiderByUserId(c.get("userId"));

  if (existing) {
    const [updated] = await db
      .update(riders)
      .set({
        name: body.data.name,
        phone: body.data.phone ?? null,
        vehicleType: body.data.vehicleType ?? existing.vehicleType,
      })
      .where(eq(riders.id, existing.id))
      .returning();

    return c.json({ rider: toRiderResponse(updated!) });
  }

  const [created] = await db
    .insert(riders)
    .values({
      userId: c.get("userId"),
      name: body.data.name,
      phone: body.data.phone ?? null,
      vehicleType: body.data.vehicleType ?? "bike",
    })
    .returning();

  if (!created) {
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create rider profile",
        },
      },
      500,
    );
  }

  return c.json({ rider: toRiderResponse(created) }, 201);
});

// Get the current agent's rider profile (delivery_agent only)
router.get("/me", verifyJwt, requireRole("delivery_agent"), async (c) => {
  const rider = await findRiderByUserId(c.get("userId"));

  if (!rider) {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Rider profile not found. Create one with POST /riders/me",
        },
      },
      404,
    );
  }

  return c.json({ rider: toRiderResponse(rider) });
});

// Go online / offline (delivery_agent only)
router.patch("/me/status", verifyJwt, requireRole("delivery_agent"), async (c) => {
  const body = statusSchema.safeParse(await c.req.json());

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

  const rider = await findRiderByUserId(c.get("userId"));

  if (!rider) {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Rider profile not found. Create one with POST /riders/me",
        },
      },
      404,
    );
  }

  if (!body.data.isOnline && rider.status !== "active") {
    return c.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "Suspended riders cannot go online",
        },
      },
      403,
    );
  }

  const [updated] = await db
    .update(riders)
    .set({
      isOnline: body.data.isOnline,
      lastSeenAt: new Date(),
    })
    .where(eq(riders.id, rider.id))
    .returning();

  return c.json({ rider: toRiderResponse(updated!) });
});

// Heartbeat with current position (delivery_agent only)
router.patch("/me/location", verifyJwt, requireRole("delivery_agent"), async (c) => {
  const body = locationSchema.safeParse(await c.req.json());

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

  const rider = await findRiderByUserId(c.get("userId"));

  if (!rider) {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Rider profile not found. Create one with POST /riders/me",
        },
      },
      404,
    );
  }

  const [updated] = await db
    .update(riders)
    .set({
      currentLat: body.data.lat,
      currentLng: body.data.lng,
      lastSeenAt: new Date(),
    })
    .where(eq(riders.id, rider.id))
    .returning();

  return c.json({ rider: toRiderResponse(updated!) });
});

// List riders (admin only)
router.get("/", verifyJwt, requireRole("admin"), async (c) => {
  const onlineParam = c.req.query("online");
  const rows = await db
    .select()
    .from(riders)
    .where(
      onlineParam !== undefined
        ? eq(riders.isOnline, onlineParam === "true")
        : undefined,
    )
    .orderBy(riders.createdAt);

  return c.json({ riders: rows.map(toRiderResponse) });
});

export default router;