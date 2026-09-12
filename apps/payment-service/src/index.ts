import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import "dotenv/config";

import { renderLandingPage } from "./landing.js";
import { paymentsRouter } from "./routes/payments.js";

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
  return c.html(renderLandingPage("Payment"));
});

app.route("/payments", paymentsRouter);

export default app.fetch;

if (process.env.VERCEL !== "1") {
  serve(
    {
      fetch: app.fetch,
      port: process.env.PORT ? parseInt(process.env.PORT) : 3005,
    },
    (info) => {
      console.log(`Payment Server is running on http://localhost:${info.port}`);
    },
  );
}