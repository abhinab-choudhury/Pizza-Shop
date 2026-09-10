import { Context, Next } from "koa";
import { AppError } from "../utils/errors";

export default async function errorHandler(
  ctx: Context,
  next: Next,
) {
  try {
    await next();
  } catch (err) {
    if (err instanceof AppError) {
      ctx.status = err.statusCode;
      ctx.body = {
        error: {
          code: err.code,
          message: err.message,
        },
      };
    } else {
      console.error("Unhandled error:", err);
      ctx.status = 500;
      ctx.body = {
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error",
        },
      };
    }
  }
}
