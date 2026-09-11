import "dotenv/config";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { migrationClient } from "../src/db";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(scriptDir, "..", "seed.sql"), "utf8");

async function runSeed() {
  console.log("Seeding database...");
  try {
    await migrationClient.unsafe(sql);
    console.log("Seed completed successfully");
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

runSeed();