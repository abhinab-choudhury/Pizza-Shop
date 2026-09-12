import express from "express";
import cors from "cors";
import morgan from "morgan";

import config from "./utils/env";
import logger from "./middleware/logger";
import router from "./routes";
import ordersRouter from "./routes/orders";

const app = express();
const PORT = config.PORT;

const corsOrigins = (
  process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:3001"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: corsOrigins,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);
app.use(morgan("dev"));

app.use("/orders", ordersRouter);
app.use(router);

// Error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    logger.error(err.message);
    res.status(500).json({
      error: { code: "INTERNAL_ERROR", message: "Internal server error" },
    });
  },
);

app.listen(PORT, () => {
  logger.info(`Order Server running at http://localhost:${PORT}`);
});