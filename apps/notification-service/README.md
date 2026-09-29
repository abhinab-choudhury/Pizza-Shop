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
   `src/index.ts` permits any `order:<id>` because order ownership cannot be
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
- `turbo.json` — `NOTIFICATION_SERVICE_URL` is in `globalPassThroughEnv`.
- `apps/gateway/src/index.ts` — upstream entry for `notifications`.
