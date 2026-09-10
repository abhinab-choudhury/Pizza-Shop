import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  index,
} from "drizzle-orm/pg-core";

export const serviceAccounts = pgTable(
  "service_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    serviceId: varchar("service_id", { length: 100 }).notNull().unique(),
    clientId: varchar("client_id", { length: 255 }).notNull().unique(),
    clientSecretHash: text("client_secret_hash").notNull(),
    allowedScopes: text("allowed_scopes")
      .array()
      .notNull()
      .default([]),
    isActive: boolean("is_active").default(true).notNull(),
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
    index("service_accounts_client_id_idx").on(table.clientId),
  ],
);
