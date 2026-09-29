import { serve } from "@hono/node-server";
import { WebSocketServer } from "ws";
import { app } from "./app.js";

const DEFAULT_PORT = 3010;

/**
 * Builds the Node server backing the notification service.
 *
 * The returned `http.Server` is what Vercel binds a WebSocket connection to
 * when a function default-exports it, so the same factory serves both the local
 * `src/index.ts` entry and the deployed `api/server.ts` function.
 *
 * `hub` is a per-process singleton. On a long-lived Node server that is exactly
 * what you want; on Vercel each function instance has its own copy, so fan-out
 * only reaches sockets held by the instance that handled the publish. See the
 * deployment section in README.md.
 */
export function createNotificationServer(port?: number) {
  const wss = new WebSocketServer({ noServer: true });
  const listenPort = port ?? (process.env.PORT ? Number(process.env.PORT) : DEFAULT_PORT);

  return serve(
    {
      fetch: app.fetch,
      port: listenPort,
      websocket: { server: wss },
    },
    (info) => {
      console.log(
        `Notification server is running on http://localhost:${info.port}`,
      );
      console.log(
        `WebSocket endpoint: ws://localhost:${info.port}/ws?token=<jwt>`,
      );
      if (process.env.ALLOW_ANONYMOUS_PUBLISH === "true") {
        console.warn(
          "WARNING: ALLOW_ANONYMOUS_PUBLISH is enabled — POST /notifications/events is unauthenticated. Do not use in production.",
        );
      }
    },
  );
}
