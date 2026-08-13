import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, COOKIE_NAME } from "@/lib/session";

/**
 * First of two auth layers guarding the dashboard.
 *
 * This is a fast gate only: it checks that the session cookie carries a valid,
 * unexpired signature. It deliberately does NOT hit the database, so it cannot
 * know whether an account was deactivated after its token was issued.
 *
 * It must never be the only gate. CVE-2025-29927 allows proxy authorization to
 * be bypassed via a crafted `x-middleware-subrequest` header, and server
 * actions are invoked directly without passing through here at all. The real
 * enforcement lives in lib/admin-auth.ts, which every server action and route
 * handler calls.
 */
export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    let valid = false;
    try {
      valid = await verifySessionToken(req.cookies.get(COOKIE_NAME)?.value);
    } catch (err) {
      // A thrown error here means SESSION_SECRET is missing or malformed.
      // Fail closed: treat it as unauthenticated rather than letting it through.
      console.error("[proxy] session verification failed:", err);
    }

    if (!valid) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname + search);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
