// app/api/pegawai/[id]/detail/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySessionToken, COOKIE_NAME } from "@/lib/session";

async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  return await verifySessionToken(c.get(COOKIE_NAME)?.value);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  if (!await isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const pegawai = await prisma.pegawai.findUnique({ where: { id } });
  if (!pegawai) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const responses = await prisma.respon.findMany({
    where: { pegawaiId: id },
    include: { layanan: { select: { id: true, nama: true } } },
    orderBy: { createdAt: "desc" },
  });

  // ── Overall IKM ─────────────────────────────────────────────────────────
  const totalSurveys = responses.length;
  let overallIkm = 0;
  if (totalSurveys > 0) {
    const totalScore = responses.reduce((acc: number, r: typeof responses[0]) =>
      acc + r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9, 0);
    overallIkm = parseFloat(((totalScore / (9 * totalSurveys)) * 25).toFixed(1));
  }

  // ── Per-layanan stats ────────────────────────────────────────────────────
  const layananMap = new Map<string, { nama: string; scores: number[]; count: number }>();
  responses.forEach((r: typeof responses[0]) => {
    const lid = r.layananId;
    const existing = layananMap.get(lid) ?? { nama: r.layanan.nama, scores: [] as number[], count: 0 };
    const avg = (r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9) / 9;
    existing.scores.push(avg);
    existing.count++;
    layananMap.set(lid, existing);
  });

  const layananStats = Array.from(layananMap.entries()).map(([layananId, v]) => {
    const avgScore = v.scores.reduce((a, b) => a + b, 0) / v.scores.length;
    return {
      layananId,
      layananNama: v.nama,
      count: v.count,
      ikm: parseFloat((avgScore * 25).toFixed(1)),
    };
  }).sort((a, b) => b.count - a.count);

  // ── Respondent list ──────────────────────────────────────────────────────
  const respondents = responses.map((r: typeof responses[0]) => {
    const avg = (r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9) / 9;
    const ikm = parseFloat((avg * 25).toFixed(1));
    const tglLayanan = r.tglLayanan
      ? new Date(r.tglLayanan).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
      : new Date(r.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    return {
      id: r.id,
      nama: r.nama,
      layananNama: r.layanan.nama,
      tglLayanan,
      ikm,
      saran: r.saran,
    };
  });

  return NextResponse.json({
    id: pegawai.id,
    nama: pegawai.nama,
    totalSurveys,
    ikm: overallIkm,
    layananStats,
    respondents,
  });
}
