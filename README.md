# BharatBazaar

> A full-stack, multi-warehouse inventory reservation and e-commerce platform built with Node.js + Next.js.

BharatBazaar lets customers browse products scoped to a physical warehouse, reserve stock with concurrency-safe guarantees, and complete payment via Razorpay — all in under 10 minutes from sign-up to order confirmation.

---

## Table of Contents

1. [Demo Credentials](#demo-credentials)
2. [Project Overview](#project-overview)
3. [Repository Layout](#repository-layout)
4. [Tech Stack](#tech-stack)
5. [Architecture Overview](#architecture-overview)
6. [Local Setup](#local-setup)
   - [Backend](#backend-setup)
   - [Frontend](#frontend-setup)
7. [Docker (Backend)](#docker-backend)
8. [Environment Variables](#environment-variables)
9. [Key Features](#key-features)
10. [API Summary](#api-summary)
11. [User Flow](#user-flow)
12. [Project Docs](#project-docs)

---

## Demo Credentials

> Pre-seeded account for assignment reviewers — no registration required.

| Field    | Value            |
|----------|------------------|
| Email    | `demo@allo.dev`  |
| Password | `Demo@1234`      |

The demo account is created automatically when you run `npx tsx prisma/seed.ts` (step 5 of [Backend Setup](#backend-setup)).

---

## Project Overview

BharatBazaar is a production-grade e-commerce system designed around the challenge of **multi-warehouse inventory management**. The core problem it solves:

- Multiple users can try to reserve the same last unit of stock simultaneously.
- Reservations must expire automatically if a user abandons checkout.
- Payments must be idempotent — retried requests must not create duplicate orders.

The solution uses PostgreSQL row-level locking (`SELECT … FOR UPDATE`), a background expiry job, and Redis idempotency keys — all wrapped in a clean layered architecture.

---

## Repository Layout

```
ecommerce-app/
├── backend/          # Express 5 + Prisma 7 REST API
│   ├── src/
│   │   ├── config/       # Env validation (Zod), DB pool, Redis client
│   │   ├── lib/          # Prisma client, JWT helpers, Razorpay SDK
│   │   ├── middleware/   # Auth, validation, idempotency, error handler
│   │   ├── validations/  # Zod schemas
│   │   ├── repositories/ # Pure Prisma DB queries
│   │   ├── services/     # Business logic + transactions
│   │   ├── controllers/  # HTTP handlers (thin layer over services)
│   │   ├── routes/       # Express Routers
│   │   ├── jobs/         # Background reservation expiry worker
│   │   ├── types/        # Express augmentations
│   │   └── utils/        # ApiError, ApiResponse, asyncWrapper
│   ├── prisma/
│   │   ├── schema.prisma # Database schema
│   │   └── seed.ts       # Demo data seeder
│   ├── Dockerfile
│   ├── .env.example
│   └── README.md         # Full backend docs
│
├── frontend/         # Next.js 16 App Router storefront
│   ├── app/              # Pages and layouts (App Router)
│   ├── components/       # Reusable UI primitives
│   ├── hooks/            # React Query data hooks
│   ├── providers/        # Auth, Query, and app providers
│   ├── services/         # Axios client + API methods
│   ├── store/            # Zustand persisted state
│   ├── types/            # Shared TypeScript interfaces
│   ├── .env.local.example
│   └── README.md         # Full frontend docs
│
└── README.md         # ← you are here
```

---

## Tech Stack

### Backend

| Layer              | Technology                        |
|--------------------|-----------------------------------|
| Runtime            | Node.js 20 + TypeScript (strict)  |
| Framework          | Express 5                         |
| ORM                | Prisma 7                          |
| Database           | PostgreSQL (Neon hosted)          |
| Cache / Idempotency| Redis (Upstash REST)              |
| Auth               | JWT — access token + refresh token rotation |
| Validation         | Zod 4                             |
| Payment            | Razorpay (test mode)              |
| Password hashing   | bcryptjs                          |

### Frontend

| Layer         | Technology                              |
|---------------|-----------------------------------------|
| Framework     | Next.js 16 (App Router)                 |
| Language      | TypeScript                              |
| UI            | React 19, Tailwind CSS 4, Radix UI      |
| Animations    | Framer Motion                           |
| State         | Zustand 5                               |
| Data Fetching | TanStack React Query v5                 |
| HTTP Client   | Axios                                   |
| Forms         | React Hook Form + Zod 4                 |
| Toasts        | Sonner                                  |
| Payment       | Razorpay JS SDK                         |

---

## Architecture Overview

```
Browser (Next.js 16)
       │
       │  REST over HTTPS
       ▼
Express 5 API  ──►  PostgreSQL (Neon)
       │                    ▲
       │  row-level lock     │  background expiry job
       │  SELECT FOR UPDATE  │  (setInterval, 60s)
       │                    │
       └──► Redis (Upstash)  │
              idempotency    │
              key store      │
                             │
              Razorpay ◄─────┘
              payment orders
              + signature verify
```

### Backend responsibilities

- **Auth** — Register, login, access token issuance, refresh token rotation, logout.
- **Products & Warehouses** — Read-only catalog with per-warehouse available stock computed as `totalStock − reservedStock`.
- **Reservations** — Concurrency-safe creation using `SELECT … FOR UPDATE` inside a Prisma interactive transaction. Automatic expiry every 60 s.
- **Payments** — Razorpay order creation and HMAC signature verification. Confirmation atomically settles stock and creates an Order.
- **Idempotency** — `Idempotency-Key` header support on reservation and confirm endpoints via Redis (24-hour TTL, payload-hash guard).

### Frontend responsibilities

- Authenticated routing with a lightweight middleware hint cookie.
- Warehouse selection that scopes all product and inventory views.
- Product catalog with search, sort, and warehouse-aware stock display.
- Reservation + Razorpay checkout flow.
- Order history and user profile management.

---

## Local Setup

> **Order matters:** start the backend first, then the frontend.

### Backend Setup

#### Prerequisites

- Node.js ≥ 20
- A PostgreSQL database (e.g. [Neon](https://neon.tech) free tier)
- An [Upstash Redis](https://upstash.com) instance (REST mode)
- A [Razorpay](https://razorpay.com) test-mode key pair

#### Steps

```bash
# 1. Enter the backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Copy and fill in environment variables
cp .env.example .env
# Edit .env — see Environment Variables section below

# 4. Run database migrations
npx prisma migrate dev --name init

# 5. Seed demo data
npx tsx prisma/seed.ts
# Creates: 3 warehouses, 6 products, 1 demo user (demo@allo.dev / Demo@1234)

# 6. Start the development server (hot reload)
npm run dev
```

Backend runs at **http://localhost:8000**
Health check: `GET http://localhost:8000/health`

---

### Frontend Setup

#### Prerequisites

- Node.js ≥ 20
- Backend API running and accessible

#### Steps

```bash
# 1. Enter the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create the local environment file
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL and NEXT_PUBLIC_RAZORPAY_KEY_ID

# 4. Start the development server
npm run dev
```

Frontend runs at **http://localhost:3000**

---

## Docker (Backend)

The backend ships with a multi-stage `Dockerfile` that produces a lean production image.

```bash
# Build the image
docker build -t bharatbazaar-backend ./backend

# Run the container (pass env vars)
docker run -p 8000:8000 \
  -e DATABASE_URL="postgresql://..." \
  -e UPSTASH_REDIS_REST_URL="https://..." \
  -e UPSTASH_REDIS_REST_TOKEN="..." \
  -e ACCESS_TOKEN_SECRET="..." \
  -e REFRESH_TOKEN_SECRET="..." \
  -e RAZORPAY_KEY_ID="rzp_test_..." \
  -e RAZORPAY_KEY_SECRET="..." \
  bharatbazaar-backend
```

The image:
1. **Builder stage** — installs all deps, generates Prisma client, compiles TypeScript.
2. **Runner stage** — installs production deps only, copies `dist/` — minimal final image.

---

## Environment Variables

### Backend (`backend/.env`)

```bash
# Server
PORT=8000
NODE_ENV=development

# PostgreSQL (Neon or any hosted Postgres)
DATABASE_URL=postgresql://user:password@host/db?sslmode=require

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# JWT — generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
ACCESS_TOKEN_SECRET=<64-char hex>
REFRESH_TOKEN_SECRET=<64-char hex>
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY_DAYS=7

# Razorpay test mode (dashboard.razorpay.com → Settings → API Keys)
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### Frontend (`frontend/.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
```

---

## Key Features

### Concurrency-safe Reservations

Two users cannot both reserve the last unit of stock. The backend uses a PostgreSQL `SELECT … FOR UPDATE` row lock inside a Prisma interactive transaction — the second request blocks until the first commits, then re-reads the stock and returns a `409 Conflict` if it's gone.

### Automatic Reservation Expiry

Reservations hold stock for 10 minutes. A background job (`setInterval`, 60 s) scans for expired `PENDING` reservations and releases stock atomically, guarding against double-release races with a `UPDATE … WHERE status = 'PENDING'` test-and-set.

### Redis Idempotency

Attach an `Idempotency-Key: <uuid>` header to `POST /api/reservations` or `POST /api/reservations/:id/confirm`. The server caches the response for 24 hours keyed on `idem:<scope>:<key>`. Retries with the same key return the cached response; retries with the same key but a different body return `409` (payload mismatch guard).

### JWT Token Rotation

Access tokens expire in 15 minutes. The Axios client in the frontend auto-retries `401` responses by calling `/api/auth/refresh-token`, which rotates the HttpOnly refresh token cookie and returns a new access token.

### Warehouse-scoped Inventory

Products are displayed with per-warehouse available stock. Selecting a warehouse persists client-side (Zustand) and scopes the entire catalog and checkout flow.

---

## API Summary

| Method | Endpoint                              | Auth | Description                              |
|--------|---------------------------------------|------|------------------------------------------|
| POST   | /api/auth/register                    | —    | Register a new user                      |
| POST   | /api/auth/login                       | —    | Login, receive access token + cookie     |
| POST   | /api/auth/refresh-token               | —    | Rotate refresh token, get new access token |
| POST   | /api/auth/logout                      | ✓    | Invalidate refresh token                 |
| GET    | /api/auth/me                          | ✓    | Get current user                         |
| GET    | /api/products                         | —    | List all products with inventory         |
| GET    | /api/products/:id                     | —    | Single product with inventory            |
| GET    | /api/warehouses                       | —    | List all warehouses                      |
| GET    | /api/warehouses/:id                   | —    | Single warehouse with inventory          |
| GET    | /api/reservations                     | ✓    | List user's reservations                 |
| POST   | /api/reservations                     | ✓    | Create a concurrency-safe reservation    |
| GET    | /api/reservations/:id                 | ✓    | Single reservation with details          |
| POST   | /api/reservations/:id/confirm         | ✓    | Confirm after Razorpay payment           |
| POST   | /api/reservations/:id/release         | ✓    | Manually release (cancel) a reservation  |
| POST   | /api/payments/create-order            | ✓    | Create a Razorpay order for a reservation|
| GET    | /api/orders                           | ✓    | List user's orders                       |
| GET    | /api/orders/:id                       | ✓    | Single order with items                  |
| GET    | /api/users/me/addresses               | ✓    | List delivery addresses                  |
| POST   | /api/users/me/addresses               | ✓    | Add a delivery address                   |

> Full request/response examples are in [backend/README.md](backend/README.md).

---

## User Flow

```
1. Register / Login          → access token + HttpOnly refresh cookie
2. Select a Warehouse        → saved to user profile (selectedWarehouseId)
3. Browse Products           → stock filtered by selected warehouse
4. View Product Detail       → see available units, click "Reserve"
5. Choose Delivery Address   → existing or add new
6. Create Reservation        → POST /api/reservations (10-min hold on stock)
7. Razorpay Checkout         → POST /api/payments/create-order → open Razorpay modal
8. Payment success callback  → POST /api/reservations/:id/confirm (HMAC verify)
9. Order Created             → stock settled, order visible in /orders
```

---

## Project Docs

| Document | Contents |
|---|---|
| [backend/README.md](backend/README.md) | Full API reference, concurrency design, expiry job, Redis idempotency, trade-offs |
| [frontend/README.md](frontend/README.md) | Page map, auth flow, state management, service layer, troubleshooting |
