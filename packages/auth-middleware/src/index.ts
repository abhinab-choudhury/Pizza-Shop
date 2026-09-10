import { importJWK, jwtVerify, JWTPayload } from "jose";
import { Context, Next } from "koa";

export interface AuthenticatedUser {
  sub: string;
  scope: string;
  iss: string;
  aud: string;
  jti: string;
  iat: number;
  exp: number;
}

declare module "koa" {
  interface DefaultState {
    user?: AuthenticatedUser;
    userId?: string;
  }
}

const JWKS_CACHE = new Map<string, any>();
let keysFetchTime = 0;
const KEYS_CACHE_TTL = 300_000;

async function fetchJWKS(
  jwksUrl: string,
): Promise<Map<string, any>> {
  const now = Date.now();
  if (
    JWKS_CACHE.size > 0 &&
    now - keysFetchTime < KEYS_CACHE_TTL
  ) {
    return JWKS_CACHE;
  }

  const res = await fetch(jwksUrl);
  const data = (await res.json()) as { keys: any[] };

  JWKS_CACHE.clear();
  for (const key of data.keys) {
    JWKS_CACHE.set(key.kid, key);
  }
  keysFetchTime = now;

  return JWKS_CACHE;
}

export function createAuthMiddleware(options: {
  jwksUrl: string;
  issuer?: string;
  audience?: string;
}) {
  const {
    jwksUrl,
    issuer = "auth-service",
    audience = "pizza-shop",
  } = options;

  return async function authMiddleware(
    ctx: Context,
    next: Next,
  ) {
    const authHeader = ctx.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      ctx.status = 401;
      ctx.body = {
        error: {
          code: "UNAUTHORIZED",
          message: "Missing or invalid authorization header",
        },
      };
      return;
    }

    const token = authHeader.slice(7);

    try {
      const headerPayload = token.split(".");
      if (headerPayload.length !== 3) {
        throw new Error("Invalid token format");
      }

      const header = JSON.parse(
        Buffer.from(headerPayload[0]!, "base64url").toString(),
      );

      const jwks = await fetchJWKS(jwksUrl);
      const jwk = jwks.get(header.kid);

      if (!jwk) {
        throw new Error("Unknown signing key");
      }

      const key = await importJWK(jwk, "RS256");
      const { payload } = await jwtVerify(token, key, {
        issuer,
        audience,
      });

      ctx.state.user = payload as unknown as AuthenticatedUser;
      ctx.state.userId = payload.sub;

      await next();
    } catch (err) {
      ctx.status = 401;
      ctx.body = {
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid or expired token",
        },
      };
    }
  };
}

export function createServiceAuthMiddleware(options: {
  jwksUrl: string;
  issuer?: string;
}) {
  const { jwksUrl, issuer = "auth-service" } = options;

  return async function serviceAuthMiddleware(
    ctx: Context,
    next: Next,
  ) {
    const authHeader = ctx.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      ctx.status = 401;
      ctx.body = {
        error: {
          code: "UNAUTHORIZED",
          message: "Missing or invalid authorization header",
        },
      };
      return;
    }

    const token = authHeader.slice(7);

    try {
      const headerPayload = token.split(".");
      const header = JSON.parse(
        Buffer.from(headerPayload[0]!, "base64url").toString(),
      );

      const jwks = await fetchJWKS(jwksUrl);
      const jwk = jwks.get(header.kid);

      if (!jwk) {
        throw new Error("Unknown signing key");
      }

      const key = await importJWK(jwk, "RS256");
      const { payload } = await jwtVerify(token, key, {
        issuer,
        audience: "microservice",
      });

      ctx.state.user = payload as unknown as AuthenticatedUser;
      ctx.state.userId = payload.sub;

      await next();
    } catch (err) {
      ctx.status = 401;
      ctx.body = {
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid or expired service token",
        },
      };
    }
  };
}


