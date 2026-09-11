import Koa from "koa";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";
import Router from "koa-router";
import authRoutes from "./routes/auth";
import errorHandler from "./middleware/error-handler";
import logger from "./middleware/logger";
import { client } from "./db";
import { renderLandingPage } from "./landing";
import { config } from "./utils/env";

const app = new Koa();

const allowedOrigins = config.CORS_ORIGINS.split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(errorHandler);
app.use(logger);
app.use(
  cors({
    origin: (ctx) => {
      const origin = ctx.request.headers.origin;
      if (origin && allowedOrigins.includes(origin)) {
        return origin;
      }
      return "";
    },
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(bodyParser());

// Landing page
const homeRouter = new Router();
homeRouter.get("/", (ctx) => {
  ctx.type = "text/html";
  ctx.body = renderLandingPage("Auth");
});
app.use(homeRouter.routes());
app.use(homeRouter.allowedMethods());

// Health check route
const healthRouter = new Router();
healthRouter.get("/health", async (ctx) => {
  try {
    await client`SELECT 1`;
    ctx.status = 200;
    ctx.body = { status: "ok", service: "auth-service" };
  } catch (err) {
    ctx.status = 503;
    ctx.body = { status: "error", message: "Database unreachable" };
  }
});
app.use(healthRouter.routes());
app.use(healthRouter.allowedMethods());

app.use(authRoutes.routes());
app.use(authRoutes.allowedMethods());

const PORT = config.PORT;

async function start() {
  try {
    // Verify database connectivity before starting
    await client`SELECT 1`;
    console.log("Database connection verified");
  } catch (err) {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Auth Service running at http://localhost:${PORT}`);
  });
}

start();
