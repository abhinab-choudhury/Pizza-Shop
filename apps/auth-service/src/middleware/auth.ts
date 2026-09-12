import { Context, Next } from "koa";
import {
  buildJwksUrl,
  verifyAccessToken,
} from "@repo/auth-middleware";
import { ForbiddenError, UnauthorizedError } from "../utils/errors";

const JWKS_URL = buildJwksUrl(process.env.AUTH_SERVICE_INTERNAL_URL || "");

export async function verifyJwtMiddleware(
  ctx: Context,
  next: Next,
) {
  const authHeader = ctx.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or invalid authorization header");
  }

  try {
    const payload = await verifyAccessToken({
      jwksUrl: JWKS_URL,
      token: authHeader.slice(7),
    });

    ctx.state.user = payload;
    ctx.state.userId = payload.sub;
    ctx.state.role = payload.role;

    await next();
  } catch (err) {
    if (err instanceof UnauthorizedError) throw err;
    throw new UnauthorizedError("Invalid or expired token");
  }
}

export function requireRole(role: "user" | "admin") {
  return async function requireRoleMiddleware(
    ctx: Context,
    next: Next,
  ) {
    const userRole = (ctx.state as any).role as string | undefined;

    if (!userRole || userRole !== role) {
      throw new ForbiddenError("Insufficient permissions");
    }

    await next();
  };
}