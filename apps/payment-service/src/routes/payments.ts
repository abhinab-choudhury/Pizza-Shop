import { createHmac } from "node:crypto";
import { Hono } from "hono";
import Razorpay from "razorpay";
import { verifyJwt } from "../middleware/auth.js";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID ?? "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";
const RAZORPAY_ENABLED = Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);

const razorpay = RAZORPAY_ENABLED
  ? new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET })
  : null;

interface CreateOrderBody {
  amountCents?: number;
  orderId?: string;
}

interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export const paymentsRouter = new Hono();

paymentsRouter.get("/config", (c) => {
  return c.json({
    keyId: RAZORPAY_KEY_ID,
    enabled: RAZORPAY_ENABLED,
  });
});

paymentsRouter.post("/create-order", verifyJwt, async (c) => {
  if (!razorpay) {
    return c.json(
      {
        error: {
          code: "PAYMENT_NOT_CONFIGURED",
          message: "Razorpay is not configured",
        },
      },
      503,
    );
  }

  const body = await c.req.json().catch(() => null) as CreateOrderBody | null;
  const amountCents = body?.amountCents;
  const orderId = body?.orderId;

  if (
    typeof amountCents !== "number" ||
    !Number.isInteger(amountCents) ||
    amountCents <= 0 ||
    typeof orderId !== "string" ||
    orderId.length === 0
  ) {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "amountCents and orderId are required",
        },
      },
      400,
    );
  }

  try {
    const order = (await razorpay.orders.create({
      amount: amountCents,
      currency: "INR",
      receipt: orderId,
      payment_capture: true,
    })) as unknown as RazorpayOrderResponse;

    return c.json({
      id: order.id,
      keyId: RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    return c.json(
      {
        error: {
          code: "PAYMENT_ERROR",
          message: "Failed to create payment",
        },
      },
      502,
    );
  }
});

paymentsRouter.post("/verify", verifyJwt, async (c) => {
  const body = await c.req.json().catch(() => null);
  const { razorpayOrderId, paymentId, signature } = body ?? {};

  if (
    typeof razorpayOrderId !== "string" ||
    typeof paymentId !== "string" ||
    typeof signature !== "string" ||
    razorpayOrderId.length === 0 ||
    paymentId.length === 0 ||
    signature.length === 0
  ) {
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "razorpayOrderId, paymentId and signature are required",
        },
      },
      400,
    );
  }

  const expected = createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${paymentId}`)
    .digest("hex");

  return c.json({ verified: expected === signature });
});