import {
  boolean,
  doublePrecision,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const riders = pgTable(
  "riders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    vehicleType: varchar("vehicle_type", { length: 50 }).notNull().default("bike"),
    isOnline: boolean("is_online").notNull().default(false),
    currentLat: doublePrecision("current_lat"),
    currentLng: doublePrecision("current_lng"),
    lastSeenAt: timestamp("last_seen_at", {
      mode: "date",
      precision: 3,
      withTimezone: true,
    }),
    status: varchar("status", { length: 50 }).notNull().default("active"),
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
    index("riders_user_id_idx").on(table.userId),
    index("riders_online_idx").on(table.isOnline),
  ],
);