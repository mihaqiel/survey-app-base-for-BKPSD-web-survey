// app/action/submit.ts
"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { sendEmail } from "@/lib/email";
import { unblockRequestTemplate } from "@/lib/email-templates";
import { getSubmitLimiter } from "@/lib/ratelimit";

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

  // 0. Rate limit: 30 submissions per hour per IP
  const { success: allowed } = await getSubmitLimiter().limit(ip);
  if (!allowed) redirect("/blocked?reason=ratelimit");

  // 1. Check if IP is manually blocked in DB
  const blockedIp = await prisma.blockedIp.findUnique({
    where: { ip },
    select: { id: true },
  });
  if (blockedIp) {
    redirect(`/blocked?reason=manual&ip=${encodeURIComponent(ip)}`);
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
  const tglLayananStr = formData.get("tglLayanan") as string;

  if (!layananId || !pegawaiId || !tglLayananStr) {
    throw new Error("Kolom wajib tidak lengkap.");
  }

  // 5. Parse and validate fields
  const clamp = (s: FormDataEntryValue | null, max: number) =>
    ((s as string)?.trim() ?? "").slice(0, max);

  const nama = clamp(formData.get("nama"), 100);
  if (!nama) throw new Error("Nama tidak boleh kosong.");

  const validateScore = (key: string): number => {
    const val = parseInt(formData.get(key) as string);
    if (isNaN(val) || val < 1 || val > 4) throw new Error(`${key} harus antara 1-4`);
    return val;
  };

  const getOptionalInt = (key: string): number | null => {
    const val = parseInt(formData.get(key) as string);
    return isNaN(val) ? null : val;
  };

  const usia = parseInt(formData.get("usia") as string);
  if (isNaN(usia) || usia < 1 || usia > 120) throw new Error("Usia tidak valid.");

  let pekerjaan = formData.get("pekerjaan") as string;
  if (pekerjaan === "Lainnya") {
    const custom = clamp(formData.get("pekerjaan_custom"), 100);
    if (!custom) throw new Error("Isian pekerjaan wajib diisi.");
    pekerjaan = custom;
  }

  const isDifabel        = formData.get("isDifabel") as string;
  const jenisDisabilitas = isDifabel === "Ya"
    ? clamp(formData.get("jenisDisabilitas"), 100) || null
    : null;

  const rating = getOptionalInt("rating");
  const saran  = clamp(formData.get("saran"), 1000) || null;

  // 6. Save to database
  let u1: number, u2: number, u3: number, u4: number, u5: number,
      u6: number, u7: number, u8: number, u9: number;
  try {
    u1 = validateScore("u1"); u2 = validateScore("u2"); u3 = validateScore("u3");
    u4 = validateScore("u4"); u5 = validateScore("u5"); u6 = validateScore("u6");
    u7 = validateScore("u7"); u8 = validateScore("u8"); u9 = validateScore("u9");
  } catch {
    throw new Error("Semua nilai penilaian harus diisi dengan angka 1-4.");
  }

  await prisma.respon.create({
    data: {
      periodeId:  activePeriod.id,
      layananId,
      pegawaiId,
      nama,
      tglLayanan:       new Date(tglLayananStr),
      usia,
      jenisKelamin:     clamp(formData.get("jenisKelamin"), 50),
      pendidikan:       clamp(formData.get("pendidikan"), 50),
      pekerjaan,
      isDifabel,
      jenisDisabilitas,
      u1, u2, u3, u4, u5, u6, u7, u8, u9,
      rating,
      saran,
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

  // Fire-and-forget unblock request notification to admin
  if (process.env.ADMIN_EMAIL) {
    const requestedAt = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
    const { subject, html } = unblockRequestTemplate({
      ip,
      message,
      userEmail: email || undefined,
      requestedAt,
    });
    void sendEmail({ to: process.env.ADMIN_EMAIL, subject, html });
  }

  return { ok: true };
}