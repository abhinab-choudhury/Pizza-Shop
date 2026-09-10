import { findOrCreateGoogleUser } from "./user.service";
import { generateTokenPair } from "./token.service";
import { UnauthorizedError } from "../utils/errors";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

export function getGoogleAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
}

async function exchangeCodeForTokens(
  code: string,
): Promise<GoogleTokenResponse> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("Google token exchange failed:", error);
    throw new UnauthorizedError("Failed to authenticate with Google");
  }

  return res.json() as Promise<GoogleTokenResponse>;
}

async function fetchGoogleUserInfo(
  accessToken: string,
): Promise<GoogleUserInfo> {
  const res = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!res.ok) {
    throw new UnauthorizedError(
      "Failed to fetch user info from Google",
    );
  }

  return res.json() as Promise<GoogleUserInfo>;
}

export async function handleGoogleCallback(code: string) {
  const tokens = await exchangeCodeForTokens(code);
  const userInfo = await fetchGoogleUserInfo(tokens.access_token);

  const userId = await findOrCreateGoogleUser(
    userInfo.id,
    userInfo.email,
    userInfo.name,
    tokens.access_token,
    tokens.refresh_token,
  );

  const tokenPair = await generateTokenPair(userId);

  return {
    ...tokenPair,
    user: {
      id: userId,
      email: userInfo.email,
      name: userInfo.name,
    },
  };
}
