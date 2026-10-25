# Pizza Shop — Learning Roadmap (measurable)

You are building this to **learn microservice architecture**, so every milestone has:
- **Build** — what to make
- **Learn** — the concept you must be able to explain afterwards
- **Done when** — measurable checks. If you can't tick every box, the milestone is not finished.

Pace guide: ~10 hours/week → ~17 weeks (v3 adds a Delivery service and two more client apps). Slower is fine; **skipping the "Done when" checks is not.**

> **What changed in v3:** three KMP apps instead of one (Customer, Kitchen/Admin, Rider), a new **Delivery service**,
> role-based gateway routes, and M9 split into **M9a / M9b / M9c**. See `ARCHITECTURE.md` §10 and §6.1.

---

## Ground rules (read once, follow always)

1. **Contract first.** Write the OpenAPI / event JSON Schema in `contracts/` *before* the code. Code follows the contract, never the reverse.
2. **One milestone = one git tag** (`m0`, `m1`, …). You can always go back to a working state.
3. **Write an ADR** (half a page in `docs/adr/`) for every real decision: context → decision → alternatives → consequences.
4. **Break it on purpose.** After each milestone, kill something (a container, the broker, the DB) and watch what happens. Failure is where the learning is.
5. **No new service until the previous one has tests, a Dockerfile, `/healthz` and `/readyz`.**
6. **Write what you learned** (5–10 lines in `docs/learning-log.md`) at the end of each milestone. This becomes your interview material.
7. **Scope guard:** if a milestone runs over 2× its estimate, cut scope (see "Cut list" at the bottom), don't extend the project.

---

## M0 — Foundations and contracts (≈ 4–6 days)

**Build**
- Monorepo skeleton from `ARCHITECTURE.md` §11 (pnpm + Turborepo for TS, uv workspace for Python).
- `infra/docker-compose.yml` with RabbitMQ + Postgres + Mongo (healthchecks included).
- Draft `contracts/openapi/catalog.yaml` and `order.yaml` (just 3–4 endpoints each).
- Write ADR-0001 (monorepo) and ADR-0002 (RabbitMQ over Kafka).
- Install tools: Docker, Node 20+, pnpm, Python 3.12+, `uv`, Bruno or Postman, JDK 17+, Android Studio.

**Learn:** what a bounded context is; why contracts come first; REST resource design.

**Done when**
- [ ] `docker compose up -d` → all 3 infra containers `healthy` within 60 s.
- [ ] RabbitMQ UI (`localhost:15672`) opens; you can connect to Postgres and Mongo from a client.
- [ ] OpenAPI files lint clean (`npx @redocly/cli lint contracts/openapi/*.yaml` → 0 errors).
- [ ] 2 ADRs committed; tag `m0`.

---

## M1 — Catalog service (FastAPI + MongoDB) (≈ 1 week)

**Build**
- Documents: `pizza { name, description, images[], sizes[{id,label,price}], crusts[], toppings[{id,name,price,vegetarian}], available }`.
- Endpoints: `GET /menu`, `GET /menu/{id}`, `POST/PUT/DELETE` (admin, unauthenticated for now), `GET /internal/menu/snapshot`.
- Pydantic models, layered code (`api → domain → infra`), Mongo indexes, seed script with ≥ 12 pizzas.
- Every price change increments a `catalog_version` counter (you'll need it in M5).

**Learn:** document modelling (embed vs reference), indexes, config via env, layered architecture.

**Done when**
- [ ] ≥ 15 automated tests (unit + API tests against a real Mongo container) pass.
- [ ] `GET /menu` p95 < 50 ms locally with 100 pizzas (check with `hey` or `k6`, 50 concurrent users, 30 s).
- [ ] Image runs via `docker compose up catalog`; image size < 250 MB.
- [ ] `/healthz` + `/readyz` (readyz fails when Mongo is stopped — prove it).
- [ ] Tag `m1`.

---

## M2 — Order service v1 with *synchronous* coupling (≈ 1–1.5 weeks)

> Deliberately build the "wrong" version first so you feel the pain M4–M5 fix.

**Build**
- NestJS service + Neon/Docker Postgres. Tables: `orders`, `order_lines` (with **price snapshot**), migrations.
- `POST /orders` calls Catalog over HTTP to validate items and prices, then stores the order as `PENDING`.
- `GET /orders/{id}`, `GET /orders?userId=`.
- Timeouts (2 s) on the HTTP call to Catalog.

**Learn:** NestJS modules/DI, DB migrations, DTO validation, why sync calls couple availability.

**Done when**
- [ ] ≥ 15 tests pass, including: unknown item → 422; price mismatch → 409; Catalog down → clear 503 (not a hang).
- [ ] You can **demonstrate and screenshot** the failure: stop Catalog → `POST /orders` fails. Write this in your learning log ("this is the problem events will solve").
- [ ] Order totals are computed in integer paise; a test proves `0.1 + 0.2` style bugs cannot happen.
- [ ] Tag `m2`.

---

## M3 — Gateway + Identity + roles (≈ 1–1.5 weeks)

**Build**
- **Identity** (FastAPI + Postgres): register (customers only), login, refresh (rotating), `/me`. Passwords hashed with argon2/bcrypt. Roles `customer`, `kitchen`, `delivery`, `admin` in the JWT; **staff accounts are created by an admin** (seed one admin via a script).
- **Gateway** (Hono): role-prefixed routes (`/api/v1/auth`, `/customer`, `/kitchen`, `/delivery`, `/admin`; see `ARCHITECTURE.md` §8); JWT verification and a per-prefix role guard; `X-Request-Id`; per-IP rate limiting; CORS for the KMP web target.
- Split the contracts by audience now: `contracts/openapi/customer.yaml`, `kitchen.yaml`, `delivery.yaml`, `admin.yaml` (the kitchen/delivery files can start almost empty).
- Orders are now tied to the authenticated user (`X-User-Id` header from gateway, never from the body).

**Learn:** JWT access/refresh flow, gateway responsibilities, trust boundaries.

**Done when**
- [ ] No token → 401; expired token → 401. A **role × prefix matrix test** (4 roles × 4 prefixes = 16 cases) passes, e.g. customer token on `/kitchen` → 403, rider token on `/admin` → 403.
- [ ] Object-level check: customer A cannot read customer B's order (404 or 403).
- [ ] Rate limit: 101st request/min from the same IP → 429.
- [ ] Gateway overhead < 15 ms p95 (compare direct-to-service vs through gateway with k6).
- [ ] Services are **not** reachable from the host except through the gateway (remove their `ports:` in Compose; prove with curl).
- [ ] Tag `m3`.

---

## M4 — Event-driven backbone + Notification (≈ 1–1.5 weeks)

**Build**
- Shared AMQP wrappers (`packages/amqp`, `libs/pizza_amqp`): connect, declare topology from `rabbitmq/definitions.json`, publish envelope, consume with manual ack.
- Order publishes `order.created.v1` (for now, simply after DB commit — the flaw gets fixed in M7).
- **Notification** (FastAPI + Mongo) consumes it and "sends" an email/SMS (console + stored in Mongo; later plug in a real provider like SES/Twilio/Resend test mode).
- Retry queues (5 s → 30 s → 5 min) + DLQ.

**Learn:** exchanges/queues/bindings, ack/nack, at-least-once delivery, dead-letter queues.

**Done when**
- [ ] Stop Notification, place 20 orders, start Notification → **20 notifications delivered** (queue buffered them).
- [ ] Force a handler exception → message lands in DLQ after 3 retries; you can replay it with `scripts/replay-dlq.sh`.
- [ ] Deliver the same message twice manually → only **1 notification** is stored (inbox/dedupe by `message.id`).
- [ ] Event JSON validated against `contracts/events/order.created.v1.json` in a test (producer **and** consumer side).
- [ ] Tag `m4`.

---

## M5 — Remove the sync call: `menu.updated` + local price cache (≈ 1 week)

**Build**
- Catalog emits `menu.updated.v1` (with `catalog_version`) on every change.
- Order maintains `menu_price_cache`; `POST /orders` validates **only against its own DB**.
- One-time bootstrap from `/internal/menu/snapshot` + a "rebuild cache" admin command.
- Stale-price handling: `409 MENU_OUT_OF_DATE`.

**Learn:** eventual consistency, data duplication trade-offs, event versioning, out-of-order events.

**Done when**
- [ ] **Stop Catalog completely → orders still succeed.** (The test you couldn't pass in M2.)
- [ ] Change a price in Catalog → Order cache reflects it in < 2 s (automated test polls, fails after 5 s).
- [ ] Deliver `menu.updated` events out of order (v7 before v6) → cache keeps v7.
- [ ] Wipe the cache table, run rebuild → state identical to Catalog (checksum comparison script).
- [ ] The HTTP client to Catalog is deleted from Order's code (grep proves it).
- [ ] Tag `m5`.

---

## M6 — Payment, Kitchen/Inventory and the Saga (≈ 2 weeks) ⭐ core of the project

**Build**
- **Kitchen/Inventory** (FastAPI + Postgres): ingredient stock, `stock.reserve` / `stock.release` commands, `kitchen.accept` with two modes (`auto`: reject if queue length > N; `manual`: a human decides through the kitchen API, with a decision timeout), status updates (`BAKING` → `READY`) via `kitchen.status.changed`, and `kitchen.ticket.updated` events for the future live queue.
- **Payment** (Hono + Postgres): `payment.charge` / `payment.refund`, **Razorpay test mode** (order + signature verification + webhook endpoint), idempotency key table.
- **Orchestrator** in Order service: state machine from `ARCHITECTURE.md` §6, `saga_instances` table, step timeouts, compensations.

**Learn:** saga orchestration vs choreography, compensating actions, concurrency (`FOR UPDATE`), webhooks, state machines.

**Done when** (all automated end-to-end tests, run against Compose):
- [ ] **Happy path:** order reaches `CONFIRMED` in < 5 s.
- [ ] **Out of stock:** ends `CANCELLED(out_of_stock)`, no payment created.
- [ ] **Payment failed:** ends `CANCELLED(payment_failed)`, stock released.
- [ ] **Kitchen rejects** (both auto-rejected for load **and** rejected through the manual kitchen API call): ends `CANCELLED(kitchen_busy)`, payment refunded **and** stock released.
- [ ] **Undecided ticket** (manual mode, nobody answers): the decision timeout rejects it and the same compensations run.
- [ ] **Timeout:** pause Payment for 30 s → saga compensates; no stuck `PENDING` orders after 60 s.
- [ ] **Concurrency:** 50 parallel orders for 10 remaining units of an ingredient → exactly 10 succeed, stock never negative.
- [ ] **Consistency query** returns 0 rows: `confirmed orders without a successful payment` and `successful payments for cancelled orders without a refund`.
- [ ] Sequence diagram in README matches real behaviour (verified from a trace/log); tag `m6`.

---

## M7 — Reliability hardening (outbox, inbox, idempotency) (≈ 1–1.5 weeks)

**Build**
- Transactional **outbox + relay** (`FOR UPDATE SKIP LOCKED`) in Order, Payment, Kitchen, Catalog.
- Inbox table / dedupe in **every** consumer.
- `Idempotency-Key` on `POST /orders` and payment calls.
- Circuit breaker + retry with jitter around Razorpay calls.

**Learn:** exactly-once *effects* on top of at-least-once delivery; failure windows between DB and broker.

**Done when**
- [ ] **Broker kill test:** run 200 orders over 60 s, `docker stop rabbitmq` at t=20 s, restart at t=40 s → at the end `orders == confirmed + cancelled` (200), **0 lost events, 0 duplicate side-effects**.
- [ ] **Crash test:** `kill -9` the Order container mid-saga → after restart every saga reaches a terminal state.
- [ ] **Duplicate test:** replay one `payment.succeeded` message 100× → one state change, one inbox row.
- [ ] Same `Idempotency-Key` posted 10× → one order, identical response body each time.
- [ ] Razorpay stubbed to fail 100% → breaker opens after 5 failures, calls fail fast (< 50 ms).
- [ ] Tag `m7`.

---

## M8 — Observability (≈ 1 week)

**Build**
- OpenTelemetry in every service; **trace context propagated through RabbitMQ headers**.
- OTel Collector → Jaeger (or Tempo); Prometheus + Grafana via `docker-compose.obs.yml`.
- Structured JSON logs with `correlationId`.
- Dashboards: service health (RED), order funnel, queue depth/DLQ.
- Alerts: DLQ > 0, saga stuck > 60 s.
- Runbooks for each alert in `docs/runbooks/`.

**Learn:** the three pillars, context propagation, SLIs/SLOs, debugging distributed flows.

**Done when**
- [ ] One order = **one trace** spanning ≥ 6 services (screenshot in README).
- [ ] Searching a `correlationId` in logs shows the whole journey in order.
- [ ] Grafana "order funnel" shows created → paid → confirmed counts that match the DB counts.
- [ ] Break something (stop Payment) → alert fires within 2 min and the runbook gets you to root cause in < 10 min (time yourself).
- [ ] Tag `m8`.

---

## M9a — Customer app (Android + Desktop first) (≈ 2 weeks)

**Build**
- Restructure the wizard output into `client/{core,features,apps}` (see `ARCHITECTURE.md` §10.2). The wizard project becomes `apps/customer`.
- Generate the customer Kotlin client from `contracts/openapi/customer.yaml`.
- Screens: Login/Register → Menu → Pizza detail (size/crust/toppings) → Cart → Checkout (Razorpay test) → **Live order tracking (SSE)** → Order history.
- Order has `fulfilmentType` (`DELIVERY` or `PICKUP`) chosen at checkout.
- Token storage (`expect/actual` secure storage), automatic refresh on 401, offline cart (SQLDelight).
- Gateway: SSE endpoint for the customer's own orders (fed by the gateway fan-out queue, `ARCHITECTURE.md` §4.4), with `Last-Event-ID` resume.

**Learn:** KMP project structure, `expect/actual`, Compose Multiplatform, Ktor, state management (MVI/MVVM), SSE on mobile, multi-module Gradle.

**Done when**
- [ ] Full journey (register → order → see `CONFIRMED → BAKING → READY` live) works on **Android and Desktop** with no manual API calls.
- [ ] ≥ 60 % of the app's code lives in `core/` + `features/` (line-count script in `scripts/`).
- [ ] Airplane-mode test: cart survives app restart; token refresh happens silently after expiry; SSE reconnects and shows the **current** status (not a stale one).
- [ ] Status appears in the app < 1 s after the backend event (measure with timestamps).
- [ ] Customer app binary has **zero** dependency on kitchen/delivery feature modules (CI grep returns nothing).
- [ ] iOS build runs the same journey (needs a Mac); Web target at least loads menu + login. Record a 60-second screen capture per platform.
- [ ] Tag `m9a`.

---

## M9b — Kitchen + Admin app (Desktop + Web) (≈ 1.5 weeks)

**Build**
- Clone the app shell: `apps/kitchen` (Desktop + Web first; Android tablet later). Generate the clients from `kitchen.yaml` and `admin.yaml`.
- Login for staff accounts (created by an admin; no self-registration).
- Screens: **live ticket queue** (SSE, newest first, age timers) → ticket detail with **Accept / Reject (reason)** → status buttons (**Baking → Ready**, handed over for pickup orders) → stock view and adjust → menu admin (create/edit pizzas and prices through admin routes; this emits `menu.updated`) → warnings (`delivery.unclaimed`).
- Kitchen mode switch `auto` / `manual` (admin only).

**Learn:** role-gated UI vs server-side enforcement, desktop packaging, live operational UIs, event-to-UI latency.

**Done when**
- [ ] A new paid order appears in the kitchen app < 1 s after `PAID`.
- [ ] Pressing **Reject** ends the order as `CANCELLED(kitchen_busy)` with a refund and released stock, **visible live in the customer app** (record this: it is your best demo).
- [ ] A customer token on any `/kitchen` or `/admin` route returns 403; a kitchen token on `/admin` returns 403 (kitchen can't edit prices).
- [ ] Price change in the admin screen shows up in the customer app menu within 2 s of refresh (the M5 event path, now end to end).
- [ ] Kitchen app has zero dependency on customer-only features (CI grep).
- [ ] Desktop installer builds (`packageDistributionForCurrentOS`) and runs on a machine without the repo.
- [ ] Tag `m9b`.

---

## M9c — Delivery service + Rider app (Android) (≈ 2 weeks)

**Build: Delivery service** (Hono + Postgres, own database)
- Tables: `delivery_tasks` (`OPEN`, `ASSIGNED`, `PICKED_UP`, `COMPLETED`), `rider_locations` (latest row per rider), plus outbox/inbox as in M7.
- Consumes `order.ready.v1` (for `DELIVERY` orders) → creates an `OPEN` task and emits `delivery.requested.v1`.
- Endpoints: list open tasks; **claim** (atomic `UPDATE … WHERE status='OPEN' RETURNING *`, `409` if lost); pick up; complete with the customer's 4-digit handover code (max 3 attempts); `PUT /delivery/location`.
- Emits `delivery.assigned`, `delivery.picked_up`, `delivery.completed`, and `delivery.unclaimed` after N minutes. Order consumes them to move to `OUT_FOR_DELIVERY` and `DELIVERED`.
- Location pings are **not** broker events; the customer's SSE stream includes the rider's latest position.

**Build: Rider app** (`apps/delivery`, Android)
- Generate the client from `delivery.yaml`.
- Screens: login → open tasks (live) → task detail → claim → run screen (address, call and open-in-maps via `expect/actual`) → mark picked up → enter handover code → done.
- Foreground location service while a delivery is active; stop on completion.

**Learn:** bounded contexts and when to split a service, atomic claims and optimistic concurrency, high-frequency data vs events, mobile background work and permissions.

**Done when**
- [ ] **Claim race:** 20 simulated riders claim 5 open tasks at once → exactly 5 `200`s, 15 `409`s, no task has two riders (automated test).
- [ ] Full chain on real clients: customer orders → kitchen accepts and marks Ready → rider sees the task < 1 s, claims, picks up, delivers with the code → order ends `DELIVERED`.
- [ ] Customer app shows `OUT_FOR_DELIVERY` and the rider position updating at least every 5 s.
- [ ] Wrong handover code ×3 → completion locked; correct code afterwards still needs an admin override (test it).
- [ ] No rider claims within N minutes → `delivery.unclaimed` raises a warning in the kitchen app.
- [ ] `kill -9` the Delivery container with a task `ASSIGNED` → after restart state is intact and no event is lost (outbox).
- [ ] Consistency query returns 0 rows: `DELIVERED` orders without a `COMPLETED` task, and `COMPLETED` tasks whose order is not `DELIVERED`.
- [ ] Tag `m9c`.

---

## M10 — Performance and chaos testing (≈ 1 week)

**Build**
- k6 scripts: browse-heavy mix (80 % menu / 20 % orders) and order-spike scenario.
- Chaos scripts: kill each service, kill broker, add 500 ms network latency (Toxiproxy or `tc`), exhaust DB connections.
- Find and fix at least **3 real bottlenecks** (indexes, connection pool size, consumer prefetch, N+1 queries…).

**Learn:** capacity planning, backpressure, prefetch tuning, connection pools (and Neon's pooled endpoint).

**Done when** (write real numbers in `docs/performance.md`, with before/after):
- [ ] 100 order-creations/sec for 5 min: p95 `POST /orders` < 500 ms, error rate < 1 %.
- [ ] Queue depths return to ~0 within 30 s of load ending (no growing backlog).
- [ ] Each chaos scenario has a documented expected result and **passes**; every failure you found is documented with its fix.
- [ ] Include Delivery in the chaos set: kill it during peak claims → no duplicate assignment and no lost completion after restart.
- [ ] Tag `m10`.

---

## M11 — CI/CD and staging deployment (≈ 1 week)

**Build**
- GitHub Actions: lint → unit tests → build images (only changed services; use path filters/Turborepo) → integration tests with Compose → push to GHCR.
- A separate **client workflow**: Gradle build for each app (customer, kitchen, delivery) with build caching; the Android APK/AAB and the desktop installer are uploaded as artifacts; the architecture-boundary grep checks (§10.2) run here.
- Deploy staging (VPS or Fly/Railway/Render) with Caddy TLS, **Neon + Atlas + managed RabbitMQ (e.g. CloudAMQP free)**.
- Environment config via env/secrets, DB migrations run automatically on deploy.

**Learn:** pipelines for polyglot monorepos, immutable images, migrations in deploys, config vs secrets.

**Done when**
- [ ] Push to `main` → live on staging in < 15 min with no manual steps.
- [ ] A change in one service rebuilds **only** that service's image.
- [ ] Public HTTPS URL works; all three apps (pointed at staging) complete one order end to end: customer → kitchen → rider.
- [ ] Rollback to the previous image tag takes < 5 min (practice it once).
- [ ] Tag `m11`.

---

## M12 — Polish, proof, publish (≈ 1 week)

**Build**
- README: 1-screen pitch, architecture diagram, 3-command quickstart, demo GIFs, trace screenshot, performance table.
- ≥ 8 ADRs, runbooks, `CONTRIBUTING.md`, `LICENSE`, `docker compose up` works from a **fresh clone** on another machine.
- Write 2 blog posts: *"Building a saga with compensations"* and *"What broke when I killed RabbitMQ"*.
- Resume bullets with numbers (see below).

**Done when**
- [ ] A friend clones the repo and has it running in < 10 minutes using only the README.
- [ ] Demo video (≤ 3 min): customer orders → kitchen rejects one (refund appears live) and accepts another → rider delivers it → trace in Jaeger → kill a service → system recovers.
- [ ] Tag `v1.0.0`.

---

## What makes this a *noticeably good* project

| Signal | Proof you'll have |
|---|---|
| You understand failure | Chaos test results + broker-kill recovery numbers |
| You can design | ADRs, contracts, diagrams that match the code |
| You can operate | Dashboards, alerts, runbooks, CI/CD, staging URL |
| You ship to users | Three role-based KMP apps (customer, kitchen/admin, rider) against a live backend |
| You measure | k6 numbers with before/after |

**Resume bullet templates** (fill in your real numbers):
- Designed and built an 8-service event-driven pizza-ordering and delivery platform (FastAPI, NestJS, Hono, RabbitMQ, Neon Postgres, MongoDB Atlas) with an orchestrated saga and compensating refunds; zero lost/duplicated orders under broker-failure tests.
- Implemented transactional outbox/inbox and idempotency keys, sustaining **X orders/sec at p95 < Y ms** in k6 load tests.
- Built three Kotlin Multiplatform (Compose) apps (customer, kitchen/admin, rider) from shared modules with **Z %** shared code, role-based access, and live order, kitchen and delivery updates over SSE.
- Instrumented distributed tracing (OpenTelemetry) across HTTP and AMQP; cut mean time to diagnose injected failures to < 10 min.

---

## Cut list (if you fall behind, drop in this order)

1. Web (Wasm) targets → keep Android + Desktop (+ iOS for customer).
2. iOS for the customer app.
3. Rider app's map/navigation polish → keep claim, pick up, deliver with code.
4. Identity service → a simple signed-JWT stub in the gateway (but keep roles).
5. Real email/SMS provider → console + Mongo log only.
6. Tempo/Grafana alerts → keep Jaeger + Prometheus + a single dashboard.
7. Staging on a VPS → CI + Compose-based integration tests only.

**Never cut:** contracts, the saga (M6), outbox/inbox (M7), the kitchen app (M9b, since it makes the saga visible), failure tests, and the learning log.

---

## Stretch goals (only after `v1.0.0`)

- CQRS read model for the order-history screen (Mongo projection).
- PostGIS for distance/ETA and automatic rider assignment; WebSocket for rider location; push notifications (FCM/APNs) to customers and riders.
- Replace RabbitMQ with Kafka in a branch and write up the differences.
- Migrate Compose → k3s/Kubernetes with Helm; add autoscaling on queue depth (KEDA).
- Contract testing with Pact; schema registry for events.
- Multi-tenant "many pizzerias" mode (the thing that makes it truly real-world).

---

## Weekly rhythm (suggested)

| Day | Activity |
|---|---|
| Mon | Write/adjust contract + ADR for this week's piece |
| Tue–Thu | Build + tests |
| Fri | "Break it" session + fix |
| Sat | Update README/diagram, learning log, tag |
| Sun | Rest / read (next milestone's keywords) |

**Keywords to study before each milestone**
- M2: *database migrations, DTO validation, idempotent HTTP*
- M3: *JWT, refresh token rotation, API gateway pattern*
- M4: *AMQP exchanges, ack/nack, dead-letter exchange, at-least-once*
- M5: *eventual consistency, event-carried state transfer*
- M6: *saga pattern, compensating transaction, `SELECT FOR UPDATE`*
- M7: *transactional outbox, inbox pattern, circuit breaker*
- M8: *OpenTelemetry context propagation, RED method*
- M9a: *Kotlin Multiplatform expect/actual, Compose Multiplatform, Ktor SSE, multi-module Gradle*
- M9b: *role-based access control, desktop packaging (jpackage), SSE Last-Event-ID*
- M9c: *optimistic concurrency / atomic UPDATE, Android foreground services, bounded contexts*
- M10: *k6, Toxiproxy, backpressure, prefetch*
- M11: *GitHub Actions matrix/path filters, GHCR, zero-downtime deploy*
