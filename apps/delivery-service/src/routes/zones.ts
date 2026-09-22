import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { deliveryZones } from "../db/schema";
import {
  verifyJwt,
  requireRole,
  type AuthVariables,
} from "../middleware/auth";

const router = new Hono<{ Variables: AuthVariables }>();

const createZoneSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(1000).optional(),
  feeCents: z.number().int().min(0, "Fee must be a non-negative amount"),
  isActive: z.boolean().optional().default(true),
});

const updateZoneSchema = z.object({
  name: z.string().min(1, "Name is required").max(255).optional(),
  description: z.string().max(1000).nullable().optional(),
  feeCents: z.number().int().min(0, "Fee must be a non-negative amount").optional(),
  isActive: z.boolean().optional(),
});

function toZoneResponse(zone: typeof deliveryZones.$inferSelect) {
  return {
    id: zone.id,
    name: zone.name,
    description: zone.description,
    feeCents: zone.feeCents,
    isActive: zone.isActive,
    createdAt: zone.createdAt,
    updatedAt: zone.updatedAt,
  };
}

// List active zones (public — used by checkout to compute delivery fees)
router.get("/", async (c) => {
  const includeInactive = c.req.query("includeInactive") === "true";
  const zones = await db
    .select()
    .from(deliveryZones)
    .where(includeInactive ? undefined : eq(deliveryZones.isActive, true))
    .orderBy(deliveryZones.name);

  return c.json({ zones: zones.map(toZoneResponse) });
});

// Create zone (admin only)
router.post("/", verifyJwt, requireRole("admin"), async (c) => {
  const body = createZoneSchema.safeParse(await c.req.json());

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

  const [zone] = await db
    .insert(deliveryZones)
    .values({
      name: body.data.name,
      description: body.data.description ?? null,
      feeCents: body.data.feeCents,
      isActive: body.data.isActive,
    })
    .returning();

  if (!zone) {
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create zone",
        },
      },
      500,
    );
  }

  return c.json({ zone: toZoneResponse(zone) }, 201);
});

// Update zone (admin only)
router.patch("/:id", verifyJwt, requireRole("admin"), async (c) => {
  const id = c.req.param("id");
  const body = updateZoneSchema.safeParse(await c.req.json());

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

  const d = body.data;
  const patch: Record<string, unknown> = {};
  if (d.name !== undefined) patch.name = d.name;
  if (d.description !== undefined) patch.description = d.description;
  if (d.feeCents !== undefined) patch.feeCents = d.feeCents;
  if (d.isActive !== undefined) patch.isActive = d.isActive;

  if (Object.keys(patch).length === 0) {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "No fields provided to update",
        },
      },
      400,
    );
  }

  const [updated] = await db
    .update(deliveryZones)
    .set(patch)
    .where(eq(deliveryZones.id, id))
    .returning();

  if (!updated) {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Zone not found",
        },
      },
      404,
    );
  }

  return c.json({ zone: toZoneResponse(updated) });
});

export default router;