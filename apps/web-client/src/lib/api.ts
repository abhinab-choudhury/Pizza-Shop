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

export interface ApiProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
}

export interface ApiOrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface ApiOrder {
  id: string;
  items: ApiOrderItem[];
  total: number;
  status: string;
  createdAt: string;
}

async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
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
    const error = await res.json().catch(() => ({ error: { message: "Request failed" } }));
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

    register: (email: string, name: string, password: string) =>
      request<{ user: ApiUser; accessToken: string }>("/auth/register", {
        method: "POST",
        body: { email, name, password },
      }),

    getProfile: (token: string) =>
      request<{ user: ApiUser }>("/auth/me", { token }),

    refreshToken: (refreshToken: string) =>
      request<{ accessToken: string }>("/auth/refresh", {
        method: "POST",
        body: { refreshToken },
      }),

    sendOtp: (email: string) =>
      request<{ message: string }>("/auth/otp/send", {
        method: "POST",
        body: { email, purpose: "login" },
      }),

    verifyOtp: (email: string, code: string) =>
      request<{ accessToken: string }>("/auth/otp/verify", {
        method: "POST",
        body: { email, code, purpose: "login" },
      }),

    logout: () =>
      request<{ message: string }>("/auth/logout", { method: "POST" }),
  },

  products: {
    getAll: (token?: string) =>
      request<ApiProduct[]>("/products", { token }),

    getById: (id: string, token?: string) =>
      request<ApiProduct>(`/products/${id}`, { token }),
  },

  orders: {
    create: (data: unknown, token: string) =>
      request<ApiOrder>("/orders", { method: "POST", body: data, token }),

    getAll: (token: string) =>
      request<ApiOrder[]>("/orders", { token }),

    getById: (id: string, token: string) =>
      request<ApiOrder>(`/orders/${id}`, { token }),
  },
};
