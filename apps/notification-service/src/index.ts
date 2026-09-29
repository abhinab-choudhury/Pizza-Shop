import { serve, upgradeWebSocket } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { WebSocketServer } from "ws";
import { z } from "zod";
import "dotenv/config";
import { renderLandingPage } from "./landing";
import notificationsRouter from "./routes/notifications";
import { hub } from "./ws/hub";
import { isValidRoom, userRoom } from "./events";
import { verifyJwtFromQuery, type AuthVariables } from "./middleware/auth";

const app = new Hono<{ Variables: AuthVariables }>();

const corsOrigins = (
  process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:3001"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  "*",
  cors({
    origin: corsOrigins,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

const clientMessageSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("subscribe"), room: z.string() }),
  z.object({ action: z.literal("unsubscribe"), room: z.string() }),
  z.object({ action: z.literal("ping") }),
]);

app.get("/", (c) => {
  return c.html(renderLandingPage("Notification"));
});

app.get("/health", (c) => {
  return c.json({ status: "ok", service: "notification-service" });
});

app.get(
  "/ws",
  verifyJwtFromQuery,
  upgradeWebSocket((c) => {
    const userId = c.get("userId");
    const role = c.get("role");

    return {
      onOpen(_evt, ws) {
        const socket = ws.raw;
        if (!socket) return;

        hub.add(socket, userId, role);
        // Every client is implicitly a member of its own user room.
        hub.joinRoom(socket, userRoom(userId));
        hub.startHeartbeat();

        ws.send(
          JSON.stringify({
            kind: "ready",
            userId,
            role,
            rooms: [userRoom(userId)],
          }),
        );
      },

      onMessage(evt, ws) {
        const socket = ws.raw;
        if (!socket) return;

        const reply = (payload: unknown) =>
          ws.send(JSON.stringify(payload));

        let parsedJson: unknown;
        try {
          parsedJson = JSON.parse(String(evt.data));
        } catch {
          reply({ kind: "error", message: "Invalid JSON" });
          return;
        }

        const parsed = clientMessageSchema.safeParse(parsedJson);
        if (!parsed.success) {
          reply({ kind: "error", message: "Unknown action or payload shape" });
          return;
        }

        const msg = parsed.data;

        if (msg.action === "ping") {
          hub.markAlive(socket);
          reply({ kind: "pong" });
          return;
        }

        if (!isValidRoom(msg.room)) {
          reply({
            kind: "error",
            message: "Room must be order:<id>, user:<id> or rider:<id>",
          });
          return;
        }

        // A client may only subscribe to rooms it is entitled to.
        if (!canSubscribe(userId, role, msg.room)) {
          reply({ kind: "error", message: "Not permitted to join this room" });
          return;
        }

        if (msg.action === "subscribe") {
          const joined = hub.joinRoom(socket, msg.room);
          reply(
            joined
              ? { kind: "subscribed", room: msg.room }
              : { kind: "error", message: "Room limit reached" },
          );
        } else {
          hub.leaveRoom(socket, msg.room);
          reply({ kind: "unsubscribed", room: msg.room });
        }
      },

      onClose(_evt, ws) {
        if (ws.raw) hub.remove(ws.raw);
      },

      onError(_evt, ws) {
        console.error("WebSocket error");
        if (ws.raw) hub.remove(ws.raw);
      },
    };
  }),
);

function canSubscribe(userId: string, role: string, room: string): boolean {
  const [prefix, id] = room.split(":");

  if (prefix === "user" || prefix === "rider") {
    // Identity is derivable from the token, so enforce it strictly.
    return id === userId || role === "admin";
  }

  if (prefix === "order") {
    // Order ownership is NOT derivable from the token — confirming it needs a
    // lookup against order-service. Permitted for now so the template is
    // usable; wire an ownership check in before production.
    return Boolean(id);
  }

  return false;
}

app.route("/notifications", notificationsRouter);

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3010;

const wss = new WebSocketServer({ noServer: true });

function start() {
  serve(
    {
      fetch: app.fetch,
      port: PORT,
      websocket: { server: wss },
    },
    (info) => {
      console.log(
        `Notification server is running on http://localhost:${info.port}`,
      );
      console.log(`WebSocket endpoint: ws://localhost:${info.port}/ws?token=<jwt>`);
      if (process.env.ALLOW_ANONYMOUS_PUBLISH === "true") {
        console.warn(
          "WARNING: ALLOW_ANONYMOUS_PUBLISH is enabled — POST /notifications/events is unauthenticated. Do not use in production.",
        );
      }
    },
  );
}

start();
