import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    familyId: uuid("family_id").notNull(),
    tokenHash: text("token_hash").notNull(),
    parentId: uuid("parent_id"),
    used: boolean("used").default(false).notNull(),
    revoked: boolean("revoked").default(false).notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
    createdAt: timestamp("created_at", {
      mode: "date",
      precision: 3,
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("refresh_tokens_hash_idx").on(table.tokenHash),
    index("refresh_tokens_family_idx").on(table.familyId),
    index("refresh_tokens_user_id_idx").on(table.userId),
  ],
);
