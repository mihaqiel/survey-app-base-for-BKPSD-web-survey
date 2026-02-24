"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function submitSkmResponse(formData: FormData) {
  const periodeId = formData.get("periodeId") as string;
  const saran = formData.get("saran") as string;

  // 1. Check if Period is actually Open (Security Check)
  const periode = await prisma.periode.findUnique({ where: { id: periodeId } });
  if (!periode || periode.status !== "AKTIF") {
    redirect("/success?status=closed"); // 🔴 Redirect to Closed Page
  }

  // 2. Get IP Address
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for") || "unknown";

  // 3. 🛑 SPAM CHECK
  const existing = await prisma.respon.findFirst({
    where: {
      periodeId: periodeId,
      ipAddress: ip,
    }
  });

  if (existing) {
    // 🟠 Redirect to Spam/Duplicate Page
    redirect("/success?status=duplicate"); 
  }

  // 4. Parse Scores & Save
  const getInt = (key: string) => parseInt(formData.get(key) as string) || 0;

  await prisma.respon.create({
    data: {
      periodeId,
      u1: getInt("u1"), u2: getInt("u2"), u3: getInt("u3"),
      u4: getInt("u4"), u5: getInt("u5"), u6: getInt("u6"),
      u7: getInt("u7"), u8: getInt("u8"), u9: getInt("u9"),
      saran,
      ipAddress: ip,
    },
  });

  // 🟢 Redirect to Success Page
  redirect("/success?status=success");
}