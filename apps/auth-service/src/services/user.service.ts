import { eq } from "drizzle-orm";
import * as argon2 from "@node-rs/argon2";
import { db } from "../db";
import { users, accounts, sessions } from "../db/schema";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors";

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  status: string;
}

function toUserResponse(user: typeof users.$inferSelect): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    status: user.status,
  };
}

export async function createUser(
  input: CreateUserInput,
): Promise<UserResponse> {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (existing.length > 0) {
    throw new ConflictError("Email already registered");
  }

  const passwordHash = await argon2.hash(input.password);

  const [user] = await db
    .insert(users)
    .values({
      email: input.email,
      name: input.name,
      passwordHash,
    })
    .returning();

  return toUserResponse(user);
}

export async function verifyPassword(
  email: string,
  password: string,
): Promise<string> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  if (!user.passwordHash) {
    throw new UnauthorizedError(
      "This account uses social login. Please sign in with Google.",
    );
  }

  if (user.status !== "active") {
    throw new UnauthorizedError("Account is not active");
  }

  const valid = await argon2.verify(user.passwordHash, password);
  if (!valid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  return user.id;
}

export async function getUserById(
  userId: string,
): Promise<UserResponse> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return toUserResponse(user);
}

export async function findOrCreateGoogleUser(
  googleId: string,
  email: string,
  name: string,
  accessToken: string,
  refreshToken?: string,
): Promise<string> {
  // Check if account already exists
  const [existingAccount] = await db
    .select()
    .from(accounts)
    .where(
      eq(accounts.provider, "google") &&
        eq(accounts.providerAccountId, googleId),
    )
    .limit(1);

  if (existingAccount) {
    // Update tokens
    await db
      .update(accounts)
      .set({
        accessToken,
        refreshToken: refreshToken || existingAccount.refreshToken,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, existingAccount.id));

    return existingAccount.userId;
  }

  // Find or create user
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  let userId: string;

  if (existingUser) {
    userId = existingUser.id;
    // Link Google account
    await db.insert(accounts).values({
      userId,
      provider: "google",
      providerAccountId: googleId,
      accessToken,
      refreshToken,
    });
  } else {
    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name,
        emailVerified: true,
      })
      .returning();

    userId = newUser.id;

    // Create Google account link
    await db.insert(accounts).values({
      userId,
      provider: "google",
      providerAccountId: googleId,
      accessToken,
      refreshToken,
    });
  }

  return userId;
}

export async function findOrCreateEmailUser(
  email: string,
): Promise<string> {
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    return existingUser.id;
  }

  const [newUser] = await db
    .insert(users)
    .values({
      email,
      emailVerified: true,
    })
    .returning();

  return newUser.id;
}

export async function createSession(
  userId: string,
  token: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.insert(sessions).values({
    userId,
    token,
    ipAddress,
    userAgent,
    expiresAt,
  });
}

export async function deleteSession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.token, token));
}
