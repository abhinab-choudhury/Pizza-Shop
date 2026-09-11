"use client";

export interface RazorpayPaymentSuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  prefill?: Record<string, unknown>;
  method?: Record<string, unknown>;
  theme?: Record<string, unknown>;
  modal?: { ondismiss?: () => void };
  handler: (response: RazorpayPaymentSuccess) => void;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: Record<string, unknown>) => void) => void;
}

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

let loadPromise: Promise<RazorpayConstructor | null> | null = null;

function getWindowRazorpay(): RazorpayConstructor | null | undefined {
  if (typeof window === "undefined") return null;
  return window.Razorpay;
}

export function loadRazorpay(): Promise<RazorpayConstructor | null> {
  if (typeof window === "undefined") return Promise.resolve(null);

  const existing = getWindowRazorpay();
  if (existing) return Promise.resolve(existing);

  if (!loadPromise) {
    loadPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        resolve(getWindowRazorpay() ?? null);
      };
      script.onerror = () => {
        loadPromise = null;
        resolve(null);
      };
      document.body.appendChild(script);
    });
  }

  return loadPromise;
}

export function openRazorpay(options: RazorpayOptions) {
  const RazorpayCtor = getWindowRazorpay();
  if (!RazorpayCtor) return null;
  return new RazorpayCtor(options);
}