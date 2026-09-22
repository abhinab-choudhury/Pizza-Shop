import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { proxy } from "hono/proxy";
import "dotenv/config";

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

app.use("*", async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${c.req.method} ${c.req.path} -> ${c.res.status} (${ms}ms)`);
});

interface Upstream {
  name: string;
  baseUrl: string;
  strip: string;
  prepend: string;
}

function env(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

const upstreams: Upstream[] = [
  { name: "auth", baseUrl: env("AUTH_SERVICE_URL", "http://localhost:3002"), strip: "/api/auth", prepend: "/auth" },
  { name: "email", baseUrl: env("EMAIL_SERVICE_URL", "http://localhost:3003"), strip: "/api/email", prepend: "" },
  { name: "orders", baseUrl: env("ORDER_SERVICE_URL", "http://localhost:3004"), strip: "/api/orders", prepend: "/orders" },
  { name: "payments", baseUrl: env("PAYMENT_SERVICE_URL", "http://localhost:3005"), strip: "/api/payments", prepend: "/payments" },
  { name: "products", baseUrl: env("PRODUCT_SERVICE_URL", "http://localhost:3006"), strip: "/api/products", prepend: "/products" },
  { name: "delivery", baseUrl: env("DELIVERY_SERVICE_URL", "http://localhost:3008"), strip: "/api/delivery", prepend: "/delivery" },
];

function upstreamTarget(upstream: Upstream, publicPath: string): URL {
  const rest = publicPath.slice(upstream.strip.length);
  const path = upstream.prepend + rest || "/";
  const base = upstream.baseUrl.replace(/\/+$/, "") + "/";
  return new URL(path, base);
}

for (const upstream of upstreams) {
  app.all(upstream.strip, (c) => proxy(upstreamTarget(upstream, c.req.path), { raw: c.req.raw }));
  app.all(`${upstream.strip}/*`, (c) => proxy(upstreamTarget(upstream, c.req.path), { raw: c.req.raw }));
}

app.get("/", (c) => {
  return c.json({
    service: "pizza-shop-gateway",
    version: "1.0.0",
    api: "/api",
    upstreams: upstreams.map((u) => u.name),
  });
});

app.get("/health", async (c) => {
  const results = await Promise.allSettled(
    upstreams.map(async (u) => {
      const res = await fetch(u.baseUrl.replace(/\/+$/, "") + "/health", {
        signal: AbortSignal.timeout(2000),
      });
      return res.ok;
    }),
  );

  const upstream = Object.fromEntries(
    upstreams.map((u, i) => [
      u.name,
      results[i]?.status === "fulfilled" && results[i].value === true
        ? "ok"
        : "down",
    ]),
  );

  return c.json({ status: "ok", service: "gateway", upstream });
});

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3007;

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`Gateway is running on http://localhost:${info.port}`);
    console.log(
      `Upstreams: ${upstreams.map((u) => `${u.strip} -> ${u.baseUrl}`).join(", ")}`,
    );
  },
);