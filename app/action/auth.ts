"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function login(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  // Look up admin in database
  const admin = await prisma.admin.findUnique({ where: { username } });

  if (admin && await bcrypt.compare(password, admin.password)) {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });
    redirect("/admin");
  } else {
    redirect("/login?error=InvalidCredentials");
  }
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