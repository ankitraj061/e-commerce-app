# BharatBazaar Frontend

A Next.js 16 App Router frontend for the BharatBazaar multi-warehouse ecommerce platform.

This app is the customer-facing storefront that connects to the backend API and enables:
- authenticated users to browse products by warehouse
- warehouse-aware inventory and stock availability
- reservation creation, payment flow and order management
- profile and warehouse selection persistence

---

## Table of Contents

1. [Stack](#stack)
2. [Folder Structure](#folder-structure)
3. [Running Locally](#running-locally)
4. [Environment Variables](#environment-variables)
5. [How the App Works](#how-the-app-works)
6. [Key Frontend Concepts](#key-frontend-concepts)
7. [Scripts](#scripts)
8. [Troubleshooting](#troubleshooting)

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS, Radix UI |
| State | Zustand |
| Data Fetching | React Query v5 |
| HTTP Client | Axios |
| Auth | JWT + HttpOnly refresh cookie |
| Payment | Razorpay |

---

## Folder Structure

```
app/
├── auth/            # login, register, and auth callback pages
├── orders/          # order history and details pages
├── products/        # product catalog and product detail pages
├── profile/         # authenticated user profile page
├── reservations/    # reservation and payment flow pages
├── warehouses/      # warehouse selection and current warehouse status
├── layout.tsx       # root layout and global providers
└── page.tsx         # homepage / landing page

components/          # reusable UI and layout primitives
features/            # grouped feature UI sections
hooks/               # React Query hooks and custom data hooks
providers/           # app provider wrappers and context
services/            # API clients and cleanup helpers
store/               # Zustand persisted client state
types/               # shared TypeScript interfaces and helpers
```

---

## Running Locally

### Prerequisites

- Node.js 20+
- Backend API running and accessible
- `NEXT_PUBLIC_API_URL` set to point to the backend API

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Configure environment

Create a local environment file in the frontend directory:

```bash
cd frontend
cat > .env.local <<'EOV'
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
EOV
```

### 3. Start the app

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Environment Variables

The frontend uses the following variables in `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
```

- `NEXT_PUBLIC_API_URL` — base API URL for backend requests.
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` — Razorpay public key for checkout.

---

## How the App Works

### Primary pages

- `/warehouses` — choose the warehouse that scopes product inventory and enables reservations.
- `/products` — browse the catalog, search, sort, and view products for the selected warehouse.
- `/products/[id]` — product detail page with reservation CTA.
- `/reservations` — view and manage pending reservations.
- `/orders` — view completed orders.
- `/profile` — edit profile data and clear warehouse selection.

### Data flow

- Data is fetched through React Query hooks in `frontend/hooks/`.
- Service modules in `frontend/services/` map API endpoints to typed client methods.
- The Axios client in `frontend/services/api.ts` handles token injection, refresh, and error normalization.

---

## Key Frontend Concepts

### Auth flow

- Auth state is managed in `frontend/store/auth.store.ts`.
- The access token is stored in memory and injected into requests by the Axios client.
- A lightweight cookie (`bharatbazaar-auth-hint`) is used by `frontend/proxy.ts` to protect routes before hydration.
- Refresh tokens are stored as HttpOnly cookies and are refreshed automatically on 401 responses.

### Route protection

- `frontend/proxy.ts` redirects unauthenticated users from protected routes to `/auth/login`.
- Signed-in users who accidentally hit `/auth/login` or `/auth/register` are redirected to `/warehouses`.

### Warehouse selection

- Selected warehouse state is persisted client-side in `frontend/store/warehouse.store.ts`.
- Warehouse choice controls which products are visible and how inventory is displayed.
- The warehouse selection step is intentionally first in the flow so stock is localized.

### Product filtering

- Product data is fetched from `/api/products`.
- The catalog page applies:
  - warehouse inventory filtering
  - search by name/description
  - sort by name, price, or stock
- If no warehouse is selected, product stock is still visible but warehouse-specific inventory may not be scoped.

### Payment and reservation flow

- Razorpay checkout is initiated from reservation pages.
- The frontend uses `frontend/services/payment.service.ts` and `NEXT_PUBLIC_RAZORPAY_KEY_ID`.
- Payment confirmation is forwarded to the backend for signature verification and order creation.

---

## Scripts

```bash
npm run dev      # start the development server
npm run build    # build the app for production
npm run start    # start the production server
npm run lint     # run ESLint checks
```

---

## Troubleshooting

- If protected routes redirect unexpectedly, clear browser cookies and localStorage.
- If product data is missing, verify `NEXT_PUBLIC_API_URL` and that the backend is reachable.
- If auth fails after refresh, confirm the backend refresh endpoint is live and `withCredentials` is enabled on the client.
- If Razorpay checkout fails, verify the test public key and backend order endpoint.
