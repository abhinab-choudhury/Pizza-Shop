import { importJWK, jwtVerify, type JWTPayload } from "jose";
import type { NextFunction, Request, Response } from "express";
import logger from "./logger";

const AUTH_SERVICE_INTERNAL_URL =
  process.env.AUTH_SERVICE_INTERNAL_URL || "http://localhost:3002";
const JWKS_URL = `${AUTH_SERVICE_INTERNAL_URL}/auth/.well-known/jwks.json`;

const KEYS_CACHE_TTL = 300_000; // 5 minutes

let cachedKeys: Map<string, unknown> = new Map();
let keysFetchTime = 0;

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

export const verifyJwt = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Missing or invalid authorization header",
      },
    });
    return;
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

    res.locals.userId = typed.sub;
    res.locals.role = typed.role;

    next();
  } catch (err) {
    logger.warn(`JWT verification failed: ${(err as Error).message}`);
    res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid or expired token",
      },
    });
  }
};

export const requireAdmin = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.locals.role !== "admin") {
    res.status(403).json({
      error: {
        code: "FORBIDDEN",
        message: "Insufficient permissions",
      },
    });
    return;
  }
  next();
};