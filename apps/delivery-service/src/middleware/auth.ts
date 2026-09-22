import type { Context, MiddlewareHandler } from "hono";
import { buildJwksUrl, verifyAccessToken } from "@repo/auth-middleware";

export type Role = "user" | "admin" | "delivery_agent";

export interface AuthVariables {
  userId: string;
  role: Role;
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
    c.set("role", normalizeRole(payload.role));

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

function normalizeRole(role?: string): Role {
  if (role === "admin" || role === "delivery_agent") {
    return role;
  }
  return "user";
}

export function requireRole(
  roles: Role | Role[],
): MiddlewareHandler<{ Variables: AuthVariables }> {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return async (c, next) => {
    const userRole = c.get("role");
    if (!allowed.includes(userRole)) {
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

export function isAdmin(c: Context<{ Variables: AuthVariables }>): boolean {
  return c.get("role") === "admin";
}