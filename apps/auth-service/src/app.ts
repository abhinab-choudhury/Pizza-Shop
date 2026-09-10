import Koa from "koa";
import bodyParser from "koa-bodyparser";
import cors from "@koa/cors";
import authRoutes from "./routes/auth";
import errorHandler from "./middleware/error-handler";
import logger from "./middleware/logger";
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
app.use(authRoutes.routes());
app.use(authRoutes.allowedMethods());

const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(
    `Auth Service running at http://localhost:${PORT}`,
  );
});
