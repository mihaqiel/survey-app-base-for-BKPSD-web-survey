"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import {
  createSessionToken,
  verifySessionToken,
  COOKIE_NAME,
  MAX_AGE,
} from "@/lib/session";
import { sendEmail } from "@/lib/email";
import { loginAlertTemplate } from "@/lib/email-templates";
import { getLoginLimiter } from "@/lib/ratelimit";

/** Resolve admin credentials at call time — never at module load (avoids build errors). */
function getAdminCredentials(): { username: string; passwordHash: string } {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) {
    throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD environment variables are required");
  }
  return { username, passwordHash: bcrypt.hashSync(password, 12) };
}

export async function login(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    redirect("/login?error=InvalidCredentials");
  }

  // Rate limit: 5 attempts per 15 minutes per IP
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const { success } = await getLoginLimiter().limit(ip);
  if (!success) {
    redirect("/login?error=TooManyAttempts");
  }

  const { username: ADMIN_USERNAME, passwordHash: ADMIN_PASSWORD_HASH } = getAdminCredentials();
  const usernameMatch = username === ADMIN_USERNAME;
  const passwordMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

  if (usernameMatch && passwordMatch) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, await createSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: MAX_AGE,
      path: "/",
    });

    // Fire-and-forget login security alert to ADMIN_EMAIL
    if (process.env.ADMIN_EMAIL) {
      const headerList = await headers();
      const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
      const timestamp = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
      const { subject, html } = loginAlertTemplate({ username, timestamp, ip });
      void sendEmail({ to: process.env.ADMIN_EMAIL, subject, html });
    }

    redirect("/admin");
  } else {
    redirect("/login?error=InvalidCredentials");
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/login");
}

export async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  return await verifySessionToken(c.get(COOKIE_NAME)?.value);
}
