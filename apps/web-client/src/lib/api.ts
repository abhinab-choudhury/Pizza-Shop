const AUTH_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
const PRODUCT_BASE =
  process.env.NEXT_PUBLIC_PRODUCT_API_URL || "http://localhost:3006";
const ORDER_BASE =
  process.env.NEXT_PUBLIC_ORDER_API_URL || "http://localhost:3004";
const PAYMENT_BASE =
  process.env.NEXT_PUBLIC_PAYMENT_API_URL || "http://localhost:3005";

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

export interface MenuProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  priceCents: number;
  sizes: { label: string; priceCents: number }[];
  toppings: { name: string; priceCents: number }[];
  addOns: { name: string; priceCents: number }[];
  imageUrl?: string;
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

type TokenRefreshedHandler = (newToken: string | null) => void;
let onTokenRefreshed: TokenRefreshedHandler | null = null;
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export function setTokenRefreshedHandler(handler: TokenRefreshedHandler | null) {
  onTokenRefreshed = handler;
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${AUTH_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      const data = (await res.json()) as { accessToken: string };
      const newToken = data.accessToken;
      localStorage.setItem("access_token", newToken);
      onTokenRefreshed?.(newToken);
      return newToken;
    }
  } catch {
    // ignore
  }

  localStorage.removeItem("access_token");
  onTokenRefreshed?.(null);
  window.dispatchEvent(new Event("session-expired"));
  return null;
}

async function request<T>(
  base: string,
  endpoint: string,
  options: ApiOptions = {},
  refreshed = false,
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

  const res = await fetch(`${base}${endpoint}`, config);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: "Request failed" } }));

    if (res.status === 401 && token && !refreshed) {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshAccessToken().finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
      }

      if (refreshPromise) {
        const newToken = await refreshPromise;
        if (newToken) {
          return request(base, endpoint, { ...options, token: newToken }, true);
        }
      }
    }

    throw new Error(error.error?.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  setTokenRefreshedHandler,
  auth: {
    googleAuthUrl: `${AUTH_BASE}/auth/google`,

    login: (email: string, password: string) =>
      request<{ user: ApiUser; accessToken: string }>(
        AUTH_BASE,
        "/auth/login",
        {
          method: "POST",
          body: { email, password },
        },
      ),

    register: (email: string, name: string, password: string) =>
      request<{ user: ApiUser; accessToken: string }>(
        AUTH_BASE,
        "/auth/register",
        {
          method: "POST",
          body: { email, name, password },
        },
      ),

    getProfile: (token: string) =>
      request<{ user: ApiUser }>(AUTH_BASE, "/auth/me", { token }),

    refreshToken: (refreshToken?: string) =>
      request<{ accessToken: string }>(AUTH_BASE, "/auth/refresh", {
        method: "POST",
        body: refreshToken ? { refreshToken } : undefined,
      }),

    sendOtp: (email: string) =>
      request<{ message: string }>(AUTH_BASE, "/auth/otp/send", {
        method: "POST",
        body: { email, purpose: "login" },
      }),

    verifyOtp: (email: string, code: string) =>
      request<{ accessToken: string }>(AUTH_BASE, "/auth/otp/verify", {
        method: "POST",
        body: { email, code, purpose: "login" },
      }),

    logout: () =>
      request<{ message: string }>(AUTH_BASE, "/auth/logout", {
        method: "POST",
      }),
  },

  products: {
    getAll: async (): Promise<MenuProduct[]> => {
      const res = await request<{
        products: {
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
        }[];
      }>(PRODUCT_BASE, "/products");

      return res.products
        .filter((p) => p.isAvailable)
        .map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description ?? "",
          category: p.category,
          priceCents: p.priceCents,
          sizes: p.sizes ?? [],
          toppings: p.toppings ?? [],
          addOns: p.addOns ?? [],
          imageUrl: p.imageUrl ?? undefined,
        }));
    },
  },

  orders: {
    create: (
      token: string,
      data: {
        items: {
          id: string;
          name: string;
          quantity: number;
          priceCents: number;
          options?: {
            size?: string;
            toppings?: string[];
            addOns?: string[];
          };
        }[];
        paymentMethod: string;
      },
    ) =>
      request<{ order: ApiOrder }>(ORDER_BASE, "/orders", {
        method: "POST",
        body: data,
        token,
      }).then((res) => res.order),

    getAll: (token: string) =>
      request<{ orders: ApiOrder[] }>(ORDER_BASE, "/orders", { token }).then(
        (res) => res.orders,
      ),

    getById: (token: string, id: string) =>
      request<{ order: ApiOrder }>(ORDER_BASE, `/orders/${id}`, {
        token,
      }).then((res) => res.order),
  },

  payments: {
    config: () =>
      request<{ keyId: string; enabled: boolean }>(
        PAYMENT_BASE,
        "/payments/config",
      ),

    createOrder: (token: string, orderId: string, amountCents: number) =>
      request<{
        id: string;
        keyId: string;
        amount: number;
        currency: string;
      }>(PAYMENT_BASE, "/payments/create-order", {
        method: "POST",
        body: { orderId, amountCents },
        token,
      }),

    verify: (
      token: string,
      razorpayOrderId: string,
      paymentId: string,
      signature: string,
    ) =>
      request<{ verified: boolean }>(PAYMENT_BASE, "/payments/verify", {
        method: "POST",
        body: { razorpayOrderId, paymentId, signature },
        token,
      }).then((res) => res.verified),
  },
};