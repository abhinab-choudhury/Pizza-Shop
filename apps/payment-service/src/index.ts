import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import "dotenv/config";

import { renderLandingPage } from "./landing.js";
import { paymentsRouter } from "./routes/payments.js";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: [
      process.env.WEB_CLIENT || "http://localhost:3000",
      process.env.ADMIN_CLIENT || "http://localhost:3001",
    ],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "OPTIONS"],
  }),
);

app.get("/", (c) => {
  return c.html(renderLandingPage("Payment"));
});

app.route("/payments", paymentsRouter);

serve(
  {
    fetch: app.fetch,
    port: process.env.PORT ? parseInt(process.env.PORT) : 3005,
  },
  (info) => {
    console.log(`Payment Server is running on http://localhost:${info.port}`);
  },
);