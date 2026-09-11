import {
  SignJWT,
  jwtVerify,
  importJWK,
  JWTPayload,
} from "jose";
import {
  randomBytes,
  createHash,
  generateKeyPairSync,
  createPublicKey,
  createPrivateKey,
} from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { refreshTokens, users, userRoleEnum } from "../db/schema";
import { UnauthorizedError } from "../utils/errors";

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY_DAYS = 7;
const REFRESH_TOKEN_BYTES = 48;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AccessTokenPayload extends JWTPayload {
  sub: string;
  role: "user" | "admin";
  scope: string;
  iss: string;
  aud: string;
}

let keyPair: { publicKey: string; privateKey: string } | null = null;
let currentKid = "auth-key-1";

export function getKeyPair() {
  if (!keyPair) {
    keyPair = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
      publicKeyEncoding: { type: "spki", format: "pem" },
    });
  }
  return keyPair;
}

export function getPrivateKey() {
  return createPrivateKey(getKeyPair().privateKey);
}

export function getPublicKey() {
  return getKeyPair().publicKey;
}

export function getCurrentKid() {
  return currentKid;
}

export async function getJWKS() {
  const { publicKey } = getKeyPair();
  const keyObject = createPublicKey(publicKey);
  const jwkResult = keyObject.export({ format: "jwk" });

  return {
    keys: [
      {
        ...jwkResult,
        kid: currentKid,
        use: "sig",
        alg: "RS256",
      },
    ],
  };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateOpaqueToken(): string {
  return randomBytes(REFRESH_TOKEN_BYTES).toString("base64url");
}

export function generateOTPCode(length: number = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

export async function getUserRole(
  userId: string,
): Promise<"user" | "admin"> {
  const [row] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!row) {
    throw new UnauthorizedError("User not found");
  }

  return row.role;
}

export async function generateAccessToken(
  userId: string,
  role: "user" | "admin",
): Promise<string> {
  const privateKey = getPrivateKey();
  return new SignJWT({
    sub: userId,
    role,
    scope: "access",
  })
    .setProtectedHeader({ alg: "RS256", kid: currentKid })
    .setIssuedAt()
    .setIssuer("auth-service")
    .setAudience("pizza-shop")
    .setJti(crypto.randomUUID())
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(privateKey);
}

export async function generateTokenPair(
  userId: string,
): Promise<TokenPair> {
  const role = await getUserRole(userId);
  const accessToken = await generateAccessToken(userId, role);
  const rawRefreshToken = generateOpaqueToken();
  const tokenHash = hashToken(rawRefreshToken);
  const familyId = crypto.randomUUID();

  await db.insert(refreshTokens).values({
    userId,
    familyId,
    tokenHash,
    expiresAt: new Date(
      Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    ),
  });

  return { accessToken, refreshToken: rawRefreshToken };
}

export async function rotateRefreshToken(
  oldRefreshToken: string,
): Promise<TokenPair> {
  const tokenHash = hashToken(oldRefreshToken);

  const [row] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.tokenHash, tokenHash))
    .limit(1);

  if (!row) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  if (row.expiresAt < new Date()) {
    throw new UnauthorizedError("Refresh token expired");
  }

  if (row.revoked) {
    throw new UnauthorizedError("Refresh token revoked");
  }

  // Reuse detection
  if (row.used) {
    await db
      .update(refreshTokens)
      .set({ revoked: true })
      .where(eq(refreshTokens.familyId, row.familyId));
    throw new UnauthorizedError(
      "Token reuse detected — all sessions revoked",
    );
  }

  const newRawToken = generateOpaqueToken();
  const newHash = hashToken(newRawToken);

  await db.transaction(async (tx) => {
    await tx
      .update(refreshTokens)
      .set({ used: true })
      .where(eq(refreshTokens.id, row.id));

    await tx.insert(refreshTokens).values({
      userId: row.userId,
      familyId: row.familyId,
      tokenHash: newHash,
      parentId: row.id,
      expiresAt: new Date(
        Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
      ),
    });
  });

  const role = await getUserRole(row.userId);
  const accessToken = await generateAccessToken(row.userId, role);

  return { accessToken, refreshToken: newRawToken };
}

export async function revokeRefreshToken(
  refreshToken: string,
): Promise<void> {
  const tokenHash = hashToken(refreshToken);

  await db
    .update(refreshTokens)
    .set({ revoked: true })
    .where(eq(refreshTokens.tokenHash, tokenHash));
}

export async function revokeAllUserTokens(
  userId: string,
): Promise<void> {
  await db
    .update(refreshTokens)
    .set({ revoked: true })
    .where(eq(refreshTokens.userId, userId));
}

export async function verifyAccessToken(
  token: string,
): Promise<AccessTokenPayload> {
  const publicKey = getPublicKey();
  const { payload } = await jwtVerify(
    token,
    await importJWK(
      // Convert PEM to JWK for jose
      (
        await import("crypto")
      ).createPublicKey(publicKey).export({ format: "jwk" }) as any,
      "RS256",
    ),
    {
      issuer: "auth-service",
      audience: "pizza-shop",
    },
  );
  return payload as AccessTokenPayload;
}

export async function generateServiceToken(
  serviceId: string,
  scopes: string[],
): Promise<string> {
  const privateKey = getPrivateKey();
  return new SignJWT({
    sub: serviceId,
    scope: scopes.join(" "),
  })
    .setProtectedHeader({ alg: "RS256", kid: currentKid })
    .setIssuedAt()
    .setIssuer("auth-service")
    .setAudience("microservice")
    .setJti(crypto.randomUUID())
    .setExpirationTime("5m")
    .sign(privateKey);
}
