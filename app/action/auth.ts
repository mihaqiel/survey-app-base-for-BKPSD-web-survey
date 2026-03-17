"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import {
  createSessionToken,
  verifySessionToken,
  COOKIE_NAME,
  MAX_AGE,
} from "@/lib/session";

// Pre-hash the admin password at module load so we can use bcrypt.compare().
// In production, store a bcrypt hash in the database instead of env plaintext.
const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(
  process.env.ADMIN_PASSWORD ?? "bkpsd2026",
  12,
);

export async function login(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    redirect("/login?error=InvalidCredentials");
  }

  const usernameMatch = username === ADMIN_USERNAME;
  const passwordMatch = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

  if (usernameMatch && passwordMatch) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, await createSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: MAX_AGE,
      path: "/",
    });
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
