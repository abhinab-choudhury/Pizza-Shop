const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
const PRODUCT_API_BASE =
  process.env.NEXT_PUBLIC_PRODUCT_API_URL || "http://localhost:3006";
const ORDER_API_BASE =
  process.env.NEXT_PUBLIC_ORDER_API_URL || "http://localhost:3004";

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
  role: "user" | "admin";
  status: string;
}

export interface ApiProduct {
  id: string;
  name: string;
  description: string | null;
  category: string;
  priceCents: number;
  sizes: { label: string; priceCents: number }[];
  toppings: { name: string; priceCents: number }[];
  addOns: { name: string; priceCents: number }[];
  imageUrl: string | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  name?: string;
  description?: string | null;
  category?: string;
  priceCents?: number;
  sizes?: { label: string; priceCents: number }[];
  toppings?: { name: string; priceCents: number }[];
  addOns?: { name: string; priceCents: number }[];
  imageUrl?: string | null;
  isAvailable?: boolean;
}

export interface CreateProductInput {
  name: string;
  description?: string;
  category?: string;
  priceCents: number;
  sizes?: { label: string; priceCents: number }[];
  toppings?: { name: string; priceCents: number }[];
  addOns?: { name: string; priceCents: number }[];
  imageUrl?: string;
  isAvailable?: boolean;
}

export interface ApiOrderItem {
  id: string;
  name: string;
  quantity: number;
  priceCents: number;
  price: number;
  options?: {
    size?: string;
    toppings?: string[];
    addOns?: string[];
  };
}

export interface ApiOrder {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  items: ApiOrderItem[];
  address: string | null;
  paymentMethod: string | null;
  totalCents: number;
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
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

async function requestProduct<T>(
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

  const res = await fetch(`${PRODUCT_API_BASE}${endpoint}`, config);

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: { message: "Request failed" } }));
    throw new Error(error.error?.message || `HTTP ${res.status}`);
  }

  return res.json();
}

async function requestOrder<T>(
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

  const res = await fetch(`${ORDER_API_BASE}${endpoint}`, config);

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ error: { message: "Request failed" } }));
    throw new Error(error.error?.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
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

  products: {
    list: (token: string) =>
      requestProduct<{ products: ApiProduct[] }>("/products", { token }),

    get: (token: string, id: string) =>
      requestProduct<{ product: ApiProduct }>(`/products/${id}`, {
        token,
      }).then((res) => res.product),

    create: (token: string, input: CreateProductInput) =>
      requestProduct<{ product: ApiProduct }>("/products", {
        method: "POST",
        token,
        body: input,
      }).then((res) => res.product),

    update: (token: string, id: string, input: ProductInput) =>
      requestProduct<{ product: ApiProduct }>(`/products/${id}`, {
        method: "PATCH",
        token,
        body: input,
      }).then((res) => res.product),

    remove: (token: string, id: string) =>
      requestProduct<{ message: string }>(`/products/${id}`, {
        method: "DELETE",
        token,
      }),
  },

  orders: {
    list: (token: string) =>
      requestOrder<{ orders: ApiOrder[] }>("/orders", { token }).then(
        (res) => res.orders,
      ),

    updateStatus: (token: string, id: string, status: string) =>
      requestOrder<{ order: ApiOrder }>(`/orders/${id}`, {
        method: "PATCH",
        token,
        body: { status },
      }).then((res) => res.order),
  },
};