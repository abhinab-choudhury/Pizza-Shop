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
      const req = ctx.request as unknown as Record<string, unknown>;
      const data = schema.parse(req[target]);
      req[target] = data;
      await next();
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.issues.map(
          (e) => `${e.path.join(".")}: ${e.message}`,
        );
        throw new BadRequestError(messages.join(", "));
      }
      throw err;
    }
  };
}
