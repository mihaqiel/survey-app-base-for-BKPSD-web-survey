"use server";

import { prisma } from "@/lib/prisma";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTokenLimiter } from "@/lib/ratelimit";

export async function verifyToken(formData: FormData) {
  const token = formData.get("token") as string;

  if (!token) return { error: "Token cannot be empty." };

  // Rate limit: 10 attempts per 5 minutes per IP
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const { success } = await getTokenLimiter().limit(ip);
  if (!success) return { error: "Terlalu banyak percobaan token. Coba lagi dalam beberapa menit." };

  // 1. Verify Global Token
  const period = await prisma.periode.findUnique({
    where: { token }
  });

  if (!period || period.status !== "AKTIF") {
    return { error: "Invalid or Expired Token." };
  }

  // 2. Set Session Cookie
  const cookieStore = await cookies();
  cookieStore.set("skm_token", period.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 4, // 4 Hours
  });

  // 3. Redirect to the Service Menu
  redirect("/portal");
}