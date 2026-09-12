import { importJWK, jwtVerify, type JWTPayload } from "jose";
import type { Context, MiddlewareHandler } from "hono";

export interface AuthVariables {
  userId: string;
  role: "user" | "admin";
}

const AUTH_SERVICE_INTERNAL_URL =
  process.env.AUTH_SERVICE_INTERNAL_URL || "http://localhost:3002";
const JWKS_URL = `${AUTH_SERVICE_INTERNAL_URL}/auth/.well-known/jwks.json`;

let cachedKeys: Map<string, unknown> = new Map();
let keysFetchTime = 0;
const KEYS_CACHE_TTL = 300_000; // 5 minutes

async function fetchJWKS(): Promise<Map<string, unknown>> {
  const now = Date.now();
  if (cachedKeys.size > 0 && now - keysFetchTime < KEYS_CACHE_TTL) {
    return cachedKeys;
  }

  const res = await fetch(JWKS_URL);
  const data = (await res.json()) as { keys: { kid: string }[] };

  cachedKeys = new Map();
  for (const key of data.keys) {
    cachedKeys.set(key.kid, key);
  }
  keysFetchTime = now;

  return cachedKeys;
}

interface AccessTokenPayload extends JWTPayload {
  sub: string;
  role: "user" | "admin";
}

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

  const token = authHeader.slice(7);

  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }

    const header = JSON.parse(
      Buffer.from(parts[0]!, "base64url").toString(),
    ) as { kid?: string };

    const jwks = await fetchJWKS();
    const jwk = jwks.get(header.kid ?? "");

    if (!jwk) {
      throw new Error("Unknown signing key");
    }

    const key = await importJWK(jwk, "RS256");
    const { payload } = await jwtVerify(token, key, {
      issuer: "auth-service",
      audience: "pizza-shop",
    });

    const typed = payload as unknown as AccessTokenPayload;

    c.set("userId", typed.sub);
    c.set("role", typed.role);

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