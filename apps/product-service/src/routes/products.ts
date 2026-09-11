import { Hono } from "hono";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";
import { products } from "../db/schema";
import {
  verifyJwt,
  requireRole,
  type AuthVariables,
} from "../middleware/auth";

const router = new Hono<{ Variables: AuthVariables }>();

const sizeSchema = z.object({
  label: z.string().min(1, "Size label is required"),
  priceCents: z.number().int().min(0, "Size price must be a positive amount"),
});

const namedConfigSchema = z.object({
  name: z.string().min(1, "Name is required"),
  priceCents: z.number().int().min(0, "Price must be a positive amount"),
});

const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(2000).optional(),
  category: z.string().max(100).optional().default("pizza"),
  priceCents: z.number().int().min(0, "Price must be a positive amount"),
  sizes: z.array(sizeSchema).optional(),
  toppings: z.array(namedConfigSchema).optional(),
  addOns: z.array(namedConfigSchema).optional(),
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean().optional().default(true),
});

const updateProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(255).optional(),
  description: z.string().max(2000).nullable().optional(),
  category: z.string().max(100).nullable().optional(),
  priceCents: z.number().int().min(0, "Price must be a positive amount").optional(),
  sizes: z.array(sizeSchema).nullable().optional(),
  toppings: z.array(namedConfigSchema).nullable().optional(),
  addOns: z.array(namedConfigSchema).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  isAvailable: z.boolean().optional(),
});

function toProductResponse(product: typeof products.$inferSelect) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    priceCents: product.priceCents,
    sizes: product.sizes ?? [],
    toppings: product.toppings ?? [],
    addOns: product.addOns ?? [],
    imageUrl: product.imageUrl,
    isAvailable: product.isAvailable,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

// List products (public)
router.get("/", async (c) => {
  const category = c.req.query("category");
  const availableParam = c.req.query("available");

  const conditions = [];
  if (category) {
    conditions.push(eq(products.category, category));
  }
  if (availableParam !== undefined) {
    conditions.push(
      eq(products.isAvailable, availableParam === "true"),
    );
  }

  const where = conditions.length > 0 ? sql.join(conditions, sql` and `) : undefined;

  const rows = await db
    .select()
    .from(products)
    .where(where)
    .orderBy(products.createdAt);

  return c.json({ products: rows.map(toProductResponse) });
});

// Get single product (public)
router.get("/:id", async (c) => {
  const id = c.req.param("id");
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  if (!product) {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Product not found",
        },
      },
      404,
    );
  }

  return c.json({ product: toProductResponse(product) });
});

// Create product (admin only)
router.post(
  "/",
  verifyJwt,
  requireRole("admin"),
  async (c) => {
    const body = createProductSchema.safeParse(await c.req.json());

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

    const [product] = await db
      .insert(products)
      .values({
        name: body.data.name,
        description: body.data.description ?? null,
        category: body.data.category,
        priceCents: body.data.priceCents,
        sizes: body.data.sizes ?? [],
        toppings: body.data.toppings ?? [],
        addOns: body.data.addOns ?? [],
        imageUrl: body.data.imageUrl ?? null,
        isAvailable: body.data.isAvailable,
      })
      .returning();

    if (!product) {
      return c.json(
        {
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to create product",
          },
        },
        500,
      );
    }

    return c.json({ product: toProductResponse(product) }, 201);
  },
);

// Update product (admin only)
router.patch(
  "/:id",
  verifyJwt,
  requireRole("admin"),
  async (c) => {
    const id = c.req.param("id");
    const body = updateProductSchema.safeParse(await c.req.json());

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
    if (d.category !== undefined) patch.category = d.category;
    if (d.priceCents !== undefined) patch.priceCents = d.priceCents;
    if (d.sizes !== undefined) patch.sizes = d.sizes ?? [];
    if (d.toppings !== undefined) patch.toppings = d.toppings ?? [];
    if (d.addOns !== undefined) patch.addOns = d.addOns ?? [];
    if (d.imageUrl !== undefined) patch.imageUrl = d.imageUrl;
    if (d.isAvailable !== undefined) patch.isAvailable = d.isAvailable;

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
      .update(products)
      .set(patch)
      .where(eq(products.id, id))
      .returning();

    if (!updated) {
      return c.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Product not found",
          },
        },
        404,
      );
    }

    return c.json({ product: toProductResponse(updated) });
  },
);

// Delete product (admin only)
router.delete("/:id", verifyJwt, requireRole("admin"), async (c) => {
  const id = c.req.param("id");

  const [deleted] = await db
    .delete(products)
    .where(eq(products.id, id))
    .returning();

  if (!deleted) {
    return c.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Product not found",
        },
      },
      404,
    );
  }

  return c.json({ message: "Product deleted" });
});

export default router;