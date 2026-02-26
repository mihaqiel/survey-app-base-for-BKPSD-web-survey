// middleware.ts — project root (next to /app)
import { NextRequest, NextResponse } from "next/server";

// NOTE: Middleware runs in Edge Runtime — cannot import from lib/ipStore
// (Node.js global not available in edge). Manual block is checked inside
// the server action instead. This middleware is kept minimal.

export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [], // disabled — duplicate/spam logic is in the server action
};