"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function verifyToken(formData: FormData) {
  const token = formData.get("token") as string;

  if (!token) return { error: "Token is required" };

  // 1. Find the Period
  const period = await prisma.periode.findUnique({
    where: { token },
  });

  // 2. Validation Checks
  if (!period) return { error: "Invalid Token. Please scan the QR code again." };
  if (period.status !== "AKTIF") return { error: "This Survey Period is Closed." };

  // 3. Date Check
  const now = new Date();
  const start = new Date(period.tglMulai); start.setHours(0,0,0,0);
  const end = new Date(period.tglSelesai); end.setHours(23,59,59,999);
  
  if (now < start || now > end) {
    return { error: "Survey is not active today." };
  }

  // 4. Set Session Cookie (The Guard Pass)
  const cookieStore = await cookies();
  cookieStore.set("skm_token", period.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 30, // 30 mins session
    path: "/",
  });

  // 5. Redirect to Assessment
  redirect(`/assessment/${period.id}`);
}