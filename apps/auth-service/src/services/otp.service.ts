import { eq, and, gt, desc } from "drizzle-orm";
import { db } from "../db";
import { otpCodes } from "../db/schema";
import { findOrCreateEmailUser } from "./user.service";
import { generateTokenPair } from "./token.service";
import {
  BadRequestError,
  TooManyRequestsError,
  UnauthorizedError,
} from "../utils/errors";
import { generateOTPCode } from "./token.service";

const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const MAX_OTP_SENDS = 3;
const RATE_LIMIT_WINDOW_MS = 60_000;

export type OtpPurpose = "email_verify" | "login" | "register";

interface EmailProvider {
  send(to: string, subject: string, html: string): Promise<void>;
}

class ConsoleEmailProvider implements EmailProvider {
  async send(to: string, subject: string, html: string): Promise<void> {
    console.log(`\n[EMAIL OTP] To: ${to}`);
    console.log(`[EMAIL OTP] Subject: ${subject}`);
    // Extract code from HTML for easy dev testing
    const codeMatch = html.match(/(\d{6})/);
    if (codeMatch) {
      console.log(`[EMAIL OTP] Code: ${codeMatch[1]}`);
    }
    console.log("");
  }
}

class SmtpEmailProvider implements EmailProvider {
  private transporter: any;

  constructor() {
    this.transporter = null;
  }

  async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.transporter) {
      const nodemailer = await import("nodemailer");
      const host = process.env.SMTP_HOST;
      const secure = process.env.SMTP_SECURE === "true";
      const auth =
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined;

      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(process.env.SMTP_PORT || "1025", 10),
        secure,
        auth,
      });
    }

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@pizzashop.com",
      to,
      subject,
      html,
    });
  }
}

function getEmailProvider(): EmailProvider {
  if (process.env.SMTP_HOST) {
    return new SmtpEmailProvider();
  }
  console.warn("[OTP] SMTP not configured, logging OTP to console");
  return new ConsoleEmailProvider();
}

function buildOtpEmail(code: string): { subject: string; html: string } {
  return {
    subject: "Your Pizza Shop Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #D32F2F;">🍕 Pizza Shop</h2>
        <p>Your verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px; margin: 20px 0;">
          ${code}
        </div>
        <p style="color: #666; font-size: 14px;">
          This code expires in ${OTP_EXPIRY_MINUTES} minutes.
        </p>
        <p style="color: #999; font-size: 12px;">
          If you didn't request this code, please ignore this email.
        </p>
      </div>
    `,
  };
}

export async function sendOtp(
  email: string,
  purpose: OtpPurpose,
): Promise<{ message: string }> {
  // Rate limit: check recent sends
  const recentSends = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.email, email),
        eq(otpCodes.purpose, purpose),
        gt(
          otpCodes.createdAt,
          new Date(Date.now() - RATE_LIMIT_WINDOW_MS),
        ),
      ),
    );

  if (recentSends.length >= MAX_OTP_SENDS) {
    throw new TooManyRequestsError(
      "Too many OTP requests. Wait before trying again.",
    );
  }

  // Invalidate existing unused OTPs for this email + purpose
  const existingOtps = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.email, email),
        eq(otpCodes.purpose, purpose),
        eq(otpCodes.used, false),
      ),
    );

  for (const otp of existingOtps) {
    await db
      .update(otpCodes)
      .set({ used: true })
      .where(eq(otpCodes.id, otp.id));
  }

  const code = generateOTPCode(6);

  await db.insert(otpCodes).values({
    email,
    code,
    purpose,
    expiresAt: new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
    ),
  });

  // Send email
  const emailProvider = getEmailProvider();
  const { subject, html } = buildOtpEmail(code);
  await emailProvider.send(email, subject, html);

  return { message: "OTP sent to your email" };
}

export async function verifyOtp(
  email: string,
  code: string,
  purpose: OtpPurpose,
): Promise<{ accessToken: string; refreshToken: string }> {
  const [record] = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.email, email),
        eq(otpCodes.purpose, purpose),
        eq(otpCodes.used, false),
        gt(otpCodes.expiresAt, new Date()),
      ),
    )
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);

  if (!record) {
    throw new BadRequestError("OTP expired or not found");
  }

  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    await db
      .update(otpCodes)
      .set({ used: true })
      .where(eq(otpCodes.id, record.id));
    throw new TooManyRequestsError(
      "Too many attempts. Request a new OTP.",
    );
  }

  if (record.code !== code) {
    await db
      .update(otpCodes)
      .set({ attempts: record.attempts + 1 })
      .where(eq(otpCodes.id, record.id));
    throw new UnauthorizedError("Invalid OTP code");
  }

  // Mark as used
  await db
    .update(otpCodes)
    .set({ used: true })
    .where(eq(otpCodes.id, record.id));

  // Find or create user
  const userId = await findOrCreateEmailUser(email);

  // Generate token pair
  const tokenPair = await generateTokenPair(userId);

  return tokenPair;
}
