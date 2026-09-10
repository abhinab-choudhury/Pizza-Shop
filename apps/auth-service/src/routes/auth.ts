import Router from "koa-router";
import { z } from "zod";
import { validate } from "../middleware/validate";
import rateLimit from "../middleware/rate-limit";
import { verifyJwtMiddleware } from "../middleware/auth";
import * as userService from "../services/user.service";
import * as oauthService from "../services/oauth.service";
import * as otpService from "../services/otp.service";
import * as tokenService from "../services/token.service";
import * as serviceAuthService from "../services/service-auth.service";
import { BadRequestError } from "../utils/errors";

const router = new Router({ prefix: "/auth" });

// --- Schemas ---

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const otpSendSchema = z.object({
  email: z.string().email("Invalid email address"),
  purpose: z.enum(["email_verify", "login", "register"]),
});

const otpVerifySchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().length(6, "OTP must be 6 digits"),
  purpose: z.enum(["email_verify", "login", "register"]),
});

const serviceTokenSchema = z.object({
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
});

// --- Routes ---

// Register
router.post(
  "/register",
  rateLimit(60_000, 10),
  validate(registerSchema),
  async (ctx) => {
    const body = ctx.request.body as z.infer<typeof registerSchema>;
    const user = await userService.createUser(body);
    const tokens = await tokenService.generateTokenPair(user.id);

    ctx.set(
      "Set-Cookie",
      `refresh_token=${tokens.refreshToken}; HttpOnly; Path=/auth/refresh; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict${process.env.NODE_ENV !== "production" ? "" : "; Secure"}`,
    );

    ctx.status = 201;
    ctx.body = {
      user,
      accessToken: tokens.accessToken,
    };
  },
);

// Login
router.post(
  "/login",
  rateLimit(60_000, 20),
  validate(loginSchema),
  async (ctx) => {
    const body = ctx.request.body as z.infer<typeof loginSchema>;
    const userId = await userService.verifyPassword(
      body.email,
      body.password,
    );
    const tokens = await tokenService.generateTokenPair(userId);
    const user = await userService.getUserById(userId);

    ctx.set(
      "Set-Cookie",
      `refresh_token=${tokens.refreshToken}; HttpOnly; Path=/auth/refresh; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict${process.env.NODE_ENV !== "production" ? "" : "; Secure"}`,
    );

    ctx.body = {
      user,
      accessToken: tokens.accessToken,
    };
  },
);

// Google OAuth - redirect
router.get("/google", async (ctx) => {
  const url = oauthService.getGoogleAuthUrl();
  ctx.redirect(url);
});

// Google OAuth - callback
router.get("/google/callback", async (ctx) => {
  const code = ctx.query.code as string;

  if (!code) {
    throw new BadRequestError("Authorization code is required");
  }

  const result = await oauthService.handleGoogleCallback(code);

  ctx.set(
    "Set-Cookie",
    `refresh_token=${result.refreshToken}; HttpOnly; Path=/auth/refresh; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict${process.env.NODE_ENV !== "production" ? "" : "; Secure"}`,
  );

  // Redirect to frontend with access token
  const frontendUrl =
    process.env.WEB_CLIENT_URL || "http://localhost:3000";
  ctx.redirect(
    `${frontendUrl}/auth/callback?accessToken=${result.accessToken}`,
  );
});

// Send OTP
router.post(
  "/otp/send",
  rateLimit(60_000, 5),
  validate(otpSendSchema),
  async (ctx) => {
    const body = ctx.request.body as z.infer<typeof otpSendSchema>;
    const result = await otpService.sendOtp(
      body.email,
      body.purpose,
    );
    ctx.body = result;
  },
);

// Verify OTP
router.post(
  "/otp/verify",
  rateLimit(60_000, 10),
  validate(otpVerifySchema),
  async (ctx) => {
    const body = ctx.request.body as z.infer<typeof otpVerifySchema>;
    const tokens = await otpService.verifyOtp(
      body.email,
      body.code,
      body.purpose,
    );

    ctx.set(
      "Set-Cookie",
      `refresh_token=${tokens.refreshToken}; HttpOnly; Path=/auth/refresh; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict${process.env.NODE_ENV !== "production" ? "" : "; Secure"}`,
    );

    ctx.body = {
      accessToken: tokens.accessToken,
    };
  },
);

// Refresh token
router.post("/refresh", async (ctx) => {
  // Get refresh token from cookie or body
  const cookieRefreshToken = ctx.cookies.get("refresh_token");
  const bodyRefreshToken = (ctx.request.body as any)
    ?.refreshToken;
  const refreshToken = cookieRefreshToken || bodyRefreshToken;

  if (!refreshToken) {
    throw new BadRequestError("Refresh token is required");
  }

  const tokens = await tokenService.rotateRefreshToken(refreshToken);

  ctx.set(
    "Set-Cookie",
    `refresh_token=${tokens.refreshToken}; HttpOnly; Path=/auth/refresh; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict${process.env.NODE_ENV !== "production" ? "" : "; Secure"}`,
  );

  ctx.body = {
    accessToken: tokens.accessToken,
  };
});

// Logout
router.post("/logout", async (ctx) => {
  const cookieRefreshToken = ctx.cookies.get("refresh_token");
  const bodyRefreshToken = (ctx.request.body as any)
    ?.refreshToken;
  const refreshToken = cookieRefreshToken || bodyRefreshToken;

  if (refreshToken) {
    await tokenService.revokeRefreshToken(refreshToken);
  }

  ctx.cookies.set("refresh_token", "", {
    httpOnly: true,
    path: "/auth/refresh",
    maxAge: 0,
  });

  ctx.body = { message: "Logged out successfully" };
});

// Get current user
router.get("/me", verifyJwtMiddleware, async (ctx) => {
  const userId = ctx.state.userId as string;
  const user = await userService.getUserById(userId);
  ctx.body = { user };
});

// JWKS endpoint
router.get("/.well-known/jwks.json", async (ctx) => {
  const jwks = await tokenService.getJWKS();
  ctx.body = jwks;
});

// Service token (client credentials)
router.post(
  "/service/token",
  rateLimit(60_000, 30),
  validate(serviceTokenSchema),
  async (ctx) => {
    const body = ctx.request.body as z.infer<
      typeof serviceTokenSchema
    >;
    const result = await serviceAuthService.authenticateService(
      body.clientId,
      body.clientSecret,
    );
    ctx.body = result;
  },
);

export default router;
