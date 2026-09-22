# Architecture — Scale to Delivery + Native Apps (KMP)

This document is the scale-up plan for the Pizza Shop platform: from the current
take-away, web-only product to a full delivery platform with **native mobile apps
built in Kotlin Multiplatform (KMP)** and a **separate delivery-agent site/app**.

It is guidance, not the final word. Treat the decisions marked **[DECIDE]** as
open questions to lock down before implementation.

---

## 1. Target state

Four consumer surfaces share one API:

```
   ┌──────────────┬─────────────────┬────────────────────┬──────────────────┐
   │ Customer Web │  Customer App   │  Delivery Agent    │ Delivery Agent   │
   │  (Next.js)   │  (KMP / CMP )   │  Web (Next.js)     │ App (KMP,       │
   │              │   Android+iOS   │                    │  offline-first)  │
   └──────┬───────┴────────┬────────┴─────────┬──────────┴────────┬─────────┘
          └────────────────▼──────────────────┘        ┌──────────┘
                  WebSocket/SSE + FCM push             │
                       ┌───────────────────────────────▼─────┐
                       │           API Gateway / BFF         │
                       │  JWT+JWKS auth, CORS once, routing, │
                       │  rate limiting, URL stability       │
                       └───────────────────────┬─────────────┘
   ┌───────────┬───────────┬───────────────────┼────────────────┬───────────┐
   ▼           ▼           ▼                   ▼                ▼           ▼
auth-svc   product-svc order-svc          delivery-svc      payment-svc email-svc
(own DB)   (own DB)    (own DB)           (own DB, NEW)      (Razorpay)   (SMTP)
             ▲                                         │
             │                Redis Streams (event bus) │  FCM (APNs via FCM)
             └─────────────── outbox pattern ──────────┘   notification-svc (NEW)
```

### Platform matrix

| Surface | Stack | Status |
|---|---|---|
| Customer website | Next.js (existing `web-client`) | exists |
| Admin panel | Next.js (`admin-client`) | exists |
| Customer native app | **KMP** — Compose Multiplatform (Android + iOS), Ktor client | new |
| Delivery agent website | Next.js (`delivery-agent-web`) | new |
| Delivery agent native app | **KMP** — Compose Multiplatform, offline-first (SQLDelight) | new |

> **Stack decision.** KMP is the mobile/native path; Next.js remains the web
> path. Compose for Web/Wasm is still immature for SEO/content sites, so the
> websites stay Next.js. One codebase via KMP-everywhere is possible but **not
> recommended**; if you insist, only the customer flows are worth it.

### Client/API boundary

Every surface consumes the **same gateway API** (`/api/...`). Building the KMP
apps never touches service code because the gateway is the contract.

---

## 2. The gateway (build first)

Clients today call services directly with hard-coded ports/URLs. With four
clients and seven services that breaks down. The gateway [DECIDE: Hono —
matches repo conventions] does:

- **Single origin + CORS**: one allowlist (`CORS_ORIGINS`), `Allow-Credentials`.
- **Routing**: `/api/auth/*` → auth, `/api/products/*` → product,
  `/api/orders/*` → order, `/api/payments/*` → payment,
  `/api/delivery/*` → delivery, `/api/email/*` → email.
- **Auth passthrough**: `Authorization` header is forwarded untouched; each
  service still verifies JWTs locally against the auth-service JWKS
  (`@repo/auth-middleware`). No behaviour change downstream.
- **Stability**: service URLs move to server-side env vars
  (`*_SERVICE_URL`), never ship to clients.
- Future: rate limiting (Redis), request logging, load balancing.

Env the gateway needs: `PORT`, `CORS_ORIGINS`, `AUTH_SERVICE_INTERNAL_URL`
(optional, for `/config` health), one `<SERVICE>_SERVICE_URL` per upstream.

---

## 3. Per-service databases (change before scaling)

Today all DB services share one `public` schema, isolated only by migration
journals (`drizzle_auth`, `drizzle_products`, `drizzle`). Delivery adds a new
data owner, so split now:

1. **Step 1 — one instance, one DB per service**
   `pizza_shop_auth`, `pizza_shop_products`, `pizza_shop_orders`, `pizza_shop_delivery`.
   Each service's `DATABASE_URL` changes; Drizzle journals already map 1:1.
2. **Step 2 — independent instances** (managed: Neon/Supabase per service) when
   you need isolated failure domains and pools.

**Rule:** a new service that owns data gets its own DB. Shared data doesn't mean
shared tables — it means events and API calls.

---

## 4. New services

### delivery-service (new, owns data → own DB `pizza_shop_delivery`)

Hono + Drizzle. Tables:

- **riders** — `id`, `userId` (→ auth `sub`), `name`, `phone`, `vehicleType`,
  `isOnline`, `currentLat`/`currentLng`, `lastSeenAt`, `status`.
- **delivery_zones** — `id`, `name`, `feeCents`, `isActive` (fee lookup at
  checkout; static zones until you have data).
- **deliveries** — `id`, `orderId` (unique, NOT a FK — order-service owns it),
  `zoneId`→zones, `riderId`→riders, customer contact + address, `feeCents`,
  `etaMinutes`, `status`, timestamps.

**Order status machine** (single source of truth in order-service, events copied
here for delivery):

```
placed → paid → preparing ──(pickup)──▶ ready_for_pickup → picked_up
                        └──(delivery)─▶ pending → assigned → accepted
                                        → out_for_delivery → delivered
                                   any state → cancelled
```

Key endpoints:

| Method | Path | Role | Purpose |
|---|---|---|---|
| GET | `/delivery/zones` | public | active zones + fee |
| POST/PATCH | `/delivery/zones` | admin | zone management |
| GET | `/delivery/deliveries` | admin / agent | list (agent → own only) |
| POST | `/delivery/deliveries` | admin | create from order |
| POST | `/delivery/deliveries/:id/assign` | admin | assign rider |
| POST | `/delivery/deliveries/:id/accept` | agent | accept own delivery |
| POST | `/delivery/deliveries/:id/pickup` | agent | picked up |
| POST | `/delivery/deliveries/:id/deliver` | agent | delivered |
| POST | `/delivery/deliveries/:id/cancel` | admin | cancel |
| GET/POST | `/delivery/riders/me` | agent | agent profile |
| PATCH | `/delivery/riders/me/status` | agent | go online/offline |
| PATCH | `/delivery/riders/me/location` | agent | heartbeat location |

**Rider identity** is the auth JWT `sub` (a `delivery_agent` role in
auth-service, [DECIDE] how it's granted). Location updates are dumb POSTs at a
5–10s interval; ETA is computed server-side, not client-side.

### notification-service (new, no DB until needed)

- **WebSocket** for live order tracking + rider location (native apps: Ktor
  WebSocket client).
- **FCM** push when the app is backgrounded (APNs via FCM covers iOS).
- Started with in-memory rooms keyed by order/user; persisted presence only when
  clustered.

### auth-service changes

- Issue/recognize a `delivery_agent` role on `sub`.
- **Mobile-friendly refresh**: today refresh tokens are HttpOnly cookies — native
  apps can't hold those. Add a bearer-token refresh endpoint
  (`POST /auth/refresh` accepting the refresh token in the body/header) so KMP
  apps can rotate. Keep the cookie path for web.

---

## 5. Event bus + outbox (do this with delivery)

Order placement triggers payment, delivery assignment, notifications. No
distributed transactions — use **outbox + Redis Streams** (one more container;
Redis is also your cache/rate-limiter later):

1. Service A writes its row **and an event row** to the same local DB
   transaction (outbox table).
2. A small relay reads the outbox and publishes to Redis Streams.
3. Consumers read + process with consumer groups (at-least-once); ids make
   handlers idempotent.

Start events: `order.placed`, `payment.captured`, `order.ready_for_pickup`,
`delivery.assigned`, `delivery.out_for_delivery`, `delivery.delivered`.

---

## 6. KMP client architecture

One Gradle root (`kmp/`) outside the pnpm workspace — Turborepo doesn't run
Gradle.

```
kmp/
├── shared/                 # (KMP library) Ktor client, DTOs, auth repo, DI
│   ├── commonMain/
│   └── androidMain|iosMain/# expect/actual: TokenStorage, base URL, push, location
├── customer-app/          # Compose Multiplatform (Android + iOS)
└── delivery-agent-app/    # CMP + SQLDelight offline cache + sync queue
```

| Concern | Approach |
|---|---|
| Networking | Ktor Client + `kotlinx.serialization` against gateway `/api/*` |
| Auth state | shared `AuthRepository`; `TokenStorage` → Keychain / EncryptedSharedPreferences; auto-refresh Ktor interceptor |
| Real-time | Ktor WebSocket (tracking) + FCM (background) |
| Offline (agent) | SQLDelight cache + retry/sync queue; agent works with weak signal |
| Location | expect/actual wrapper (`startUpdates` → callback) |
| Web case | Compose for Web/Wasm in the same modules, only if decision made |

### Contract sharing

One OpenAPI spec drives both sides so Node services and Kotlin DTOs never
drift: TS types via `openapi-typescript`, Kotlin models via OpenAPI Generator or
hand-written DTOs behind a thin mapper. [DECIDE]

---

## 7. Repo layout

```
Pizza-Shop/
├── apps/
│   ├── web-client/            # customer website (Next.js) — exists
│   ├── admin-client/          # admin panel (Next.js) — exists
│   ├── auth-service/ …        # — exists
│   ├── product-service/ …     # — exists
│   ├── order-service/ …       # — exists
│   ├── payment-service/ …     # — exists
│   ├── email-service/ …       # — exists
│   ├── gateway/               # NEW — API gateway (Hono), port 3007
│   ├── delivery-service/      # NEW — delivery/riders/zones, port 3008
│   └── delivery-agent-web/    # NEW — agent website (Next.js)
├── packages/
│   ├── auth-middleware/       # — exists
│   ├── domain/                # NEW — shared event/order-status contract types
│   └── …configs
├── kmp/                       # NEW — Gradle root (shared/, customer-app/, delivery-agent-app/)
├── docker-compose.yml         # + services for Redis, notification-service
└── ARCHITECTURE.md            # this file
```

Port allocation (ports 3000–3006 in use):

| Service | Port |
|---|---|
| gateway | 3007 |
| delivery-service | 3008 |
| notification-service | 3009 (later) |
| Redis (dev) | 6379 (later) |

---

## 8. Roadmap

1. **Backend hardening** — per-service DBs, gateway, bearer-token refresh
   endpoint. Web remains fully working throughout.
2. **Delivery domain** — delivery fields in order-service (`deliveryType`,
   `address`, `feeCents`), delivery-service with riders/zones/deliveries.
3. **Delivery-agent web** (Next.js) first — proves the delivery API with the
   cheapest client.
4. **Delivery-agent KMP app** second — offline-first, best fit for the shared
   platform, validates auth/push/location plumbing.
5. **Customer KMP app** — reuse `shared/`; tracking, FCM, order history.
6. **notification-service** — WebSockets + FCM, event bus + outbox.
7. **Scale** — managed per-service Postgres, deploy frontends (Vercel) +
   services (Fly.io/Railway/ECS), Redis in prod.

The four surfaces share exactly one API. Adding the native apps never touches
service code once the gateway is in place.

---

## 9. Open decisions

- [DECIDE] Web stack stays Next.js (recommended) vs. KMP-even-on-web.
- [DECIDE] Gateway framework: Hono (recommended).
- [DECIDE] How `delivery_agent` role/grant flow works in auth-service.
- [DECIDE] Mobile token strategy: short-lived RS256 bearer + rotating refresh
  (recommended).
- [DECIDE] Push: FCM-only (covers both platforms) vs. FCM + APNs.
- [DECIDE] Real-time: own WebSocket service vs. managed (Ably/Pusher).
- [DECIDE] Contract source of truth: OpenAPI spec (recommended).
- [DECIDE] Rider assignment algorithm: static zones + first-available (start)
  vs. something smarter later.