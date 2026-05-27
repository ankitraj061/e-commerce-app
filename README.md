# BharatBazaar

A full-stack multi-warehouse inventory reservation and ecommerce platform.

This repository contains two applications:

- `backend/` — Express + Prisma API with concurrency-safe reservations, JWT auth, Redis idempotency, Razorpay payments.
- `frontend/` — Next.js 16 App Router storefront with warehouse-aware catalog, reservation checkout, and user profile.

---

## Table of Contents

1. [Repository Layout](#repository-layout)
2. [Architecture Overview](#architecture-overview)
3. [Local Setup](#local-setup)
4. [Backend](#backend)
5. [Frontend](#frontend)
6. [Shared Notes](#shared-notes)

---

## Repository Layout

```text
backend/   # API server, database schema, migrations, services, controllers, and jobs
frontend/  # Next.js storefront, UI components, state, services, and pages
```

### Backend structure

- `src/index.ts` — Express server startup
- `src/routes/` — route registration
- `src/controllers/` — request handlers
- `src/services/` — business logic and transaction handling
- `src/repositories/` — Prisma database access
- `src/middleware/` — auth, validation, idempotency, error handling
- `src/jobs/` — reservation expiry worker
- `prisma/` — schema, migrations, seed data

### Frontend structure

- `app/` — Next.js App Router pages and layouts
- `components/` — reusable UI components
- `hooks/` — React Query and custom hooks
- `providers/` — app-level providers
- `services/` — API methods and Axios client
- `store/` — Zustand persisted state
- `types/` — shared TypeScript models

---

## Architecture Overview

### Backend responsibilities

- authentication and authorization
- product, warehouse, reservation, and payment APIs
- concurrency-safe reservation creation using row-level locking
- automatic release of expired reservations
- Razorpay payment order creation and signature verification
- Redis idempotency for retry-safe request handling

### Frontend responsibilities

- authenticated user experience with route protection
- warehouse selection and product inventory scoping
- product browsing, search, sorting, and filtering
- reservation creation and payment checkout
- order history and profile management

---

## Local Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
# update .env with your Postgres, Redis, JWT, and Razorpay values
npm run dev
```

Default backend URL: `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
```

Create a local frontend environment file:

```bash
cd frontend
cat > .env.local <<'EOV'
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
EOV
```

Start the frontend:

```bash
npm run dev
```

Default frontend URL: `http://localhost:3000`

---

## Backend

The backend documentation lives in `backend/README.md`.

Key notes:

- Use `npm run dev` to start the API server.
- Use `npx prisma migrate dev` to apply schema changes.
- Use `npx tsx prisma/seed.ts` to populate demo warehouses, products, and a demo user.
- The API uses cookie-based refresh tokens and access token authorization.
- Reservation creation is concurrency-safe and uses database locking to prevent oversell.

---

## Frontend

The frontend documentation lives in `frontend/README.md`.

Key notes:

- The frontend uses `NEXT_PUBLIC_API_URL` to reach the backend.
- Auth state is persisted in Zustand and the access token is injected into Axios.
- Route protection is implemented with `frontend/proxy.ts` using a small auth hint cookie.
- Warehouse selection is persisted and drives inventory filtering on the product page.

---

## Shared Notes

- The frontend and backend are separate apps with independent dependency installs.
- The backend must be running before starting the frontend.
- If the backend schema changes, migrate and reseed before using the frontend.
- `backend/README.md` and `frontend/README.md` are the authoritative application docs.
