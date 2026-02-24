import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 🟢 ALLOW PUBLIC ROUTES (Assessment, Login, Static)
  if (
    pathname.startsWith("/assessment") || 
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") || 
    pathname.startsWith("/static") || 
    pathname === "/success" ||
    pathname === "/" 
  ) {
    return NextResponse.next();
  }

  // 2. 🔴 PROTECT ADMIN ROUTES
  if (pathname.startsWith("/admin")) {
    // Check for the session cookie
    const adminSession = request.cookies.get("admin_session");

    if (!adminSession) {
      // 🚫 No cookie? Kick them to Login
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};