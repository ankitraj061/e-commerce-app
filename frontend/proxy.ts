/**
 * proxy.ts  (Next.js 16 — replaces middleware.ts)
 *
 * Protects all routes under /warehouses, /products, /orders, /reservations, /profile.
 * Redirects unauthenticated users to /auth/login.
 *
 * NOTE: We cannot access HttpOnly cookies from JS or verify the JWT here without
 * edge-crypto, so we use a lightweight localStorage-based indicator stored in a
 * non-HttpOnly cookie ("bharatbazaar-auth-hint") that the auth store sets on login.
 */

import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/warehouses", "/products", "/orders", "/reservations", "/profile"];
const AUTH_PAGES = ["/auth/login", "/auth/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  // Read the lightweight hint cookie (set by client on login)
  const authHint = request.cookies.get("bharatbazaar-auth-hint")?.value === "1";

  // Redirect to login if hitting a protected route without auth
  if (isProtected && !authHint) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect to warehouses if already authed and hitting login/register
  if (isAuthPage && authHint) {
    const url = request.nextUrl.clone();
    url.pathname = "/warehouses";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/warehouses/:path*",
    "/products/:path*",
    "/orders/:path*",
    "/reservations/:path*",
    "/profile/:path*",
    "/auth/:path*",
  ],
};
