import { importJWK, jwtVerify, type JWTPayload } from "jose";

export interface AuthenticatedUser extends JWTPayload {
  sub: string;
  role?: string;
  scope?: string;
}

export interface VerifyTokenOptions {
  jwksUrl: string;
  token: string;
  issuer?: string;
  audience?: string;
}

const JWKS_CACHE = new Map<string, unknown>();
let keysFetchTime = 0;
const KEYS_CACHE_TTL = 300_000; // 5 minutes

export async function fetchJWKS(jwksUrl: string): Promise<Map<string, unknown>> {
  const now = Date.now();
  if (JWKS_CACHE.size > 0 && now - keysFetchTime < KEYS_CACHE_TTL) {
    return JWKS_CACHE;
  }

  const res = await fetch(jwksUrl);
  const data = (await res.json()) as { keys: { kid: string }[] };

  JWKS_CACHE.clear();
  for (const key of data.keys) {
    JWKS_CACHE.set(key.kid, key);
  }
  keysFetchTime = now;

  return JWKS_CACHE;
}

/**
 * Build the JWKS URL for a given auth-service base URL, stripping any
 * trailing slash and normalizing the well-known path.
 */
export function buildJwksUrl(authServiceInternalUrl: string): string {
  const base =
    (authServiceInternalUrl || "http://localhost:3002").replace(/\/+$/, "");
  return `${base}/auth/.well-known/jwks.json`;
}

/**
 * Framework-agnostic JWT verification for end-user access tokens.
 * Resolves the signing key from the auth-service JWKS and validates the
 * issuer/audience claims. Throws on any failure.
 */
export async function verifyAccessToken(
  options: VerifyTokenOptions,
): Promise<AuthenticatedUser> {
  const {
    jwksUrl,
    token,
    issuer = "auth-service",
    audience = "pizza-shop",
  } = options;

  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }

  const header = JSON.parse(
    Buffer.from(parts[0]!, "base64url").toString(),
  ) as { kid?: string };

  const jwks = await fetchJWKS(jwksUrl);
  const jwk = jwks.get(header.kid ?? "");

  if (!jwk) {
    throw new Error("Unknown signing key");
  }

  const key = await importJWK(jwk, "RS256");
  const { payload } = await jwtVerify(token, key, { issuer, audience });

  return payload as unknown as AuthenticatedUser;
}

/**
 * Framework-agnostic JWT verification for internal service tokens
 * (client-credentials, audience "microservice").
 */
export async function verifyServiceToken(
  options: Omit<VerifyTokenOptions, "audience">,
): Promise<AuthenticatedUser> {
  return verifyAccessToken({ ...options, audience: "microservice" });
}