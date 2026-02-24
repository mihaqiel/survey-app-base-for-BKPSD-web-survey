"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function verifyToken(formData: FormData) {
  const token = formData.get("token") as string;

  if (!token) return { error: "Token cannot be empty." };

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
    path: "/", 
    maxAge: 60 * 60 * 4 // 4 Hours
  });

  // 3. Redirect to the Service Menu
  redirect("/portal");
}