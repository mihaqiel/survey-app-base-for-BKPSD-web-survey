// app/action/submit.ts
"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// EMPLOYEE SEARCH
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

// SUBMIT SURVEY
export async function submitSkmResponse(formData: FormData) {
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown";

  const layananId = formData.get("layananId") as string;
  const today = todayWib();

  // 1. Check if IP is manually blocked in DB
  const blockedIp = await prisma.blockedIp.findUnique({
    where: { ip },
    select: { id: true },
  });
  if (blockedIp) {
    redirect("/blocked?reason=manual");
  }

  // 2. Duplicate check: same IP + layanan + today (24h per service)
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
    redirect("/blocked?reason=duplicate");
  }

  // 3. Check active period
  const activePeriod = await prisma.periode.findFirst({
    where: { status: "AKTIF" },
  });
  if (!activePeriod) {
    redirect("/success?status=closed");
  }

  // 4. Validate required fields
  const pegawaiId     = formData.get("pegawaiId") as string;
  const nama          = formData.get("nama") as string;
  const tglLayananStr = formData.get("tglLayanan") as string;

  if (!layananId || !pegawaiId || !nama || !tglLayananStr) {
    throw new Error("Missing required fields");
  }

  // 5. Parse fields
  const getInt = (key: string) => parseInt(formData.get(key) as string) || 0;
  const getOptionalInt = (key: string): number | null => {
    const val = parseInt(formData.get(key) as string);
    return isNaN(val) ? null : val;
  };

  let pekerjaan = formData.get("pekerjaan") as string;
  if (pekerjaan === "Lainnya") {
    const custom = (formData.get("pekerjaan_custom") as string)?.trim();
    if (!custom) throw new Error("Pekerjaan custom is required");
    pekerjaan = custom;
  }

  const isDifabel        = formData.get("isDifabel") as string;
  const jenisDisabilitas = isDifabel === "Ya"
    ? (formData.get("jenisDisabilitas") as string) || null
    : null;

  const rating = getOptionalInt("rating");

  // 6. Save to database
  await prisma.respon.create({
    data: {
      periodeId:  activePeriod.id,
      layananId,
      pegawaiId,
      nama,
      tglLayanan:       new Date(tglLayananStr),
      usia:             getInt("usia"),
      jenisKelamin:     formData.get("jenisKelamin") as string,
      pendidikan:       formData.get("pendidikan") as string,
      pekerjaan,
      isDifabel,
      jenisDisabilitas,
      u1: getInt("u1"), u2: getInt("u2"), u3: getInt("u3"),
      u4: getInt("u4"), u5: getInt("u5"), u6: getInt("u6"),
      u7: getInt("u7"), u8: getInt("u8"), u9: getInt("u9"),
      rating,
      saran:     (formData.get("saran") as string) || null,
      ipAddress: ip,
    },
  });

  redirect("/success?status=success");
}

// SUBMIT UNBLOCK REQUEST
export async function submitUnblockRequest(formData: FormData) {
  const ip      = formData.get("ip") as string;
  const message = formData.get("message") as string;
  const email   = formData.get("email") as string;

  if (!ip || !message) return { error: "IP dan pesan wajib diisi" };

  const blocked = await prisma.blockedIp.findUnique({ where: { ip } });
  if (!blocked) return { error: "IP tidak ditemukan dalam daftar blokir" };

  await prisma.blockedIp.update({
    where: { ip },
    data: {
      message,
      messageAt:    new Date(),
      messageEmail: email || null,
    },
  });

  return { ok: true };
}