import type { Context, MiddlewareHandler } from "hono";
import {
  buildJwksUrl,
  verifyAccessToken,
  verifyServiceToken,
} from "@repo/auth-middleware";

export type Role = "user" | "admin" | "delivery_agent";

export interface AuthVariables {
  userId: string;
  role: Role;
}

export interface ServiceVariables {
  serviceId: string;
  scopes: string[];
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

/**
 * Same as `verifyJwt` but reads the token from `?token=` instead of the
 * Authorization header — browsers cannot set headers on a WebSocket handshake.
 */
export const verifyJwtFromQuery: MiddlewareHandler<{
  Variables: AuthVariables;
}> = async (c: Context<{ Variables: AuthVariables }>, next) => {
  const token = c.req.query("token");

  if (!token) {
    return c.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Missing ?token= query parameter",
        },
      },
      401,
    );
  }

  try {
    const payload = await verifyAccessToken({ jwksUrl: JWKS_URL, token });
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

/**
 * Verifies an internal client-credentials token (audience "microservice").
 *
 * NOTE: auth-service has `registerService` / `authenticateService` and a
 * `serviceAccounts` table, but exposes no route that mints these tokens yet.
 * Until that route lands this middleware rejects every caller, so the publish
 * endpoint is not usable in a running system.
 */
export const verifyService: MiddlewareHandler<{
  Variables: ServiceVariables;
}> = async (c: Context<{ Variables: ServiceVariables }>, next) => {
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
    const payload = await verifyServiceToken({
      jwksUrl: JWKS_URL,
      token: authHeader.slice(7),
    });

    c.set("serviceId", payload.sub);
    c.set("scopes", payload.scope ? payload.scope.split(" ") : []);

    await next();
  } catch (err) {
    console.error("Service token verification failed:", err);
    return c.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid or expired service token",
        },
      },
      401,
    );
  }
};

export function requireScope(
  scope: string,
): MiddlewareHandler<{ Variables: ServiceVariables }> {
  return async (c, next) => {
    const scopes = c.get("scopes") ?? [];
    if (!scopes.includes(scope)) {
      return c.json(
        {
          error: {
            code: "FORBIDDEN",
            message: `Missing required scope: ${scope}`,
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
