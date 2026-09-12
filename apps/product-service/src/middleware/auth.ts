import type { Context, MiddlewareHandler } from "hono";
import { buildJwksUrl, verifyAccessToken } from "@repo/auth-middleware";

export interface AuthVariables {
  userId: string;
  role: "user" | "admin";
}

const JWKS_URL = buildJwksUrl(process.env.AUTH_SERVICE_INTERNAL_URL || "");

export const verifyJwt: MiddlewareHandler<{
  Variables: AuthVariables;
}> = async (c: Context<{ Variables: AuthVariables }>, next) => {
  const authHeader = c.req.header("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Missing or invalid authorization header",
        },
      },
      401,
    );
  }

  try {
    const payload = await verifyAccessToken({
      jwksUrl: JWKS_URL,
      token: authHeader.slice(7),
    });

    c.set("userId", payload.sub);
    c.set("role", payload.role === "admin" ? "admin" : "user");

    await next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return c.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid or expired token",
        },
      },
      401,
    );
  }
};

export function requireRole(
  role: "user" | "admin",
): MiddlewareHandler<{ Variables: AuthVariables }> {
  return async (c, next) => {
    const userRole = c.get("role");
    if (userRole !== role) {
      return c.json(
        {
          error: {
            code: "FORBIDDEN",
            message: "Insufficient permissions",
          },
        },
        403,
      );
    }
    await next();
  };
}