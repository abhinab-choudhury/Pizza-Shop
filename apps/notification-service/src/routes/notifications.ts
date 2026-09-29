import { Hono, type Context } from "hono";
import { z } from "zod";
import { EVENT_TYPES } from "../events.js";
import { hub } from "../ws/hub.js";
import {
  verifyJwt,
  verifyService,
  requireScope,
  isAdmin,
  type AuthVariables,
} from "../middleware/auth.js";

/**
 * Dev-only escape hatch. auth-service exposes no route that mints
 * client-credentials tokens, so without this the publish endpoint cannot be
 * exercised locally. Default off — never enable in a deployed environment.
 */
const ALLOW_ANONYMOUS_PUBLISH =
  process.env.ALLOW_ANONYMOUS_PUBLISH === "true";

const router = new Hono<{ Variables: AuthVariables }>();

const base = {
  orderId: z.string().min(1),
  userId: z.string().min(1),
  occurredAt: z.string().datetime(),
};

/**
 * Mirrors the `NotificationEvent` union in ../events. Kept adjacent to it so
 * the two stay in step — move both into `packages/domain` together.
 */
const eventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("order.placed"),
    ...base,
    data: z.object({
      totalCents: z.number().int().nonnegative(),
      itemCount: z.number().int().nonnegative(),
    }),
  }),
  z.object({
    type: z.literal("payment.captured"),
    ...base,
    data: z.object({
      paymentId: z.string().min(1),
      amountCents: z.number().int().nonnegative(),
    }),
  }),
  z.object({
    type: z.literal("order.ready_for_pickup"),
    ...base,
    data: z.object({ etaMinutes: z.number().int().nonnegative() }),
  }),
  z.object({
    type: z.literal("delivery.assigned"),
    ...base,
    data: z.object({
      riderId: z.string().min(1),
      riderName: z.string().min(1),
    }),
  }),
  z.object({
    type: z.literal("delivery.out_for_delivery"),
    ...base,
    data: z.object({
      riderId: z.string().min(1),
      lat: z.number(),
      lng: z.number(),
    }),
  }),
  z.object({
    type: z.literal("delivery.delivered"),
    ...base,
    data: z.object({ deliveredAt: z.string().datetime() }),
  }),
]);

const publishHandler = async (c: Context<{ Variables: AuthVariables }>) => {
  const body = eventSchema.safeParse(await c.req.json());

  if (!body.success) {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: body.error.issues[0]?.message ?? "Invalid event payload",
        },
      },
      400,
    );
  }

  const result = hub.publish(body.data);
  return c.json({ published: true, ...result });
};

if (ALLOW_ANONYMOUS_PUBLISH) {
  router.post("/events", publishHandler);
} else {
  router.post(
    "/events",
    verifyService,
    requireScope("notifications:publish"),
    publishHandler,
  );
}

router.get("/stats", verifyJwt, (c) => {
  if (!isAdmin(c)) {
    return c.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "Admin access required",
        },
      },
      403,
    );
  }
  return c.json(hub.stats());
});

router.get("/event-types", (c) => {
  return c.json({ eventTypes: EVENT_TYPES });
});

export default router;
