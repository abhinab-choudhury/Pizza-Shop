# Pizza Shop — Microservices Platform

A full-stack pizza ordering platform built with a microservices architecture. Includes web clients, backend services, and a Kotlin Multiplatform mobile app.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Clients                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Web Client  │  │ Admin Client │  │ Android App  │  │
│  │  (Next.js)   │  │  (Next.js)   │  │    (KMP)     │  │
│  │  :3000       │  │  :3001       │  │              │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────┐
│                   API Gateway / Load Balancer            │
└─────────┬──────────┬──────────┬──────────┬──────────────┘
          │          │          │          │
┌─────────▼──┐ ┌─────▼────┐ ┌──▼───────┐ ┌▼───────────┐
│   Auth     │ │  Order   │ │ Payment  │ │  Product   │
│  Service   │ │  Service │ │ Service  │ │  Service   │
│  (Koa)     │ │ (Express)│ │ (Hono)   │ │  (Hono)    │
│  :3002     │ │  :3004   │ │  :3005   │ │  :3006     │
└─────┬──────┘ └────┬─────┘ └────┬─────┘ └────┬───────┘
      │              │            │             │
┌─────▼──────────────▼────────────▼─────────────▼─────────┐
│                    PostgreSQL                           │
│                    :5432                                 │
└─────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|---|---|
| **Monorepo** | pnpm workspaces + Turborepo |
| **Frontend** | Next.js 15, React 19, Tailwind CSS 4, shadcn/ui |
| **Auth Service** | Koa.js 3, Drizzle ORM, PostgreSQL, JWT (RS256) |
| **Order Service** | Express.js 5 |
| **Payment Service** | Hono.js 4 |
| **Product Service** | Hono.js 4 |
| **Email Service** | Express.js 5 |
| **Mobile App** | Kotlin Multiplatform, Compose Multiplatform |
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
| PostgreSQL | 5432 |
| pgAdmin (dev) | 5050 |
| Mailpit SMTP (dev) | 1025 |
| Mailpit UI (dev) | 8025 |

---

## Quick Start

The fastest way to get everything running:

```bash
# 1. Clone and install
git clone <repo-url>
cd Pizza-Shop
pnpm install

# 2. Set up database + run migrations (requires Docker)
pnpm setup

# 3. Start all services
pnpm dev
```

This starts PostgreSQL, runs migrations, and boots all backend + frontend services.

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| **Node.js** | >= 18 | Runtime for all services |
| **pnpm** | >= 10 | Package manager |
| **Docker** | >= 24 | PostgreSQL database |
| **Docker Compose** | >= 2.20 | Container orchestration |
| **Android Studio** | Latest | Android app development |
| **JDK** | >= 17 | KMP builds |

---

## Installation

```bash
# Install all dependencies (including auth-service new deps)
pnpm install
```

---

## Database Setup

### Start PostgreSQL

```bash
# Start PostgreSQL only
pnpm db:up

# Start PostgreSQL + pgAdmin + Mailpit (development tools)
docker compose --profile dev up -d

# View logs
pnpm db:logs

# Stop database
pnpm db:down

# Restart database
pnpm db:restart
```

### Run Migrations

```bash
# Generate migration files from schema
pnpm db:generate

# Apply migrations to database
pnpm db:migrate

# Or push schema directly (dev only, skips migration files)
pnpm db:push

# Open Drizzle Studio (web-based DB browser)
pnpm db:studio
```

The initial schema migration (`drizzle/0000_*.sql`) is committed, so a fresh setup only needs `pnpm db:migrate`. Open the URL Drizzle Studio prints (default: `https://local.drizzle.studio`) to browse the `users`, `otp_codes`, `accounts`, `refresh_tokens`, `sessions`, and `service_accounts` tables.

### Database Credentials

| Field | Value |
|---|---|
| Host | `localhost` |
| Port | `5432` |
| User | `postgres` |
| Password | `postgres` |
| Database | `pizza_shop_auth` |

pgAdmin (if using dev profile):
- URL: `http://localhost:5050`
- Email: `admin@pizzashop.com`
- Password: `admin`

### Email OTP via Mailpit (dev)

[Mailpit](https://github.com/axllent/mailpit) is a mail trap for development — it accepts any email sent to its SMTP server and shows it in a local web UI. No credentials required.

```bash
# Start Mailpit with the other dev tools
docker compose --profile dev up -d

# Open the email inbox
open http://localhost:8025
```

OTP emails sent by the auth service land in Mailpit's UI instead of a real inbox. When you request an OTP from the login page, open Mailpit to grab the 6-digit code.

> SMTP env defaults (`apps/auth-service/.env`): `localhost:1025`, no user/pass.
> To send real email instead, set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` etc. — and leave `SMTP_HOST` empty to fall back to logging codes to the console.

---

## Environment Variables

Each service has a `.env.template` file. Copy it to create your `.env`:

```bash
# Auth Service (required)
cp apps/auth-service/.env.template apps/auth-service/.env
```

### Auth Service Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 3002) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Yes | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Yes | Secret for refresh tokens |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | No | OAuth callback URL |
| `SMTP_HOST` | No | SMTP server host (Local Mailpit: `localhost`) |
| `SMTP_PORT` | No | SMTP port (Mailpit default: 1025) |
| `SMTP_SECURE` | No | Use TLS (`true`/`false`) |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password |
| `SMTP_FROM` | No | Sender address (default: noreply@pizzashop.com) |

> **Note:** By default SMTP points at the local Mailpit container — OTP emails appear at `http://localhost:8025`.

---

## Starting Services

### All Services (Recommended)

```bash
# Start all backend services + frontend clients
pnpm dev
```

This uses Turborepo to start all services in parallel. Each service runs on its own port.

### Individual Services

```bash
# Backend services
pnpm dev:auth        # Auth Service → http://localhost:3002
pnpm dev:order       # Order Service → http://localhost:3004
pnpm dev:payment     # Payment Service → http://localhost:3005
pnpm dev:product     # Product Service → http://localhost:3006
pnpm dev:email       # Email Service → http://localhost:3003

# Frontend clients
pnpm dev:web         # Web Client → http://localhost:3000
pnpm dev:admin       # Admin Client → http://localhost:3001

# Mobile app (requires Android Studio)
pnpm dev:android
```

### Useful Combinations

```bash
# Auth service + web client only
pnpm dev:auth & pnpm dev:web

# All backend services (no frontend)
turbo run dev --filter='*-service'

# Just the web client
pnpm dev:web
```

---

## Service Details

### Auth Service (Koa.js — Port 3002)

The central authentication service. Handles user registration, login, JWT token management, Google OAuth, and email OTP.

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
| GET | `/.well-known/jwks.json` | No | Public keys for services |
| POST | `/auth/service/token` | Client creds | Issue service token |

#### Authentication Flow

**Email/Password Registration:**
```bash
curl -X POST http://localhost:3002/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"John","password":"securepass123"}'
```

**Email/Password Login:**
```bash
curl -X POST http://localhost:3002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepass123"}'
```

**Email OTP:**
```bash
# Step 1: Send OTP (check Mailpit at http://localhost:8025 for the code)
curl -X POST http://localhost:3002/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","purpose":"login"}'

# Step 2: Verify OTP
curl -X POST http://localhost:3002/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","code":"123456","purpose":"login"}'
```

**Refresh Token:**
```bash
curl -X POST http://localhost:3002/auth/refresh \
  -H "Cookie: refresh_token=<token>"
```

**Get Profile:**
```bash
curl http://localhost:3002/auth/me \
  -H "Authorization: Bearer <access_token>"
```

#### Token Security

- **Access tokens**: JWT RS256, 15-minute expiry
- **Refresh tokens**: Opaque, argon2-hashed at rest, HttpOnly cookies, rotated on every use
- **Reuse detection**: If a used refresh token is replayed, the entire token family is revoked

### Service-to-Service Auth

Other services verify JWTs locally using JWKS — no network call to auth-service needed:

```typescript
import { createAuthMiddleware } from "@repo/auth-middleware";

const auth = createAuthMiddleware({
  jwksUrl: "http://localhost:3002/.well-known/jwks.json",
});

router.get("/orders", auth, async (ctx) => {
  const userId = ctx.state.userId;
  // ...
});
```

### Other Services

| Service | Framework | Port | Status |
|---|---|---|---|
| Order Service | Express.js | 3004 | Scaffolded |
| Payment Service | Hono.js | 3005 | Scaffolded |
| Product Service | Hono.js | 3006 | Scaffolded |
| Email Service | Express.js | 3003 | Scaffolded |

---

## Mobile App (KMP)

### Prerequisites

- Android Studio (latest stable)
- JDK 17+
- Android SDK 35

### Setup

```bash
# Build the Android app
pnpm dev:android

# Or build APK directly
cd apps/android-client
./gradlew :androidApp:assembleDebug
```

### Architecture

```
android-client/
├── shared/                 # KMP shared module
│   ├── domain/
│   │   ├── model/          # Data classes (Pizza, User, Order, CartItem)
│   │   ├── repository/     # Repository interfaces
│   │   └── usecase/        # Business logic use cases
│   ├── data/
│   │   ├── remote/         # Ktor API clients (Auth, Product, Order)
│   │   ├── local/          # SQLDelight (cart persistence)
│   │   └── repository/     # Repository implementations
│   └── ui/
│       ├── theme/          # Material3 pizza-themed colors
│       ├── navigation/     # Navigation graph
│       ├── screens/        # Screen composables + ViewModels
│       │   ├── login/      # Email/password + Google + Email OTP
│       │   ├── menu/       # Pizza grid with search + categories
│       │   ├── cart/       # Cart with quantity controls
│       │   ├── checkout/   # Address + payment method
│       │   └── orders/     # Order history with status
│       └── components/     # Reusable composables
├── androidApp/             # Android entry point (thin shell)
└── gradle/                 # Version catalog + wrapper
```

### Tech Stack

| Library | Version | Purpose |
|---|---|---|
| Kotlin | 2.1 | Language |
| Compose Multiplatform | 1.8 | Shared UI |
| Ktor | 3.1 | HTTP client |
| SQLDelight | 2.0 | Local database |
| Koin | 4.0 | Dependency injection |

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
│   └── android-client/      # KMP Android app
├── packages/
│   ├── auth-middleware/      # Shared JWT verification
│   ├── eslint-config/       # Shared ESLint configs
│   └── typescript-config/   # Shared tsconfig presets
├── docker-compose.yml       # PostgreSQL + pgAdmin
├── turbo.json               # Turborepo task config
├── pnpm-workspace.yaml      # Workspace definition
└── package.json             # Root scripts
```

---

## Adding a New Service

1. Create directory under `apps/`
2. Add `package.json`:
   ```json
   {
     "name": "my-service",
     "scripts": {
       "dev": "tsx watch src/app.ts",
       "build": "tsc",
       "start": "node dist/app.js"
     },
     "devDependencies": {
       "@repo/eslint-config": "workspace:*",
       "@repo/typescript-config": "workspace:*"
     }
   }
   ```
3. Add `tsconfig.json` extending `@repo/typescript-config/base.json`
4. Create `.env.template` with port assignment
5. Add the port to `docker-compose.yml` if needed
6. Add script to root `package.json`: `"dev:my-service": "pnpm --filter my-service dev"`

---

## Troubleshooting

### PostgreSQL won't start
```bash
# Check if port 5432 is in use
lsof -i :5432

# Check Docker logs
pnpm db:logs

# Reset database
docker compose down -v && pnpm db:up
```

### Auth service won't connect to database
```bash
# Verify database is running
docker compose ps

# Test connection
psql postgres://postgres:postgres@localhost:5432/pizza_shop_auth

# Re-run migrations
pnpm db:generate && pnpm db:migrate
```

### Port already in use
```bash
# Kill process on a specific port (e.g., 3002)
kill $(lsof -t -i:3002)

# Or use a different port in the service's .env
```

### Android build fails
```bash
# Clean and rebuild
cd apps/android-client
./gradlew clean
./gradlew :androidApp:assembleDebug
```

---

## License

MIT
