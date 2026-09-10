import { importJWK } from "jose";
import { Context, Next } from "koa";
import { UnauthorizedError } from "../utils/errors";

const JWKS_URL =
  process.env.AUTH_SERVICE_INTERNAL_URL ||
  "http://localhost:3002/.well-known/jwks.json";

let cachedKeys: Map<string, any> = new Map();
let keysFetchTime = 0;
const KEYS_CACHE_TTL = 300_000; // 5 minutes

async function fetchJWKS() {
  const now = Date.now();
  if (cachedKeys.size > 0 && now - keysFetchTime < KEYS_CACHE_TTL) {
    return cachedKeys;
  }

  try {
    const res = await fetch(JWKS_URL);
    const data = (await res.json()) as { keys: any[] };

    cachedKeys = new Map();
    for (const key of data.keys) {
      cachedKeys.set(key.kid, key);
    }
    keysFetchTime = now;
  } catch (err) {
    console.error("Failed to fetch JWKS:", err);
    if (cachedKeys.size === 0) throw err;
  }

  return cachedKeys;
}

export async function verifyJwtMiddleware(
  ctx: Context,
  next: Next,
) {
  const authHeader = ctx.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or invalid authorization header");
  }

  const token = authHeader.slice(7);

  try {
    // Decode header to get kid
    const headerPayload = token.split(".");
    if (headerPayload.length !== 3) {
      throw new UnauthorizedError("Invalid token format");
    }

    const encodedHeader = headerPayload[0];
    if (!encodedHeader) {
      throw new UnauthorizedError("Invalid token format");
    }

    const header = JSON.parse(
      Buffer.from(encodedHeader, "base64url").toString(),
    );

    const jwks = await fetchJWKS();
    const jwk = jwks.get(header.kid);

    if (!jwk) {
      throw new UnauthorizedError("Unknown signing key");
    }

    const key = await importJWK(jwk, "RS256");

    const { jwtVerify } = await import("jose");
    const { payload } = await jwtVerify(token, key, {
      issuer: "auth-service",
    });

    ctx.state.user = payload;
    ctx.state.userId = payload.sub;

    await next();
  } catch (err) {
    if (err instanceof UnauthorizedError) throw err;
    throw new UnauthorizedError("Invalid or expired token");
  }
}
