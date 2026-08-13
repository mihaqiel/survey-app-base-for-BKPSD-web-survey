"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSessionToken, COOKIE_NAME, MAX_AGE } from "@/lib/session";
import { sendEmail } from "@/lib/email";
import { loginAlertTemplate } from "@/lib/email-templates";
import { getLoginLimiter } from "@/lib/ratelimit";

// NOTE: auth helpers are NOT re-exported from here. In a "use server" module,
// a re-export silently strips every export from the module, and each remaining
// export becomes a publicly callable endpoint. Import isAdmin/assertAdmin
// directly from "@/lib/admin-auth" instead.

/**
 * Password login — the break-glass path.
 *
 * Normal admins sign in with Google (see /api/auth/google). This exists so the
 * team is not locked out if Google OAuth breaks or the instansi's accounts
 * change. Only AdminUser rows that carry a passwordHash can use it.
 */
export async function login(formData: FormData) {
  // The form field is still named "username" for backwards compatibility,
  // but the value is now an email address.
  const email    = (formData.get("username") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    redirect("/login?error=InvalidCredentials");
  }

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";

  try {
    const { success } = await getLoginLimiter().limit(ip);
    if (!success) {
      redirect("/login?error=TooManyAttempts");
    }
  } catch {
    // Redis unavailable — allow the attempt rather than locking everyone out,
    // but make the gap visible in logs.
    console.warn("[login] rate limiter unavailable, proceeding without limit");
  }

  const user = await resolvePasswordUser(email, password);

  if (!user) {
    redirect("/login?error=InvalidCredentials");
  }

  await startSession(user.email, ip);
  redirect("/admin");
}

/**
 * Verify credentials against AdminUser, with a one-time bootstrap path.
 *
 * If no admin exists yet (fresh database, seed not run), the ADMIN_USERNAME /
 * ADMIN_PASSWORD env vars create the first account. That path closes
 * permanently as soon as one AdminUser row exists, so it cannot be used to add
 * accounts later.
 */
async function resolvePasswordUser(
  email: string,
  password: string,
): Promise<{ email: string } | null> {
  const adminCount = await prisma.adminUser.count();

  if (adminCount === 0) {
    const bootstrapEmail    = process.env.ADMIN_USERNAME?.trim().toLowerCase();
    const bootstrapPassword = process.env.ADMIN_PASSWORD;

    if (!bootstrapEmail || !bootstrapPassword) return null;
    if (email !== bootstrapEmail || password !== bootstrapPassword) return null;

    const created = await prisma.adminUser.create({
      data: {
        email: bootstrapEmail,
        nama: "Break-glass Admin",
        passwordHash: await bcrypt.hash(bootstrapPassword, 12),
      },
      select: { email: true },
    });
    console.warn("[login] bootstrap admin created:", created.email);
    return created;
  }

  const user = await prisma.adminUser.findUnique({
    where: { email },
    select: { email: true, isActive: true, passwordHash: true },
  });

  // Deactivated accounts and Google-only accounts (no passwordHash) are both
  // rejected here. bcrypt.compare is constant-time for a given hash.
  if (!user || !user.isActive || !user.passwordHash) return null;
  if (!(await bcrypt.compare(password, user.passwordHash))) return null;

  return { email: user.email };
}

/**
 * Issue the session cookie, stamp lastLoginAt, and fire the security alert.
 *
 * Deliberately NOT exported. In a "use server" module every export is a
 * publicly reachable endpoint, and an exported version of this would let any
 * caller mint an admin session for an arbitrary email address.
 */
async function startSession(email: string, ip: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, await createSessionToken(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });

  await prisma.adminUser.updateMany({
    where: { email },
    data: { lastLoginAt: new Date() },
  });

  if (process.env.ADMIN_EMAIL) {
    const timestamp = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
    const { subject, html } = loginAlertTemplate({ username: email, timestamp, ip });
    void sendEmail({ to: process.env.ADMIN_EMAIL, subject, html });
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/login");
}
