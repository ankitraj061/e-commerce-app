
import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/warehouses", "/products", "/orders", "/reservations", "/profile"];
const AUTH_PAGES = ["/auth/login", "/auth/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  
  const authHint = request.cookies.get("bharatbazaar-auth-hint")?.value === "1";

  
  if (isProtected && !authHint) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  
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
