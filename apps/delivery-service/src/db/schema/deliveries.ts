import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { deliveryZones } from "./zones";
import { riders } from "./riders";

export const deliveries = pgTable(
  "deliveries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id").notNull().unique(),
    zoneId: uuid("zone_id").references(() => deliveryZones.id, {
      onDelete: "set null",
    }),
    riderId: uuid("rider_id").references(() => riders.id, {
      onDelete: "set null",
    }),
    status: varchar("status", { length: 50 }).notNull().default("pending"),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
    deliveryAddress: text("delivery_address").notNull(),
    deliveryNote: text("delivery_note"),
    feeCents: integer("fee_cents").notNull().default(0),
    etaMinutes: integer("eta_minutes"),
    assignedAt: timestamp("assigned_at", {
      mode: "date",
      precision: 3,
      withTimezone: true,
    }),
    acceptedAt: timestamp("accepted_at", {
      mode: "date",
      precision: 3,
      withTimezone: true,
    }),
    pickedUpAt: timestamp("picked_up_at", {
      mode: "date",
      precision: 3,
      withTimezone: true,
    }),
    deliveredAt: timestamp("delivered_at", {
      mode: "date",
      precision: 3,
      withTimezone: true,
    }),
    cancelledAt: timestamp("cancelled_at", {
      mode: "date",
      precision: 3,
      withTimezone: true,
    }),
    cancelledReason: text("cancelled_reason"),
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
    index("deliveries_status_idx").on(table.status),
    index("deliveries_rider_id_idx").on(table.riderId),
    index("deliveries_zone_id_idx").on(table.zoneId),
  ],
);