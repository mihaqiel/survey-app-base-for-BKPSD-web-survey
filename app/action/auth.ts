"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// 🔐 HARDCODED CREDENTIALS (Simple & Secure for now)
// In production, move these to .env file
const ADMIN_USER = "admin";
const ADMIN_PASS = "bkpsd2026"; 

export async function login(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  // 1. 🛡️ VERIFY CREDENTIALS
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    
    // 2. 🍪 SET SECURE SESSION COOKIE
    // This cookie acts as the "Badge" for the middleware
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 Hours
      path: "/",
    });

    redirect("/admin");
  } else {
    // 3. ❌ DENY ACCESS
    // We redirect back with an error flag
    redirect("/login?error=true");
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/login");
}