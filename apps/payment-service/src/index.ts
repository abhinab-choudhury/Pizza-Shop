import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "dotenv/config";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Payment Service - Hono + TypeScript");
});

serve(
  {
    fetch: app.fetch,
    port: process.env.PORT ? parseInt(process.env.PORT) : 3005,
  },
  (info) => {
    console.log(`Payment Server is running on http://localhost:${info.port}`);
  },
);
