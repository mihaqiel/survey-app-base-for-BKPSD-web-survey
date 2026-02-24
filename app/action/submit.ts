"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function submitSkmResponse(formData: FormData) {
  const periodeId = formData.get("periodeId") as string;
  
  // 1. 🛡️ EXTRACT & VALIDATE (Strict 1-4 Integer)
  // We explicitly map u1-u9 to ensure type safety.
  const data = {
    u1: parseInt(formData.get("u1") as string),
    u2: parseInt(formData.get("u2") as string),
    u3: parseInt(formData.get("u3") as string),
    u4: parseInt(formData.get("u4") as string),
    u5: parseInt(formData.get("u5") as string),
    u6: parseInt(formData.get("u6") as string),
    u7: parseInt(formData.get("u7") as string),
    u8: parseInt(formData.get("u8") as string),
    u9: parseInt(formData.get("u9") as string),
    saran: formData.get("saran") as string,
    periodeId: periodeId,
  };

  // 2. 🛡️ SERVER-SIDE CHECK
  // If any field is NaN (hacker tried to bypass), we reject.
  if ([data.u1, data.u2, data.u3, data.u4, data.u5, data.u6, data.u7, data.u8, data.u9].some(isNaN)) {
    throw new Error("Invalid Input: All 9 indicators must be filled.");
  }

  // 3. 💾 ATOMIC SAVE
  // No complex math here. The math happens in the "Report" phase (Aggregate).
  await prisma.respon.create({
    data: data
  });

  // 4. 🎉 REDIRECT
  redirect("/success");
}