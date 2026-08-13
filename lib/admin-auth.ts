/**
 * Server-side admin authentication (Node runtime).
 *
 * Two layers guard the dashboard:
 *   1. middleware.ts — verifies the token's signature and expiry at the edge.
 *      Fast, no database access, but cannot know whether the account was
 *      deactivated after the token was issued.
 *   2. This module — additionally confirms the account still exists and is
 *      active. Every server action and API route must call it, because server
 *      actions can be invoked directly without passing through middleware.
 *
 * Prefer `assertAdmin()` over `isAdmin()`: it returns the caller's identity,
 * which audit log entries need in order to name the actor.
 */
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { readSessionToken, COOKIE_NAME } from "@/lib/session";

export interface AdminSession {
  email: string;
  nama: string;
}

/** Resolve the current admin, or null if unauthenticated/deactivated. */
export async function getSessionUser(): Promise<AdminSession | null> {
  const store = await cookies();
  const payload = await readSessionToken(store.get(COOKIE_NAME)?.value);
  if (!payload) return null;

  const user = await prisma.adminUser.findUnique({
    where: { email: payload.email },
    select: { email: true, nama: true, isActive: true },
  });

  // A revoked account keeps a cryptographically valid token until it expires,
  // so the isActive check here is what actually cuts off access immediately.
  if (!user || !user.isActive) return null;

  return { email: user.email, nama: user.nama };
}

/** Yes/no check for call sites that don't need the identity. */
export async function isAdmin(): Promise<boolean> {
  return (await getSessionUser()) !== null;
}

/**
 * Guard that returns the caller's identity, throwing if unauthenticated.
 *
 * Throwing (rather than returning an error object) suits server actions
 * invoked from server components: the page is already behind middleware, so
 * this only fires on a direct unauthenticated call, which deserves to fail loudly.
 */
export async function assertAdmin(): Promise<AdminSession> {
  const user = await getSessionUser();
  if (!user) throw new Error("Tidak terautentikasi.");
  return user;
}
