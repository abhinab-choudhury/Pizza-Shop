import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import "dotenv/config";
import { client } from "./db";
import { renderLandingPage } from "./landing";
import deliveriesRouter from "./routes/deliveries";
import ridersRouter from "./routes/riders";
import zonesRouter from "./routes/zones";

const app = new Hono();

const corsOrigins = (
  process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:3001"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  "*",
  cors({
    origin: corsOrigins,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.get("/", (c) => {
  return c.html(renderLandingPage("Delivery"));
});

// Health check route
app.get("/health", async (c) => {
  try {
    await client`SELECT 1`;
    return c.json({ status: "ok", service: "delivery-service" });
  } catch (err) {
    return c.json(
      { status: "error", message: "Database unreachable" },
      503,
    );
  }
});

app.route("/delivery/deliveries", deliveriesRouter);
app.route("/delivery/riders", ridersRouter);
app.route("/delivery/zones", zonesRouter);

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3008;

async function start() {
  try {
    // Verify database connectivity before starting
    await client`SELECT 1`;
    console.log("Successfully connected to the database");
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
      console.log(`Delivery server is running on http://localhost:${info.port}`);
    },
  );
}

start();