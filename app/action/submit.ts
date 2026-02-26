// app/action/submit.ts
"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// 🔍 EMPLOYEE SEARCH
export async function searchPegawai(query: string) {
  if (!query || query.length < 2) return [];
  return await prisma.pegawai.findMany({
    where: { nama: { contains: query, mode: "insensitive" } },
    take: 10,
    select: { id: true, nama: true },
  });
}

/** Returns today's date as "YYYY-MM-DD" in WIB (UTC+7) */
function todayWib(): string {
  const wib = new Date(Date.now() + 7 * 60 * 60 * 1000);
  return wib.toISOString().split("T")[0];
}

// 💾 SUBMIT SURVEY
export async function submitSkmResponse(formData: FormData) {
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown";

  const layananId = formData.get("layananId") as string;
  const today = todayWib();

  // ── 1. Duplicate check: same IP + layanan + today ────────────────────────
  // Uses the existing `respon` table — no new DB table needed
  const existing = await prisma.respon.findFirst({
    where: {
      ipAddress: ip,
      layananId: layananId,
      tglLayanan: {
        gte: new Date(`${today}T00:00:00+07:00`),
        lte: new Date(`${today}T23:59:59+07:00`),
      },
    },
    select: { id: true },
  });

  if (existing) {
    redirect("/success?status=duplicate");
  }

  // ── 2. Check active period ────────────────────────────────────────────────
  const activePeriod = await prisma.periode.findFirst({
    where: { status: "AKTIF" },
  });
  if (!activePeriod) {
    redirect("/success?status=closed");
  }

  // ── 3. Validate required fields ──────────────────────────────────────────
  const pegawaiId     = formData.get("pegawaiId") as string;
  const nama          = formData.get("nama") as string;
  const tglLayananStr = formData.get("tglLayanan") as string;

  if (!layananId || !pegawaiId || !nama || !tglLayananStr) {
    throw new Error("Missing required fields");
  }

  // ── 4. Parse remaining fields ────────────────────────────────────────────
  const getInt = (key: string) => parseInt(formData.get(key) as string) || 0;

  let pekerjaan = formData.get("pekerjaan") as string;
  if (pekerjaan === "Lainnya") {
    pekerjaan = (formData.get("pekerjaan_custom") as string) || "Lainnya";
  }

  const isDifabel        = formData.get("isDifabel") as string;
  const jenisDisabilitas = isDifabel === "Ya"
    ? (formData.get("jenisDisabilitas") as string)
    : null;

  // ── 5. Save to database ──────────────────────────────────────────────────
  await prisma.respon.create({
    data: {
      periodeId: activePeriod.id,
      layananId,
      pegawaiId,
      nama,
      tglLayanan:        new Date(tglLayananStr),
      usia:              getInt("usia"),
      jenisKelamin:      formData.get("jenisKelamin") as string,
      pendidikan:        formData.get("pendidikan") as string,
      pekerjaan,
      isDifabel,
      jenisDisabilitas,
      u1: getInt("u1"), u2: getInt("u2"), u3: getInt("u3"),
      u4: getInt("u4"), u5: getInt("u5"), u6: getInt("u6"),
      u7: getInt("u7"), u8: getInt("u8"), u9: getInt("u9"),
      saran:     formData.get("saran") as string,
      ipAddress: ip,
    },
  });

  redirect("/success?status=success");
}