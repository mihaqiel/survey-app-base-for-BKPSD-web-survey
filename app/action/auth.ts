"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function login(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  let success = false;

  try {
    const admin = await prisma.admin.findUnique({ where: { username } });
    if (admin) {
      const match = await bcrypt.compare(password, admin.password);
      if (match) {
        const cookieStore = await cookies();
        cookieStore.set("admin_session", "true", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24,
          path: "/",
        });
        success = true;
      }
    }
  } catch (err) {
    console.error("[AUTH] Error:", err);
  }

  if (success) redirect("/admin");
  redirect("/login?error=InvalidCredentials");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/login");
}

export async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  return c.get("admin_session")?.value === "true";
}