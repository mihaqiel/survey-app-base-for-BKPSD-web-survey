import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, COOKIE_NAME } from "@/lib/session";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect all /admin routes
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const valid = await verifySessionToken(token);

    if (!valid) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
