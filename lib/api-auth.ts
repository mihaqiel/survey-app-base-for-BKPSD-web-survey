import { cookies } from "next/headers";
import { verifySessionToken, COOKIE_NAME } from "@/lib/session";
import { NextResponse } from "next/server";

/**
 * Returns a 401 NextResponse if the request is not from an authenticated admin.
 * Returns null if the request is authorized (proceed normally).
 *
 * Usage:
 *   const deny = await requireAdmin();
 *   if (deny) return deny;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const c = await cookies();
  const valid = await verifySessionToken(c.get(COOKIE_NAME)?.value);
  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
