import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import "dotenv/config";
import { client } from "./db";
import { renderLandingPage } from "./landing";
import productsRouter from "./routes/products";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: [
      process.env.WEB_CLIENT || "http://localhost:3000",
      process.env.ADMIN_CLIENT || "http://localhost:3001",
    ],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.get("/", (c) => {
  return c.html(renderLandingPage("Product"));
});

// Health check route
app.get("/health", async (c) => {
  try {
    await client`SELECT 1`;
    return c.json({ status: "ok", service: "product-service" });
  } catch (err) {
    return c.json(
      { status: "error", message: "Database unreachable" },
      503,
    );
  }
});

app.route("/products", productsRouter);

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3006;

async function start() {
  try {
    // Verify database connectivity before starting
    await client`SELECT 1`;
    console.log("Database connection verified");
  } catch (err) {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  }

  serve(
    {
      fetch: app.fetch,
      port: PORT,
    },
    (info) => {
      console.log(`Product server is running on http://localhost:${info.port}`);
    },
  );
}

start();