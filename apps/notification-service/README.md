# Notification Service

> Hono + WebSocket (`ws`) + FCM (planned) — port **3010**

Realtime push layer for the pizza shop. Specced in `ARCHITECTURE.md:144-150`.
Delivers order-tracking events to connected clients over WebSocket, and to
backgrounded apps over FCM.

This is a **template/scaffold**: the WebSocket transport, room model,
authorization and event contracts are implemented and tested. Push (FCM) and
persistence are deliberately not implemented yet.

## Scope

| Concern | Status |
|---|---|
| WebSocket transport | Implemented |
| In-memory rooms + fanout + dedupe | Implemented |
| JWT auth on connect, room authorization | Implemented |
| Event contracts + validation | Implemented |
| HTTP publish endpoint | Implemented (token-gated, see below) |
| FCM push | Not implemented |
| Persistence / presence | Not implemented (per spec: "no DB until needed") |
| Redis Streams consumer | Not implemented — publish is HTTP-only today |

## Running

```bash
pnpm dev:notification          # or: pnpm --filter notification-service dev
```

Copy `.env.template` to `.env` first.

## Deploying to Vercel

This service is **not** deployable as a plain `export default app.fetch` Hono
function. Vercel only accepts a WebSocket upgrade when the function
default-exports the `http.Server` instance itself, so the Vercel entry point is
`api/server.ts` → `createNotificationServer()` from `src/server.ts`.

`src/app.ts` holds the Hono app with no server bootstrap, so the local
(`src/index.ts`) and deployed (`api/server.ts`) entries share one app instance
definition.

### One-time project setup

There is no Vercel project for this service yet. In the dashboard:

1. **Add New → Project**, import this repo.
2. **Root Directory** → `apps/notification-service`.
3. **Framework Preset** → *Other*.
4. **Include Files Outside the Root Directory** → **on** (the monorepo
   lockfile and `packages/` live above it).
5. **Fluid compute** → **on**. Required for WebSockets; default for projects
   created after 2025-04-23.
6. Install / build commands are in `vercel.json`:
   `pnpm install --filter notification-service...` and
   `turbo run build --filter=notification-service...`.
7. `vercel.json` rewrites `/*` to `/api/server`, so the service is served from
   the project root and `/ws` upgrades survive the rewrite.

Then add the environment variables under **Settings → Environment Variables**:

| Variable | Notes |
|---|---|
| `CORS_ORIGINS` | must include the deployed client origins |
| `AUTH_SERVICE_INTERNAL_URL` | deployed auth-service URL, for JWKS |
| `ALLOW_ANONYMOUS_PUBLISH` | **leave unset** — see gap 1 below |
| `PORT` | set by Vercel; do not pin |

Finally, point the gateway at it: `NOTIFICATION_SERVICE_URL=https://<domain>`.

### Vercel-specific caveats

These are platform limits, not bugs, and they shape the design:

1. **Fan-out does not work across instances.** A WebSocket connection is pinned
   to the one function instance that accepted it, and new connections are not
   guaranteed to reach the same instance. `hub` is an in-memory singleton, so a
   publish only reaches sockets held by *that* instance. This needs an external
   pub/sub layer (e.g. Upstash Redis) before order events reach real users.
2. **Connections are capped.** A WebSocket is billed as a function invocation
   and inherits the function duration limit — 300s by default, 800s on
   Pro/Enterprise. Clients must reconnect and resubscribe; the heartbeat in
   `src/ws/hub.ts` is for liveness, not for keeping the connection alive.
3. **WebSocket support is public beta** on Vercel Functions (since 2026-06-22).
   The API could change.
4. **In-memory `hub` state is lost** on redeploy and on instance recycle.

If 1–4 are unacceptable, deploy this service to a long-lived host
(Fly.io / Railway / a VPS) instead. It is a plain `@hono/node-server` app, so
`pnpm --filter notification-service start` is all it needs.

## HTTP API

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/` | public | landing page |
| GET | `/health` | public | liveness |
| GET | `/ws?token=<jwt>` | user JWT | WebSocket upgrade |
| POST | `/notifications/events` | service token | publish an event |
| GET | `/notifications/stats` | admin JWT | connection/room introspection |
| GET | `/notifications/event-types` | public | list supported event types |

### Publishing

`POST /notifications/events` takes a `NotificationEvent` (see `src/events.ts`):

```json
{
  "type": "delivery.assigned",
  "orderId": "ord_123",
  "userId": "usr_9",
  "occurredAt": "2026-09-29T10:00:00.000Z",
  "data": { "riderId": "rider_7", "riderName": "Ravi" }
}
```

Response reports the rooms fanned out to and how many sockets received it:

```json
{ "published": true, "rooms": ["order:ord_123", "user:usr_9", "rider:rider_7"], "delivered": 3, "dropped": 0 }
```

## WebSocket protocol

Connect to `ws://localhost:3010/ws?token=<access-token>`. The token is a query
parameter because browsers cannot set headers on a WebSocket handshake.

On connect the server replies with a `ready` frame and auto-joins you to your
own `user:<sub>` room. Client messages:

```json
{ "action": "subscribe",   "room": "order:ord_123" }
{ "action": "unsubscribe", "room": "order:ord_123" }
{ "action": "ping" }
```

Rooms are `order:<id>`, `user:<id>` and `rider:<id>`. Server frames:

| `kind` | Meaning |
|---|---|
| `ready` | connection established, current rooms |
| `subscribed` / `unsubscribed` | room membership changed |
| `event` | a `NotificationEvent` targeted at one of your rooms |
| `pong` | reply to `ping`, also resets the heartbeat timer |
| `error` | malformed message or unauthorized room |

An event is delivered **once** per socket even if the socket is in several of
its target rooms.

## Known gaps

These are intentional for a template but must be closed before production:

1. **`POST /notifications/events` cannot authenticate in a running system.**
   It is gated by `verifyService` (audience `microservice`), but auth-service
   has no route that mints client-credentials tokens — `registerService` and
   `authenticateService` exist in `apps/auth-service/src/services/` with no
   caller. Until that route lands, set `ALLOW_ANONYMOUS_PUBLISH=true` locally.
   This flag is checked at boot and logs a warning; never deploy with it on.
2. **Order-room authorization is not enforced.** `canSubscribe` in
   `src/app.ts` permits any `order:<id>` because order ownership cannot be
   derived from the JWT. Confirming it needs a lookup against order-service.
   `user:` and `rider:` rooms are enforced strictly.
3. **FCM push is not implemented.** `events.ts` is the place to hook it.
4. **Port is 3010, not the 3009 in `ARCHITECTURE.md:240`.** 3009 is already
   `DELIVERY_AGENT_WEB` in every `CORS_ORIGINS`.
5. **WebSocket is not reachable through the gateway.** The gateway's upstream
   table maps `/api/notifications` → `/notifications`; `/ws` sits outside that
   prefix, so clients must connect to the service directly (or the gateway
   needs an explicit `upgrade` route).

## Wiring

- `packages/domain` — the event types in `src/events.ts` are duplicated from
  `ARCHITECTURE.md`; move them there once the package exists (see comment in
  the file).
- `packages/auth-middleware` — `verifyAccessToken` / `verifyServiceToken`.
- `turbo.json` — `NOTIFICATION_SERVICE_URL` is in `globalPassThroughEnv`, and
  `VERCEL` / `NODE_ENV` are in the `build` task's `env` so a local build is
  never restored from cache inside a Vercel build.
- `apps/gateway/src/index.ts` — upstream entry for `notifications`.
- `pnpm-lock.yaml` — the `apps/notification-service` importer entry must stay
  committed. Vercel installs with `--frozen-lockfile` and fails the build
  without it.
