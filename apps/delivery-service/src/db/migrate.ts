import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db, migrationClient } from "./index";

async function runMigrations() {
  console.log("Running migrations...");
  try {
    await migrate(db, {
      migrationsFolder: "./drizzle",
      migrationsSchema: "drizzle_delivery",
    });
    console.log("Migrations completed successfully");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

runMigrations();