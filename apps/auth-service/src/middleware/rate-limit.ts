import { Context, Next } from "koa";

const rateLimitStore = new Map<
  string,
  { count: number; resetAt: number }
>();

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60_000);

export default function rateLimit(
  windowMs: number = 60_000,
  max: number = 30,
) {
  return async (ctx: Context, next: Next) => {
    const key = `${ctx.ip}:${ctx.path}`;
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (record && record.resetAt > now) {
      if (record.count >= max) {
        ctx.status = 429;
        ctx.body = {
          error: {
            code: "TOO_MANY_REQUESTS",
            message: "Too many requests, please try again later",
          },
        };
        ctx.set("Retry-After", String(Math.ceil((record.resetAt - now) / 1000)));
        return;
      }
      record.count++;
    } else {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    }

    await next();
  };
}
