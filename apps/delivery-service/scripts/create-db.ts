import "dotenv/config";
import postgres from "postgres";

const url = new URL(process.env.DATABASE_URL!);
const dbName = url.pathname.replace(/^\//, "");
const adminUrl = new URL(url);
adminUrl.pathname = "/postgres";

async function run() {
  if (!dbName) {
    console.error("No database name found in DATABASE_URL");
    process.exit(1);
  }

  const admin = postgres(adminUrl.toString(), { max: 1 });

  try {
    const rows = await admin`
      SELECT 1 FROM pg_database WHERE datname = ${dbName}
    `;

    if (rows.length > 0) {
      console.log(`Database "${dbName}" already exists`);
      return;
    }

    await admin.unsafe(
      `CREATE DATABASE "${dbName.replace(/"/g, '""')}"`,
    );
    console.log(`Created database "${dbName}"`);
  } catch (err) {
    console.error("Failed to create database:", err);
    process.exit(1);
  } finally {
    await admin.end();
  }
}

run();