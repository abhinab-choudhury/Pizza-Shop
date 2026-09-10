const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
}

export interface ApiUser {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  status: string;
}

async function request<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const { method = "GET", body, headers = {}, token } = options;

  const config: RequestInit = {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, config);

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: { message: "Request failed" } }));
    throw new Error(error.error?.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ user: ApiUser; accessToken: string }>("/auth/login", {
        method: "POST",
        body: { email, password },
      }),

    getProfile: (token: string) =>
      request<{ user: ApiUser }>("/auth/me", { token }),

    logout: () =>
      request<{ message: string }>("/auth/logout", { method: "POST" }),
  },
};