# BharatBazaar — Frontend

> Next.js 16 App Router storefront for the BharatBazaar multi-warehouse e-commerce platform.

The frontend is a fully type-safe React 19 application that handles authentication, warehouse-scoped product browsing, inventory reservation, Razorpay payment checkout, and order management — all communicating with the BharatBazaar Express API.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Folder Structure](#folder-structure)
3. [Page Map](#page-map)
4. [Running Locally](#running-locally)
5. [Environment Variables](#environment-variables)
6. [How the App Works](#how-the-app-works)
   - [Auth Flow](#auth-flow)
   - [Route Protection](#route-protection)
   - [Warehouse Selection](#warehouse-selection)
   - [Product Catalog](#product-catalog)
   - [Reservation & Payment Flow](#reservation--payment-flow)
   - [Order Management](#order-management)
7. [State Management](#state-management)
8. [Data Fetching](#data-fetching)
9. [Service Layer](#service-layer)
10. [TypeScript Types](#typescript-types)
11. [Scripts](#scripts)
12. [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Layer         | Technology                                        | Version  |
|---------------|---------------------------------------------------|----------|
| Framework     | Next.js (App Router)                              | 16.2.6   |
| Language      | TypeScript                                        | 5.x      |
| Runtime       | React                                             | 19.2.4   |
| Styling       | Tailwind CSS                                      | 4.x      |
| UI Primitives | Radix UI (Dialog, Dropdown, Select, Toast, etc.)  | latest   |
| Animations    | Framer Motion                                     | 12.x     |
| Icons         | Lucide React                                      | latest   |
| State         | Zustand                                           | 5.x      |
| Data Fetching | TanStack React Query                              | v5       |
| HTTP Client   | Axios                                             | 1.x      |
| Forms         | React Hook Form + @hookform/resolvers             | 7.x      |
| Validation    | Zod                                               | 4.x      |
| Toasts        | Sonner                                            | 2.x      |
| Payment       | Razorpay JS SDK (CDN)                             | —        |

---

## Folder Structure

```
frontend/
├── app/                        # Next.js App Router — pages and layouts
│   ├── auth/
│   │   ├── layout.tsx          # Auth shell layout (centered card)
│   │   ├── login/
│   │   │   └── page.tsx        # /auth/login
│   │   └── register/
│   │       └── page.tsx        # /auth/register
│   ├── orders/
│   │   ├── page.tsx            # /orders — order history list
│   │   └── [id]/
│   │       └── page.tsx        # /orders/[id] — single order details
│   ├── products/
│   │   ├── page.tsx            # /products — product catalog
│   │   └── [id]/
│   │       └── page.tsx        # /products/[id] — product detail + reserve CTA
│   ├── profile/
│   │   └── page.tsx            # /profile — user profile and address management
│   ├── reservations/
│   │   ├── page.tsx            # /reservations — active reservations list
│   │   └── [id]/
│   │       └── page.tsx        # /reservations/[id] — reservation detail + payment
│   ├── warehouses/
│   │   └── page.tsx            # /warehouses — warehouse selection
│   ├── layout.tsx              # Root layout — providers, fonts, metadata
│   ├── loading.tsx             # Global loading skeleton
│   ├── not-found.tsx           # 404 page
│   ├── page.tsx                # / — landing / home page
│   └── globals.css             # Tailwind base styles
│
├── hooks/                      # React Query data hooks (one per resource)
│   ├── use-addresses.ts        # CRUD for delivery addresses
│   ├── use-countdown.ts        # Reservation expiry countdown timer
│   ├── use-orders.ts           # Order list and detail queries
│   ├── use-products.ts         # Product list and detail queries
│   ├── use-reservations.ts     # Reservation list, detail, create, confirm, release
│   └── use-warehouses.ts       # Warehouse list and detail queries
│
├── lib/
│   ├── animations.ts           # Shared Framer Motion variants
│   └── utils.ts                # Tailwind class merger (clsx + tailwind-merge)
│
├── providers/
│   ├── auth-provider.tsx       # Restores auth state on mount (token refresh)
│   ├── index.tsx               # Composes all providers
│   └── query-provider.tsx      # TanStack Query client setup
│
├── services/                   # Typed API client methods
│   ├── api.ts                  # Axios instance — token injection, 401 retry, error normalisation
│   ├── address.service.ts      # Address endpoints
│   ├── auth.service.ts         # Login, register, logout, refresh, me
│   ├── order.service.ts        # Order endpoints
│   ├── payment.service.ts      # Razorpay order creation
│   ├── product.service.ts      # Product endpoints
│   ├── reservation.service.ts  # Reservation CRUD + confirm + release
│   └── warehouse.service.ts    # Warehouse endpoints
│
├── store/                      # Zustand persisted client state
│   ├── auth.store.ts           # User, access token, login/logout actions
│   ├── reservation.store.ts    # Active reservation being checked out
│   └── warehouse.store.ts      # Selected warehouse (persisted to localStorage)
│
├── types/
│   └── index.ts                # All shared TypeScript interfaces (mirrors Prisma schema)
│
├── proxy.ts                    # Next.js middleware — route protection
├── .env.local.example          # Environment variable template
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
└── tsconfig.json               # TypeScript configuration
```

---

## Page Map

| Route                   | Auth Required | Description                                          |
|-------------------------|:-------------:|------------------------------------------------------|
| `/`                     | —             | Landing page / hero section                          |
| `/auth/login`           | —             | Login form (redirects to `/warehouses` if signed in) |
| `/auth/register`        | —             | Registration form                                    |
| `/warehouses`           | ✓             | Select and persist the active warehouse              |
| `/products`             | ✓             | Product catalog — search, sort, warehouse-scoped stock |
| `/products/[id]`        | ✓             | Product detail page with "Reserve" CTA               |
| `/reservations`         | ✓             | List of the user's active/past reservations          |
| `/reservations/[id]`    | ✓             | Reservation detail + Razorpay checkout button        |
| `/orders`               | ✓             | Order history                                        |
| `/orders/[id]`          | ✓             | Order detail with items and delivery address         |
| `/profile`              | ✓             | Edit name/email, manage delivery addresses           |

---

## Running Locally

### Prerequisites

- **Node.js 20+**
- **Backend API** running at `http://localhost:8000` (see [backend/README.md](../backend/README.md))

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
```

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Tip:** Use the seeded demo account — `demo@allo.dev` / `Demo@1234` — to skip registration.

---

## Environment Variables

| Variable                     | Required | Description                                            |
|------------------------------|:--------:|--------------------------------------------------------|
| `NEXT_PUBLIC_API_URL`        | ✓        | Base URL for the backend API (no trailing slash)        |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID`| ✓        | Razorpay public key for frontend checkout initiation    |

Both variables are prefixed `NEXT_PUBLIC_` so they are embedded in the browser bundle at build time.

---

## How the App Works

### Auth Flow

```
User submits login form
  → POST /api/auth/login
  → Server returns { accessToken, user } + sets HttpOnly refreshToken cookie
  → accessToken stored in auth.store.ts (memory only — never localStorage)
  → User object stored in auth.store.ts
  → Axios interceptor injects "Authorization: Bearer <token>" on every request

Token expires (15 min)
  → Axios receives 401
  → Interceptor calls POST /api/auth/refresh-token (cookie sent automatically)
  → New accessToken stored in auth.store.ts
  → Original request retried transparently

Logout
  → POST /api/auth/logout clears the DB refresh token record
  → Cookie cleared by server
  → auth.store.ts reset, user redirected to /auth/login
```

**Key files:**
- [store/auth.store.ts](store/auth.store.ts) — Zustand auth state and actions
- [services/auth.service.ts](services/auth.service.ts) — API calls
- [services/api.ts](services/api.ts) — Axios instance with 401 intercept and token retry
- [providers/auth-provider.tsx](providers/auth-provider.tsx) — Restores auth on page reload

---

### Route Protection

Route protection runs in **Next.js middleware** ([proxy.ts](proxy.ts)) before the page renders — even before React hydrates. It reads a lightweight `bharatbazaar-auth-hint` cookie (a non-secret presence flag set at login, cleared at logout).

| Condition                               | Behaviour                              |
|-----------------------------------------|----------------------------------------|
| No hint cookie, accessing protected route | Redirect to `/auth/login`             |
| Hint cookie present, accessing `/auth/login` or `/auth/register` | Redirect to `/warehouses` |
| All other cases                         | Pass through                           |

> The hint cookie does **not** carry sensitive data — it only signals that a session cookie exists. The actual API calls are still gated by `Authorization: Bearer` JWT validation on the server.

---

### Warehouse Selection

Warehouse state is managed in [store/warehouse.store.ts](store/warehouse.store.ts) using Zustand with `persist` middleware (localStorage).

**Why warehouse selection matters:**

- `selectedWarehouseId` is stored in the user's profile on the server.
- Every `POST /api/reservations` reads the warehouse from the authenticated user's profile — no `warehouseId` needed in the request body.
- The frontend uses the locally persisted value to filter product inventory display.

**Flow:**
```
/warehouses page → user clicks a warehouse card
  → PATCH /api/auth/me { selectedWarehouseId }
  → warehouse.store.ts updated
  → user redirected to /products
  → product catalog filters inventory to selected warehouse
```

---

### Product Catalog

Page: [app/products/page.tsx](app/products/page.tsx)

Data is fetched with [hooks/use-products.ts](hooks/use-products.ts) via React Query. Client-side filtering is applied on top of the full product list:

| Filter / Sort       | Implementation                                         |
|---------------------|--------------------------------------------------------|
| **Search**          | Client-side filter on product name and description     |
| **Sort by name**    | Alphabetical ascending/descending                      |
| **Sort by price**   | Numeric ascending/descending on the price string       |
| **Sort by stock**   | Available units for the selected warehouse             |
| **Warehouse scope** | Shows `available = totalStock − reservedStock` per warehouse |

Available stock is computed on the backend and included in the `/api/products` response. The frontend helper `availableStock(inventory)` (from [types/index.ts](types/index.ts)) provides the same calculation client-side as a fallback.

---

### Reservation & Payment Flow

```
1. Product detail page (/products/[id])
   → Click "Reserve"
   → User selects quantity + delivery address
   → POST /api/reservations
      ← 201 { reservation } — stock held for 10 minutes
      ← 409 — insufficient stock (another user got it first)

2. Reservation detail page (/reservations/[id])
   → Countdown timer shows time remaining (use-countdown hook)
   → Click "Pay Now"
   → POST /api/payments/create-order { reservationId }
      ← 201 { razorpayOrderId, amount, currency, razorpayKeyId }
   → Razorpay modal opens (CDN script injected via next/script)

3. Razorpay payment success callback
   → razorpay_order_id, razorpay_payment_id, razorpay_signature returned
   → POST /api/reservations/:id/confirm { ...razorpayFields }
      ← 201 { order } — stock settled, order created
   → User redirected to /orders/[id]

4. Payment abandoned / failed
   → POST /api/reservations/:id/release
      ← 200 — stock returned to available pool
   → OR — reservation auto-expires after 10 min (background job)
```

**Key files:**
- [services/reservation.service.ts](services/reservation.service.ts)
- [services/payment.service.ts](services/payment.service.ts)
- [hooks/use-reservations.ts](hooks/use-reservations.ts)
- [hooks/use-countdown.ts](hooks/use-countdown.ts)

---

### Order Management

After a successful payment confirmation the backend creates an `Order` + `OrderItem` record. The frontend displays these at:

- `/orders` — paginated list with status badges (`PLACED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`)
- `/orders/[id]` — full detail: items, unit prices, total, delivery address, payment ID

---

## State Management

Zustand is used for global client state that needs to persist across navigation.

| Store                                          | Persisted | Contents                                       |
|------------------------------------------------|:---------:|------------------------------------------------|
| [store/auth.store.ts](store/auth.store.ts)     | No (memory only) | `user`, `accessToken`, `login`, `logout`, `setUser` |
| [store/warehouse.store.ts](store/warehouse.store.ts) | ✓ localStorage | `selectedWarehouse`, `setWarehouse`, `clearWarehouse` |
| [store/reservation.store.ts](store/reservation.store.ts) | ✓ sessionStorage | Active checkout reservation (survives soft refresh) |

> The access token is intentionally **not persisted** — on a hard reload, `auth-provider.tsx` silently calls `/api/auth/refresh-token` to restore the session from the HttpOnly cookie.

---

## Data Fetching

All server data is fetched via **TanStack React Query v5** hooks in [hooks/](hooks/). This provides:

- Automatic background refetching and stale-while-revalidate caching
- Request deduplication
- Loading, error, and success states out of the box
- Optimistic mutation support

| Hook file                                                | Queries / Mutations                                    |
|----------------------------------------------------------|--------------------------------------------------------|
| [hooks/use-products.ts](hooks/use-products.ts)           | `useProducts`, `useProduct(id)`                        |
| [hooks/use-warehouses.ts](hooks/use-warehouses.ts)       | `useWarehouses`, `useWarehouse(id)`                    |
| [hooks/use-reservations.ts](hooks/use-reservations.ts)   | `useReservations`, `useReservation(id)`, `useCreateReservation`, `useConfirmReservation`, `useReleaseReservation` |
| [hooks/use-orders.ts](hooks/use-orders.ts)               | `useOrders`, `useOrder(id)`                            |
| [hooks/use-addresses.ts](hooks/use-addresses.ts)         | `useAddresses`, `useCreateAddress`, `useDeleteAddress` |
| [hooks/use-countdown.ts](hooks/use-countdown.ts)         | `useCountdown(expiresAt)` — returns `{ minutes, seconds, expired }` |

---

## Service Layer

Each service module in [services/](services/) wraps one resource's API endpoints as typed async functions. The hooks import from services; services import from the Axios instance.

```
hooks/use-products.ts
  └── services/product.service.ts
        └── services/api.ts  (Axios instance with interceptors)
              └── NEXT_PUBLIC_API_URL
```

The Axios instance in [services/api.ts](services/api.ts):

1. Sets `baseURL` to `NEXT_PUBLIC_API_URL`.
2. Sets `withCredentials: true` so the refresh token cookie is sent automatically.
3. **Request interceptor** — reads `accessToken` from `auth.store` and injects `Authorization: Bearer <token>`.
4. **Response interceptor** — on `401`, queues the failed request, calls `/auth/refresh-token`, stores the new token, then replays all queued requests.

---

## TypeScript Types

All shared types live in [types/index.ts](types/index.ts). They mirror the Prisma schema and API response shapes exactly, so no runtime casting is needed.

Key types:

| Type                        | Description                                          |
|-----------------------------|------------------------------------------------------|
| `User`                      | Authenticated user with `selectedWarehouseId`        |
| `Product`, `ProductWithInventory` | Product with per-warehouse inventory breakdown |
| `Warehouse`, `WarehouseWithInventory` | Warehouse with full product inventory      |
| `Inventory`                 | Stock record — `totalStock`, `reservedStock`         |
| `availableStock(inv)`       | Helper: `Math.max(0, totalStock − reservedStock)`    |
| `Reservation`, `ReservationWithDetails` | Full reservation with product, warehouse, payment |
| `ReservationStatus`         | `"PENDING" \| "CONFIRMED" \| "RELEASED" \| "EXPIRED"` |
| `Order`, `OrderWithDetails` | Order with items and delivery address                |
| `OrderStatus`               | `"PLACED" \| "PROCESSING" \| "SHIPPED" \| "DELIVERED" \| "CANCELLED"` |
| `Payment`                   | Persisted payment record with Razorpay IDs           |
| `RazorpayOptions`, `RazorpayPaymentResponse` | Razorpay JS SDK types         |
| `ApiSuccess<T>`, `ApiError`, `ApiResponse<T>` | Typed API wrapper shapes       |

---

## Scripts

```bash
npm run dev      # Start development server (hot reload) on http://localhost:3000
npm run build    # Type-check and build for production
npm run start    # Start the production server (after build)
npm run lint     # Run ESLint
```

---

## Troubleshooting

### Protected routes redirect immediately

Clear browser cookies and localStorage, then reload. The middleware reads the `bharatbazaar-auth-hint` cookie — if it's missing or stale, you'll be redirected to `/auth/login`.

### Products show no stock / wrong inventory

1. Verify `NEXT_PUBLIC_API_URL` is correct in `.env.local`.
2. Confirm the backend is running and `GET http://localhost:8000/health` returns 200.
3. Make sure you have selected a warehouse — navigate to `/warehouses`.

### Auth fails after page reload

The `auth-provider.tsx` calls `/api/auth/refresh-token` on mount. If this fails:
- Check that the backend `REFRESH_TOKEN_SECRET` hasn't changed.
- Check that `withCredentials: true` is set on the Axios instance — the cookie must be sent.
- Check for CORS mismatches: `NEXT_PUBLIC_API_URL` must match the backend's `CORS_ORIGIN`.

### Razorpay modal doesn't open

1. Check the browser console for `Razorpay is not defined` — the CDN script may have been blocked.
2. Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` matches the test key in your Razorpay dashboard.
3. Ensure the backend `/api/payments/create-order` returns `200` — check the network tab.

### TypeScript errors after pulling new changes

```bash
cd frontend
npm install          # pick up any new deps
npm run build        # full type check
```
