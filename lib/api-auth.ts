import { NextResponse } from "next/server";
import { getSessionUser, type AdminSession } from "@/lib/admin-auth";

/**
 * Returns a 401 NextResponse if the request is not from an authenticated admin.
 * Returns null if the request is authorized (proceed normally).
 *
 * Usage:
 *   const deny = await requireAdmin();
 *   if (deny) return deny;
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/**
 * Same guard, but hands back the caller's identity so the route can attribute
 * its writes. Returns a 401 response instead when unauthenticated.
 *
 * Usage:
 *   const auth = await requireAdminUser();
 *   if (auth instanceof NextResponse) return auth;
 *   // auth.email is the actor
 */
export async function requireAdminUser(): Promise<AdminSession | NextResponse> {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}
