# Pizza Shop — Microservices Platform

A full-stack pizza ordering platform built with a microservices architecture. Includes web clients and backend services.

## Architecture

```
 ┌─────────────────────────────────────────────────────────────────┐
 │                             Clients                             │
 │              ┌──────────────┐    ┌──────────────┐               │
 │              │  Web Client  │    │ Admin Client │               │
 │              │  (Next.js)   │    │  (Next.js)   │               │
 │              │    :3000     │    │    :3001     │               │
 │              └──────────────┘    └──────────────┘               │
 └──────────────────────────────────┬──────────────────────────────┘
                                    │
 ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
 │   Auth    │ │  Email    │ │   Order   │ │  Payment  │ │  Product  │
 │  Service  │ │  Service  │ │  Service  │ │  Service  │ │  Service  │
 │  (Koa)    │ │ (Express) │ │ (Express) │ │  (Hono)   │ │  (Hono)   │
 │   :3002   │ │   :3003   │ │   :3004   │ │   :3005   │ │   :3006   │
 └────┬──────┘ └────┬──────┘ └────┬──────┘ └────┬──────┘ └────┬──────┘
      │             │             │             │             │
 ┌────▼─────────────▼─────────────▼─────────────▼─────────────▼───────┐
 │                   PostgreSQL 16  (shared database)                 │
 └────────────────────────────────────────────────────────────────────┘
```

> Clients (web + admin) call each microservice directly — there is no API gateway. A microservice is authenticated with a JWT issued by the auth service; services verify tokens locally against the auth-service JWKS. All services connect to the same PostgreSQL database, and auth/email services send OTP & transactional emails to Mailpit in development.

## Tech Stack

| Layer | Technology |
|---|---|
| **Monorepo** | pnpm workspaces + Turborepo |
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui |
| **Auth Service** | Koa.js 3, Drizzle ORM, PostgreSQL, JWT (RS256) |
| **Order Service** | Express.js 5, Drizzle ORM |
| **Payment Service** | Hono.js 4, Razorpay |
| **Product Service** | Hono.js 4, Drizzle ORM |
| **Email Service** | Express.js 5 |
| **Database** | PostgreSQL 16 |
| **Containerization** | Docker Compose |

## Port Allocation

| Service | Port |
|---|---|
| Web Client | 3000 |
| Admin Client | 3001 |
| Auth Service | 3002 |
| Email Service | 3003 |
| Order Service | 3004 |
| Payment Service | 3005 |
| Product Service | 3006 |
| Gateway | 3007 |
| Delivery Service | 3008 |
| PostgreSQL | 5432 |
| pgAdmin (dev) | 5050 |
| Mailpit SMTP (dev) | 1025 |
| Mailpit UI (dev) | 8025 |

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| **Node.js** | >= 20 (Next.js 16 requires ≥ 20.9) | Runtime for all services |
| **pnpm** | >= 10 | Package manager |
| **Docker** | >= 24 | PostgreSQL database (or use a managed DB) |
| **Docker Compose** | >= 2.20 | Container orchestration |

---

## Installation

```bash
# 1. Install dependencies (installs all workspaces)
pnpm install
```

This installs every package in the monorepo. A success message confirms `pnpm-lock.yaml` is up to date.

---

## Environment Setup

Each service ships a `.env.template`. Copy it to `.env` and fill in the values. `.env` files are git-ignored — never commit real credentials.

```bash
# One-off: copy all templates into place
for app in auth-service product-service order-service payment-service email-service delivery-service gateway; do
  cp apps/$app/.env.template apps/$app/.env
done

# Frontend clients use .env.local
cp apps/web-client/.env.template apps/web-client/.env.local
cp apps/admin-client/.env.template apps/admin-client/.env.local
```

### Backend services

**Database** — all *DB-backed* services (auth, product, order) must point at the **same** PostgreSQL database. Set the identical `DATABASE_URL` in each `.env`. You can use the bundled Docker container (`postgres://postgres:postgres@localhost:5432/pizza_shop_auth`) or a managed database (e.g. Neon). Migrations are isolated per service (see [Migrations](#database--migrations)).

**CORS** — every service reads a comma-separated allowlist from `CORS_ORIGINS`. Default: `http://localhost:3000,http://localhost:3001`. For production, add your deployed client origins, e.g.:

```bash
CORS_ORIGINS="http://localhost:3000,http://localhost:3001,https://pizza-shop-client.vercel.app,https://pizza-shop-admin-client.vercel.app"
```

**Service-to-service auth** — services verify user JWTs by fetching the auth-service JWKS. Set `AUTH_SERVICE_INTERNAL_URL` to the auth-service base URL (local: `http://localhost:3002`). The JWKS lives at `<AUTH_SERVICE_INTERNAL_URL>/auth/.well-known/jwks.json`.

### Variable reference

| Service | Variable | Required | Notes |
|---|---|---|---|
| **auth-service** | `DATABASE_URL` | Yes | Shared PostgreSQL connection string |
| | `JWT_ACCESS_SECRET` | Yes | Signing secret for access JWTs |
| | `JWT_REFRESH_SECRET` | Yes | Secret for refresh-token hashing |
| | `GOOGLE_CLIENT_ID` | No | Google OAuth client ID (login button) |
| | `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| | `GOOGLE_REDIRECT_URI` | No | e.g. `http://localhost:3002/auth/google/callback` |
| | `WEB_CLIENT_URL` | No | Client origin used after OAuth callback |
| | `CORS_ORIGINS` | No | Comma-separated browser origins |
| | `SMTP_HOST` / `SMTP_PORT` | No | Mailpit dev: `localhost:1025`; leave empty to log OTPs to console |
| | `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | No | Real SMTP (e.g. Gmail) credentials |
| | `AUTH_SERVICE_INTERNAL_URL` | No | Own public URL, used for the JWKS fetched by other services |
| **product-service** | `DATABASE_URL` | Yes | Same DB as auth-service |
| | `CORS_ORIGINS` | No | Browser origins allowed |
| | `AUTH_SERVICE_INTERNAL_URL` | No | Auth base URL for JWKS |
| **order-service** | `DATABASE_URL` | Yes | Same DB as auth-service |
| | `CORS_ORIGINS` | No | Browser origins allowed |
| | `AUTH_SERVICE_INTERNAL_URL` | No | Auth base URL for JWKS |
| **payment-service** | `RAZORPAY_KEY_ID` | Yes¹ | Razorpay test/live key ID |
| | `RAZORPAY_KEY_SECRET` | Yes¹ | Razorpay key secret (**server-side only**) |
| | `CORS_ORIGINS` | No | Browser origins allowed |
| | `AUTH_SERVICE_INTERNAL_URL` | No | Auth base URL for JWKS |
| **email-service** | `WEB_CLIENT` / `ADMIN_CLIENT` | No | CORS origins |
| **gateway** | `PORT` | No | Defaults to 3007 |
| | `<SERVICE>_SERVICE_URL` | Yes | One per upstream (auth, email, order, payment, product, delivery) |
| | `CORS_ORIGINS` | No | Browser origins allowed |
| **delivery-service** | `DATABASE_URL` | Yes | Own DB (`pizza_shop_delivery`) |
| | `CORS_ORIGINS` | No | Browser origins allowed |
| | `AUTH_SERVICE_INTERNAL_URL` | No | Auth base URL for JWKS |
| **web-client** | `NEXT_PUBLIC_API_URL` | No | Auth service URL (default `http://localhost:3002`) |
| | `NEXT_PUBLIC_PRODUCT_API_URL` | No | Product service URL (`...:3006`) |
| | `NEXT_PUBLIC_ORDER_API_URL` | No | Order service URL (`...:3004`) |
| | `NEXT_PUBLIC_PAYMENT_API_URL` | No | Payment service URL (`...:3005`) |
| **admin-client** | `NEXT_PUBLIC_API_URL` | No | Auth service URL |
| | `NEXT_PUBLIC_PRODUCT_API_URL` | No | Product service URL |
| | `NEXT_PUBLIC_ORDER_API_URL` | No | Order service URL |

¹ Payment flows (Razorpay) are disabled until both keys are set.

### External accounts

- **Google OAuth**: create an OAuth client in Google Cloud Console and add your `GOOGLE_REDIRECT_URI` to the authorized redirect URIs.
- **Razorpay**: test keys are fine for local development. The key secret is only ever used by the backend — the client receives only the key ID.

---

## Database & Migrations

### Start PostgreSQL

```bash
# Start PostgreSQL only
pnpm db:up

# Start PostgreSQL + pgAdmin + Mailpit (development tools)
docker compose --profile dev up -d

# Stop / restart / logs
pnpm db:down
pnpm db:restart
pnpm db:logs
```

Mailpit captures OTP/order emails in development — open `http://localhost:8025` to read them.

### Shared database, per-service migrations

All DB-backed services write to the **same** database, but each keeps its own Drizzle migration journal (auth → schema `drizzle_auth`, product → schema `drizzle_products`, order → schema `drizzle`, delivery → schema `drizzle_delivery`). This lets the services evolve their schemas independently without colliding.

The delivery-service also owns a separate database. Create it once, then migrate:

```bash
pnpm --filter delivery-service db:create   # creates pizza_shop_delivery
```

Migrations are applied **per service**. The root `db:migrate` only targets auth-service — run migrations explicitly per package:

```bash
# Apply pending migrations
pnpm --filter auth-service db:migrate
pnpm --filter product-service db:migrate
pnpm --filter order-service db:migrate
pnpm --filter delivery-service db:migrate
```

On startup each DB-backed service also verifies the connection and logs `Successfully connected to the database` (it exits if the DB is unreachable).

### Generate & push

After editing a service's Drizzle schema, generate + apply its migration:

```bash
pnpm --filter <service> db:generate     # create migration SQL from schema
pnpm --filter <service> db:migrate      # apply it
pnpm --filter <service> db:push         # dev-only: push schema without migration files
pnpm --filter <service> db:studio       # open Drizzle Studio browser UI
```

(`<service>` = `auth-service`, `product-service`, `order-service`, or `delivery-service`.)

### Seed data

Development seeds are idempotent (existing rows are left untouched):

```bash
pnpm --filter auth-service db:seed     # demo users + dev service accounts
pnpm --filter product-service db:seed  # full take-away menu (₹, sizes + toppings)
pnpm --filter order-service db:seed    # sample orders across statuses
pnpm --filter delivery-service db:seed # delivery zones
```

Seeded accounts:

| Account | Email | Password | Role |
|---|---|---|---|
| Store Admin | `admin@pizzashop.com` | `Password123!` | `admin` |
| Demo User | `demo@pizzashop.com` | `Password123!` | `user` |

Only `admin` accounts can sign in to the Admin Client (`:3001`) and manage products.

> The shop is **take-away / pick-up only**. Prices are stored as paise (`price_cents = rupees × 100`).

---

## Running the Project

### All services (recommended)

```bash
pnpm dev
```

Turborepo starts every backend service and frontend client in parallel on the ports listed above.

### Individual services

```bash
# Frontend clients
pnpm dev:web         # Web Client → http://localhost:3000
pnpm dev:admin       # Admin Client → http://localhost:3001

# Backend services
pnpm dev:auth        # Auth Service → http://localhost:3002
pnpm dev:email       # Email Service → http://localhost:3003
pnpm dev:order       # Order Service → http://localhost:3004
pnpm dev:payment     # Payment Service → http://localhost:3005
pnpm dev:product     # Product Service → http://localhost:3006
pnpm dev:gateway     # Gateway → http://localhost:3007
pnpm dev:delivery    # Delivery Service → http://localhost:3008
```

### Useful combinations

```bash
# Backend only, no frontend
turbo run dev --filter='*-service'

# Auth + web client
pnpm dev:auth & pnpm dev:web
```

Each DB-backed service logs `Successfully connected to the database` before it starts listening. If you see a failure instead, the DB isn't reachable from that service's `DATABASE_URL`.

---

## Service Details

### Auth Service (Koa.js — Port 3002)

Central authentication: register/login (email + password), Google OAuth, email OTP, JWT issuance (RS256) and a JWKS endpoint for other services.

#### API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register with email + password |
| POST | `/auth/login` | No | Login with email + password |
| GET | `/auth/google` | No | Redirect to Google OAuth consent |
| GET | `/auth/google/callback` | No | Handle OAuth callback |
| POST | `/auth/otp/send` | No | Send 6-digit email OTP |
| POST | `/auth/otp/verify` | No | Verify OTP → tokens |
| POST | `/auth/refresh` | Cookie | Rotate refresh token |
| POST | `/auth/logout` | Cookie | Revoke refresh token |
| GET | `/auth/me` | Bearer | Get current user profile |
| GET | `/auth/.well-known/jwks.json` | No | Public keys used by other services |
| POST | `/auth/service/token` | Client creds | Issue an internal service token |

#### Authentication Flow

**Google OAuth** — the web client links to `GET /auth/google`. After consent, the callback redirects back to `WEB_CLIENT_URL` with an `access_token` in the query string; the client stores it and calls `/auth/me`.

**Email/Password login:**
```bash
curl -X POST http://localhost:3002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepass123"}'
```

**Email OTP:**
```bash
# Step 1: send OTP (check Mailpit at http://localhost:8025 for the code)
curl -X POST http://localhost:3002/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","purpose":"login"}'

# Step 2: verify OTP
curl -X POST http://localhost:3002/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","code":"123456","purpose":"login"}'
```

**Get profile:**
```bash
curl http://localhost:3002/auth/me -H "Authorization: Bearer <access_token>"
```

#### Token Security

- **Access tokens**: JWT RS256, short-lived. Verified by services via JWKS — no network round-trip to auth-service.
- **Refresh tokens**: opaque, hashed at rest, HttpOnly cookies, rotated on use; replaying a spent token revokes the whole token family.

### Service-to-Service Auth

`@repo/auth-middleware` is a framework-agnostic JWT verifier. Services resolve the signing key from the auth-service JWKS and validate issuer `auth-service` / audience `pizza-shop`:

```typescript
import { buildJwksUrl, verifyAccessToken } from "@repo/auth-middleware";

const jwksUrl = buildJwksUrl(process.env.AUTH_SERVICE_INTERNAL_URL!);

// Inside a route handler:
const user = await verifyAccessToken({
  jwksUrl,
  token: bearerToken,
});
// user.sub  → user id
// user.role → "user" | "admin"
```

Each service wraps this in its own thin framework middleware (`src/middleware/auth.ts`) — see `apps/product-service` for a Hono example, `apps/order-service` for Express, and `apps/auth-service` for Koa.

### Other Services

| Service | Framework | Port | Notes |
|---|---|---|---|
| Product Service | Hono.js | 3006 | Menu CRUD (`/products`); requires auth for writes |
| Order Service | Express.js | 3004 | Orders scoped to owner (`/orders`); requires auth |
| Payment Service | Hono.js | 3005 | Razorpay Standard Checkout: `/payments/create-order`, `/payments/verify`, `/payments/config` |
| Email Service | Express.js | 3003 | Transactional email stub |

The payment checkout is wired into the web client — pay online via **Turbo UPI** on the checkout page. The Razorpay signature is verified server-side (HMAC-SHA256); a mismatch returns `400`.

### Gateway (Hono — Port 3007)

A thin reverse proxy that gives every client a single stable API surface. It handles CORS once, forwards `Authorization` headers untouched (each service still verifies JWTs locally against the auth-service JWKS), and rewrites `/api/<noun>/...` to the matching upstream.

| Public path | Upstream |
|---|---|
| `/api/auth/*` | auth-service `/auth/*` |
| `/api/email/*` | email-service |
| `/api/orders/*` | order-service `/orders/*` |
| `/api/payments/*` | payment-service `/payments/*` |
| `/api/products/*` | product-service `/products/*` |
| `/api/delivery/*` | delivery-service `/delivery/*` |

Upstreams are configured via `<SERVICE>_SERVICE_URL` env vars — never ship internal URLs to clients again. `GET /health` reports the reachability of every upstream.

### Delivery Service (Hono — Port 3008)

Riders, zones, and delivery lifecycle. Owns its own database (`pizza_shop_delivery`) and migration journal (`drizzle_delivery`). Use `@repo/auth-middleware` credentials; agents hold the `delivery_agent` role.

**Status machine:**

```
pending → assigned → accepted → out_for_delivery → delivered
  └── any non-terminal state can become cancelled (admin)
```

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/delivery/zones` (or `/api/delivery/zones` via gateway) | public | Active zones + delivery fee |
| POST / PATCH | `/delivery/zones` / `/delivery/zones/:id` | admin | Zone management |
| GET | `/delivery/riders/me` | delivery_agent | My rider profile |
| POST | `/delivery/riders/me` | delivery_agent | Create/update my rider profile |
| PATCH | `/delivery/riders/me/status` | delivery_agent | Go online / offline |
| PATCH | `/delivery/riders/me/location` | delivery_agent | Heartbeat location update |
| GET | `/delivery/riders` | admin | List riders (filter `?online=` ) |
| GET | `/delivery/deliveries` | admin / delivery_agent | List (agent = own only, filter `?status=`) |
| GET | `/delivery/deliveries/:id` | admin / delivery_agent | Single (agent = own only) |
| POST | `/delivery/deliveries` | admin | Create delivery from an order |
| POST | `/delivery/deliveries/:id/assign` | admin | Assign a rider |
| POST | `/delivery/deliveries/:id/accept` | delivery_agent | Accept own assignment |
| POST | `/delivery/deliveries/:id/pickup` | delivery_agent | Mark picked up |
| POST | `/delivery/deliveries/:id/deliver` | delivery_agent | Mark delivered |
| POST | `/delivery/deliveries/:id/cancel` | admin | Cancel |

```bash
# Bootstrap the delivery service (new DB + migrations + zones)
pnpm --filter delivery-service db:create
pnpm --filter delivery-service db:migrate
pnpm --filter delivery-service db:seed
```

> See `ARCHITECTURE.md` for the full plan to scale this to delivery (tracking,
> notifications, native KMP apps, event bus).

---

## Code Quality

```bash
# Lint all packages
pnpm lint

# Type check all packages
pnpm check-types

# Format code
pnpm format
```

---

## Project Structure

```
Pizza-Shop/
├── apps/
│   ├── web-client/          # Next.js customer app (port 3000)
│   ├── admin-client/        # Next.js admin panel (port 3001)
│   ├── auth-service/        # Koa.js auth (port 3002)
│   ├── email-service/       # Express.js email (port 3003)
│   ├── order-service/       # Express.js orders (port 3004)
│   ├── payment-service/     # Hono.js payments (port 3005)
│   ├── product-service/     # Hono.js products (port 3006)
│   ├── gateway/             # Hono.js API gateway (port 3007)
│   └── delivery-service/    # Hono.js riders/zones/deliveries (port 3008)
├── packages/
│   ├── auth-middleware/      # Framework-agnostic JWT verification
│   ├── eslint-config/       # Shared ESLint configs
│   └── typescript-config/   # Shared tsconfig presets
├── docker-compose.yml       # PostgreSQL + pgAdmin + Mailpit
├── turbo.json               # Turborepo task config
├── pnpm-workspace.yaml      # Workspace definition
├── ARCHITECTURE.md          # Scale-up plan (delivery, KMP apps, event bus)
└── package.json             # Root scripts
```

---

## Adding a New Service

1. Create a directory under `apps/`
2. Add `package.json` (`dev`, `build`, `start` scripts; extend `@repo/typescript-config`)
3. Add `tsconfig.json` extending `@repo/typescript-config/base.json`
4. Create a `.env.template` with its port and `CORS_ORIGINS`
5. Add the port to `docker-compose.yml` if needed
6. Add helper scripts to the root `package.json` (`dev:<app>`)

If the service uses a database, give it its own Drizzle migration schema and wire `db:generate` / `db:migrate` into `package.json` — run them scoped to the package, as documented above.

---

## Troubleshooting

### PostgreSQL won't start
```bash
lsof -i :5432            # is the port busy?
pnpm db:logs             # container logs
docker compose down -v && pnpm db:up   # hard reset
```

### Service can't connect to database
```bash
# Confirm DATABASE_URL is the same in the failing service's .env
psql "<DATABASE_URL>"

# Re-run that service's migrations
pnpm --filter <service> db:migrate
```

### CORS errors from the browser
- Restart the backend service after editing `.env` — `tsx watch` picks up source changes but does **not** re-read `.env`.
- Confirm the requesting origin is in that service's `CORS_ORIGINS`.
- The payment service requires `credentials: true` (already set) for authenticated calls.

### Port already in use
```bash
kill $(lsof -t -i:3002)   # replace with the offending port
```

---

## License

MIT
