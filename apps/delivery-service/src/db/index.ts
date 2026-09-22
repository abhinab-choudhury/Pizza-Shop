import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

export const client = postgres(connectionString, {
  prepare: false,
  max: 20,
  idle_timeout: 30,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

export const migrationClient = postgres(connectionString, {
  max: 1,
  prepare: false,
});