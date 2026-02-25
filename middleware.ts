import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. PROTECT SURVEY ROUTES
  // User must have 'skm_token' cookie to view /assessment/*
  if (pathname.startsWith("/assessment")) {
    const tokenCookie = request.cookies.get("skm_token");
    
    if (!tokenCookie) {
      // Redirect to Gatekeeper if missing
      const url = request.nextUrl.clone();
      url.pathname = "/enter";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Apply to these paths
export const config = {
  matcher: ["/assessment/:path*"],
};