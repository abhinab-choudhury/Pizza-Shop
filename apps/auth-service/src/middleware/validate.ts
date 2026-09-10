import { Context, Next } from "koa";
import { ZodSchema, ZodError } from "zod";
import { BadRequestError } from "../utils/errors";

type ValidationTarget = "body" | "query" | "params";

export function validate(
  schema: ZodSchema,
  target: ValidationTarget = "body",
) {
  return async (ctx: Context, next: Next) => {
    try {
      const data = schema.parse(ctx.request[target]);
      ctx.request[target] = data;
      await next();
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.errors.map(
          (e) => `${e.path.join(".")}: ${e.message}`,
        );
        throw new BadRequestError(messages.join(", "));
      }
      throw err;
    }
  };
}
