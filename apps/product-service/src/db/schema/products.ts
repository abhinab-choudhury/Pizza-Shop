import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  index,
} from "drizzle-orm/pg-core";

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 100 }).notNull().default("pizza"),
    priceCents: integer("price_cents").notNull(),
    sizes: jsonb("sizes")
      .$type<{ label: string; priceCents: number }[]>()
      .default([]),
    toppings: jsonb("toppings")
      .$type<{ name: string; priceCents: number }[]>()
      .default([]),
    addOns: jsonb("add_ons")
      .$type<{ name: string; priceCents: number }[]>()
      .default([]),
    imageUrl: text("image_url"),
    isAvailable: boolean("is_available").default(true).notNull(),
    createdAt: timestamp("created_at", {
      mode: "date",
      precision: 3,
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      precision: 3,
      withTimezone: true,
    })
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    index("products_category_idx").on(table.category),
    index("products_created_at_idx").on(table.createdAt),
  ],
);