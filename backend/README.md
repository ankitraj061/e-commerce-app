# Allo Engineering — Inventory Reservation Backend

A production-grade, concurrency-safe inventory reservation system for a multi-warehouse e-commerce platform.

---

## Table of Contents

1. [Stack](#stack)
2. [Folder Structure](#folder-structure)
3. [How to Run Locally](#how-to-run-locally)
4. [Environment Variables](#environment-variables)
5. [Database: Migrations & Seeding](#database-migrations--seeding)
6. [API Reference](#api-reference)
7. [How Concurrency is Solved](#how-concurrency-is-solved)
8. [How Expiry Works](#how-expiry-works)
9. [How Redis Idempotency Works (Bonus)](#how-redis-idempotency-works-bonus)
10. [Assignment Gap Analysis](#assignment-gap-analysis)
11. [Trade-offs & What I'd Do Differently](#trade-offs--what-id-do-differently)

---

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 + TypeScript (strict) |
| Framework | Express 5 |
| ORM | Prisma 7 |
| Database | PostgreSQL via Neon (hosted) |
| Cache / Idempotency | Redis via Upstash (REST) |
| Auth | JWT (access + refresh token rotation) |
| Validation | Zod 4 |
| Payment | Razorpay (test mode) |
| Password hashing | bcryptjs |

---

## Folder Structure

```
src/
├── config/
│   ├── env.ts           # Zod-validated typed env — crashes on startup if invalid
│   ├── db.ts            # pg.Pool (used by Prisma driver adapter)
│   └── redis.ts         # Upstash Redis client singleton
│
├── lib/
│   ├── prisma.ts        # Prisma 7 client (via @prisma/adapter-pg)
│   ├── jwt.ts           # sign / verify access + refresh tokens
│   ├── hash.ts          # bcryptjs password helpers
│   └── razorpay.ts      # Razorpay SDK singleton
│
├── middleware/
│   ├── auth.middleware.ts        # JWT Bearer verification → req.user
│   ├── validate.middleware.ts    # Zod schema validation for body/params/query
│   ├── idempotency.middleware.ts # Redis idempotency (Idempotency-Key header)
│   └── errorHandler.middleware.ts# Global error handler (Prisma + JWT + ApiError)
│
├── validations/         # Zod schemas (single source of truth)
│   ├── auth.validation.ts
│   ├── reservation.validation.ts
│   └── payment.validation.ts
│
├── repositories/        # Pure DB queries — no business logic
│   ├── user.repository.ts
│   ├── refreshToken.repository.ts
│   ├── inventory.repository.ts
│   ├── reservation.repository.ts
│   ├── payment.repository.ts
│   └── order.repository.ts
│
├── services/            # Business logic + Prisma transactions
│   ├── auth.service.ts            # Register, login, token rotation
│   ├── reservation.service.ts     # ← SELECT FOR UPDATE lives here
│   └── payment.service.ts         # Razorpay order + HMAC signature verify
│
├── controllers/         # HTTP layer only — thin wrappers around services
│   ├── auth.controller.ts
│   ├── product.controller.ts
│   ├── warehouse.controller.ts
│   ├── reservation.controller.ts
│   └── payment.controller.ts
│
├── routes/              # Express Routers
│   ├── auth.routes.ts
│   ├── product.routes.ts
│   ├── warehouse.routes.ts
│   ├── reservation.routes.ts
│   ├── payment.routes.ts
│   └── index.ts         # Central registry — one import in src/index.ts
│
├── jobs/
│   └── releaseExpiredReservations.ts  # Background expiry worker
│
├── types/
│   └── express.d.ts     # Augments req.user, req.idempotencyKey
│
└── utils/
    ├── apiError.ts       # Custom error with statusCode
    ├── apiResponse.ts    # sendSuccess / sendError helpers
    ├── asyncWrapper.ts   # Promise.catch → next(err)
    └── getParam.ts       # Express 5 param-type safety
```

---

## How to Run Locally

### Prerequisites

- Node.js ≥ 20
- A [Neon](https://neon.tech) (or any hosted Postgres) database URL
- An [Upstash Redis](https://upstash.com) REST URL + token
- A [Razorpay](https://razorpay.com) test-mode key pair

### 1. Clone and install

```bash
git clone <repo-url>
cd backend
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
# then fill in the values (see section below)
```

### 3. Run database migrations

```bash
npx prisma migrate dev --name init
```

### 4. Seed the database

```bash
npx tsx prisma/seed.ts
```

This creates:
- 3 warehouses (Mumbai, Delhi, Bangalore)
- 6 products with inventory across warehouses
- A demo user: `demo@allo.dev` / `Demo@1234`
- Intentionally scarce stock on Sony WH-1000XM5 @ Mumbai (1 unit) — perfect for the 409 race-condition demo

### 5. Start the server

```bash
npm run dev          # tsx watch — hot reload
# or
npm run build && npm start   # production build
```

Server starts at `http://localhost:8000`

Health check: `GET http://localhost:8000/health`

---

## Environment Variables

```bash
# ─── Server ────────────────────────────────────────────────────────────────
PORT=8000
NODE_ENV=development

# ─── Database (Neon PostgreSQL) ─────────────────────────────────────────────
DATABASE_URL=postgresql://user:password@host/db?sslmode=require

# ─── Upstash Redis ───────────────────────────────────────────────────────────
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# ─── JWT ─────────────────────────────────────────────────────────────────────
# Generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
ACCESS_TOKEN_SECRET=<64-char hex>
REFRESH_TOKEN_SECRET=<64-char hex>
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY_DAYS=7

# ─── Razorpay (test mode — dashboard.razorpay.com → Settings → API Keys) ────
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

---

## Database: Migrations & Seeding

### Schema overview

```
Warehouse (1) ──< Inventory >── (1) Product
                      │
               totalStock     ← physical units in the warehouse
               reservedStock  ← units currently held by PENDING reservations

available = totalStock − reservedStock
```

**Key invariants:**

| Event | totalStock | reservedStock | available |
|---|---|---|---|
| Reserve | unchanged | +qty | −qty |
| Confirm (payment ok) | −qty | −qty | unchanged (stock gone) |
| Release / Expire | unchanged | −qty | +qty |

### Running migrations

```bash
# Create and apply migrations
npx prisma migrate dev --name <description>

# Apply in production (no prompt)
npx prisma migrate deploy
```

### Seeding

```bash
npx tsx prisma/seed.ts
```

---

## API Reference

All endpoints are prefixed with `/api`. Protected routes require:
```
Authorization: Bearer <access_token>
```

---

### Auth

#### `POST /api/auth/register`

```json
// body
{ "name": "Jane Doe", "email": "jane@example.com", "password": "Jane@1234" }

// response 201
{ "success": true, "data": { "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com" } } }
```

#### `POST /api/auth/login`

```json
// body
{ "email": "demo@allo.dev", "password": "Demo@1234" }

// response 200 — also sets HttpOnly cookie: refreshToken
{
  "success": true,
  "data": {
    "accessToken": "<jwt>",
    "user": { "id": "...", "name": "Allo Demo User", "selectedWarehouseId": "..." }
  }
}
```

#### `POST /api/auth/refresh-token`

No body. Reads `refreshToken` HttpOnly cookie. Returns new `accessToken` and rotates the refresh token cookie.

#### `POST /api/auth/logout`

Clears the refresh token from DB and the cookie.

#### `GET /api/auth/me` *(protected)*

Returns `req.user` — the authenticated user's id and email.

---

### Products

#### `GET /api/products`

Returns all products with per-warehouse inventory and **available stock**.

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "clxxx...",
        "name": "Sony WH-1000XM5",
        "price": "26990",
        "inventories": [
          {
            "warehouseId": "clyyy...",
            "totalStock": 1,
            "reservedStock": 0,
            "available": 1,          // ← computed: totalStock − reservedStock
            "warehouse": { "name": "Mumbai Hub", "city": "Mumbai" }
          }
        ]
      }
    ]
  }
}
```

#### `GET /api/products/:id`

Single product with full inventory breakdown.

---

### Warehouses

#### `GET /api/warehouses`

List all warehouses.

#### `GET /api/warehouses/:id`

Single warehouse with its full product inventory.

---

### Reservations *(all protected)*

#### `POST /api/reservations`

Creates a **concurrency-safe** reservation. The warehouse is read from the authenticated user's `selectedWarehouseId` profile field.

```json
// Request headers
Idempotency-Key: <uuid>   // optional, enables idempotency (see bonus section)
Authorization: Bearer <token>

// Body
{
  "productId": "clxxx...",
  "quantity": 1,
  "addressId": "clyyy..."     // delivery address (must belong to the user)
}

// 201 Created
{
  "success": true,
  "data": {
    "reservation": {
      "id": "clzzz...",
      "status": "PENDING",
      "quantity": 1,
      "expiresAt": "2025-05-26T10:10:00.000Z",
      "product": { "name": "Sony WH-1000XM5", "price": "26990" },
      "warehouse": { "name": "Mumbai Hub" }
    }
  }
}

// 409 Conflict — insufficient stock
{ "success": false, "error": "Insufficient stock. Requested: 2, Available: 1." }

// 400 Bad Request — no warehouse selected
{ "success": false, "error": "No warehouse selected. Please select a warehouse before reserving." }
```

#### `GET /api/reservations`

List the authenticated user's reservations (most recent first).

#### `GET /api/reservations/:id`

Single reservation with full details (product, warehouse, payment, order).

#### `POST /api/reservations/:id/confirm`

Confirm a reservation after payment verification. Verifies the Razorpay HMAC signature, then atomically:
- Settles stock (`totalStock -= qty`, `reservedStock -= qty`)
- Marks reservation as `CONFIRMED`
- Creates `Order` + `OrderItem`

```json
// Request headers
Idempotency-Key: <uuid>   // strongly recommended to prevent double-confirm

// Body
{
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_yyy",
  "razorpaySignature": "hmac_signature"
}

// 201 Created
{ "success": true, "data": { "order": { ... } } }

// 410 Gone — reservation expired
{ "success": false, "error": "Reservation has expired. Please create a new reservation." }

// 400 Bad Request — signature invalid
{ "success": false, "error": "Payment signature verification failed." }
```

#### `POST /api/reservations/:id/release`

Manually release a reservation (user cancelled / payment failed). Atomically returns stock to the available pool.

```json
// 200 OK
{ "success": true, "data": null, "message": "Reservation released. Stock returned to pool." }

// 409 Conflict — already processed
{ "success": false, "error": "Reservation is no longer pending and cannot be released." }
```

---

### Payments

#### `POST /api/payments/create-order` *(protected)*

Creates a Razorpay order for a pending reservation. Returns the `razorpayOrderId` that the frontend uses to open the Razorpay checkout.

```json
// Body
{ "reservationId": "clxxx..." }

// 201 Created
{
  "success": true,
  "data": {
    "payment": {
      "razorpayOrderId": "order_xxx",
      "amount": 2699000,       // paise
      "currency": "INR",
      "razorpayKeyId": "rzp_test_xxx"
    }
  }
}
```

---

## How Concurrency is Solved

### The race condition

Two users hit `POST /api/reservations` simultaneously for the last unit:

```
Thread A: reads available = 1  → passes check
Thread B: reads available = 1  → passes check
Thread A: reservedStock += 1   → available = 0
Thread B: reservedStock += 1   → available = -1  ← OVERSELL!
```

### The fix: PostgreSQL row-level locking (`SELECT … FOR UPDATE`)

Inside a Prisma interactive transaction, before reading the available stock, we acquire an **exclusive row lock** on the Inventory row:

```sql
SELECT id, "totalStock", "reservedStock"
FROM "Inventory"
WHERE "productId" = $1 AND "warehouseId" = $2
FOR UPDATE
```

**What happens with `FOR UPDATE`:**

```
Thread A                                Thread B
────────────────────────────────────────────────────────────────────────
BEGIN TRANSACTION
SELECT … FOR UPDATE  ← lock acquired
                                        BEGIN TRANSACTION
                                        SELECT … FOR UPDATE  ← BLOCKS here
Re-reads inside lock: available = 1
available >= qty  → check passes
UPDATE reservedStock += 1
INSERT INTO Reservation
COMMIT   ← lock released
                                        Re-reads with lock: available = 0
                                        available < qty  → throws 409
                                        ROLLBACK
```

**Why this is correct:**

1. The lock is held for the entire transaction, not just the SELECT.
2. Thread B sees `reservedStock` **after Thread A's commit** — the post-increment value.
3. Only one of the two requests can ever observe `available >= 1` for the same last unit.
4. The `UPDATE reservedStock = reservedStock + qty` (Prisma `increment`) is an atomic DB operation — safe even if the application logic didn't have the lock.

**Source:** [`src/services/reservation.service.ts`](src/services/reservation.service.ts) — the `createReservation` method.

---

## How Expiry Works

### The problem

A reservation holds stock for 10 minutes. If the user abandons the checkout, that stock must automatically return to the available pool — otherwise available stock is permanently understated.

### The mechanism

A `setInterval` background job runs **every 60 seconds** inside the same Node.js process:

```
src/jobs/releaseExpiredReservations.ts
```

**Each run:**

1. `SELECT` all `PENDING` reservations where `expiresAt < NOW()` (batched, max 50 per run).
2. For each expired reservation, open a **Prisma transaction**:

```sql
-- Atomic test-and-set (race-condition guard)
UPDATE Reservation
SET status = 'EXPIRED'
WHERE id = $1 AND status = 'PENDING' AND expiresAt < NOW()
```

3. If `count = 0` → a concurrent confirm already processed this reservation → **skip stock release**.
4. If `count = 1` → reservation successfully expired → decrement `reservedStock`.

**Why the `AND status = 'PENDING'` guard?**

If a payment confirmation and the expiry job run at the exact same millisecond, both see `status = PENDING`. Without the guard, both would decrement stock — double-releasing. The `AND status = 'PENDING'` makes the update atomic: only one of the two can win the database row, the other gets `count = 0` and skips.

**Production consideration:**

For a multi-instance deployment (horizontal scaling), `setInterval` in each process would create redundant runs. In production, replace with one of:

| Option | Notes |
|---|---|
| **Vercel Cron** | `vercel.json` cron job calling `/api/cron/release-expired` — one invocation per interval |
| **BullMQ + Redis** | Distributed job queue; only one worker processes each batch |
| **pg_cron** | PostgreSQL extension; runs SQL directly in the DB — no app-level coordination needed |
| **Lazy cleanup** | Check `expiresAt` on every reservation read; expire inline. Simple but stock is unreleased until someone reads the reservation |

---

## How Redis Idempotency Works (Bonus)

### The problem

Mobile clients retry failed HTTP requests. If a reservation request succeeds but the response is lost in transit, the client retries — potentially creating a duplicate reservation.

### The protocol

Apply the `Idempotency-Key: <uuid>` header to any `POST /api/reservations` or `POST /api/reservations/:id/confirm` request.

```
First request:
  Client → Idempotency-Key: uuid-abc, body: { productId, qty, addressId }
  Server → cache miss → process normally → cache response → return 201

Retry (same key, same body):
  Client → Idempotency-Key: uuid-abc, body: { productId, qty, addressId }
  Server → cache hit, hash matches → return cached 201 (no DB write)

Different payload (client bug):
  Client → Idempotency-Key: uuid-abc, body: { productId, qty: 999, addressId }
  Server → cache hit, hash MISMATCH → return 409 Conflict
```

### Implementation

**Stored in Redis** (TTL: 24 hours):

```
Key:   idem:reserve:<idempotency-key>
       idem:confirm:<idempotency-key>

Value: { requestHash, statusCode, response }
```

The `requestHash` is a SHA-256 digest of the request body. It detects key reuse with a different payload — a client bug or potential CSRF.

**Response interception:** The middleware monkey-patches `res.json()`. After the controller writes the response, we capture `{ statusCode, body }` and store it in Redis before it goes to the wire. This means:
- The cache is always populated **after** the first successful response.
- If the controller throws (e.g. 409 on insufficient stock), the error response is also cached — the retry will get the same 409.

**Source:** [`src/middleware/idempotency.middleware.ts`](src/middleware/idempotency.middleware.ts)

---

## Assignment Gap Analysis

The original assignment spec was for a simpler confirm flow without Razorpay. Here's an honest comparison:

### ✅ Fully Satisfied

| Requirement | Implementation |
|---|---|
| `GET /api/products` with available stock per warehouse | ✅ `available = totalStock − reservedStock` computed per warehouse |
| `GET /api/warehouses` | ✅ |
| `POST /api/reservations` → 409 on insufficient stock | ✅ Row-locking guarantees exactly one winner |
| `POST /api/reservations/:id/release` | ✅ Atomic, handles concurrent release correctly |
| `POST /api/reservations/:id/confirm` → 410 on expired | ✅ Checked before any DB writes |
| Reservation expiry (auto-release) | ✅ Background job, concurrency-safe |
| **Bonus:** Redis idempotency with `Idempotency-Key` | ✅ Full implementation with payload hash |
| TypeScript end-to-end | ✅ Strict mode, 0 `tsc` errors |
| Hosted PostgreSQL | ✅ Neon |
| Hosted Redis | ✅ Upstash |

### ⚠️ Design Decisions That Differ from the Spec

| Spec | This Implementation | Why |
|---|---|---|
| Confirm has no required body | Confirm requires Razorpay payment fields | Added full payment verification flow; for a demo-only confirm, strip the body validation |
| `warehouseId` in reservation request body | `warehouseId` comes from `user.selectedWarehouseId` | Cleaner UX — user selects warehouse once at profile level, not per-reservation |
| No auth mentioned | JWT auth required on reservation endpoints | Adds security; evaluator needs to register/login first |
| `addressId` not in spec | Required in reservation body | Added for the full order-fulfillment model; can be made optional |
| Next.js App Router | Standalone Express backend | Frontend not built yet; Express backend will be consumed by Next.js or replaced with Next.js API routes |

### How to test the confirm endpoint without Razorpay

For a quick assignment demo without a real Razorpay flow, the confirm endpoint signature check can be bypassed in test mode by adding an environment variable guard:

```typescript
// In src/controllers/reservation.controller.ts confirm handler:
if (env.NODE_ENV !== "test") {
  const isValid = paymentService.verifyPaymentSignature({ ... });
  if (!isValid) throw new ApiError(400, "Signature invalid");
}
```

Alternatively, use Razorpay's [test mode](https://razorpay.com/docs/payments/dashboard/account-settings/test-mode/) which provides test card numbers and auto-generates valid signatures.

---

## Trade-offs & What I'd Do Differently

### What I prioritised

- **Correctness over simplicity.** The concurrency logic uses the most bulletproof mechanism available in PostgreSQL (row-level locking + optimistic `updateMany` guards). This adds a few lines of SQL but eliminates an entire class of bugs.
- **Layered architecture.** Separating controllers → services → repositories means the locking logic in `reservation.service.ts` is testable without HTTP. Each layer has one responsibility.
- **Fail-fast configuration.** `src/config/env.ts` validates all environment variables at startup using Zod. The server won't start with a misconfigured env — no mysterious runtime errors.

### What I'd do with more time

1. **Integration tests.** The most valuable tests here are concurrent integration tests — fire two requests simultaneously against a real DB and assert exactly one 201 and one 409. A Jest + Supertest suite with a test database would be the first addition.

2. **Distributed expiry job.** `setInterval` is fine for a single-process deployment. For horizontal scaling (multiple server pods), I'd replace it with BullMQ + Redis to ensure a reservation isn't released twice or missed entirely.

3. **Simplify the confirm endpoint.** The Razorpay integration is correct, but the assignment only needs "mark as confirmed". I'd offer both — a lightweight `confirm` (no payment, for the assignment demo) and a `confirm-with-payment` for the real integration.

4. **Address the `warehouseId` UX gap.** The current model requires the user to select a warehouse at the profile level before reserving. This is clean for the data model but the API docs need to be clearer about the prerequisite flow: `select-warehouse → reserve → pay → confirm`.

5. **Request-level DB connection pooling.** Currently using a global pg Pool via the Prisma adapter. In a serverless environment (Vercel, Neon), I'd use `@neondatabase/serverless` driver with HTTP-mode connections to avoid exhausting the connection pool.

6. **Observability.** Add structured logging (Pino), request tracing (OpenTelemetry), and alerting on failed expiry-job runs.
