import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { calcWeightedIkm } from "@/lib/fingerprint";

/* ── IKM category labels (mirrors DashboardCharts.tsx logic) ── */
function ikmCategory(ikm: number): string {
  if (ikm >= 88.31) return "Sangat Baik";
  if (ikm >= 76.61) return "Baik";
  if (ikm >= 65.00) return "Kurang Baik";
  return "Tidak Baik";
}

/**
 * GET /api/public/ikm
 *
 * Public (no auth) endpoint that returns aggregate IKM scores for the
 * currently active survey period. Only returns anonymised statistics —
 * no personal data is exposed.
 */
export async function GET() {
  try {
    const aktivePeriode = await prisma.periode.findFirst({
      where:  { status: "AKTIF" },
      select: { id: true },
    });

    if (!aktivePeriode) {
      return NextResponse.json({ active: false, overall: 0, services: [] });
    }

    const responses = await prisma.respon.findMany({
      where:  { periodeId: aktivePeriode.id },
      select: {
        u1: true, u2: true, u3: true, u4: true, u5: true,
        u6: true, u7: true, u8: true, u9: true,
        weight: true, responStatus: true,
        layanan: { select: { nama: true } },
      },
    });

    if (responses.length === 0) {
      return NextResponse.json({ active: true, overall: 0, services: [] });
    }

    /* ── Overall IKM (weighted) ──────────────────── */
    const overallIkm = parseFloat(calcWeightedIkm(responses as any).toFixed(1));

    /* ── Per-layanan IKM → top 5 (weighted) ─────── */
    const byService: Record<string, { respon: typeof responses }> = {};

    for (const r of responses) {
      const nama = r.layanan.nama;
      if (!byService[nama]) byService[nama] = { respon: [] };
      byService[nama].respon.push(r);
    }

    const services = Object.entries(byService)
      .map(([nama, { respon }]) => ({
        nama,
        count: respon.length,
        ikm:   parseFloat(calcWeightedIkm(respon as any).toFixed(1)),
      }))
      .sort((a, b) => b.ikm - a.ikm)
      .slice(0, 5)
      .map(s => ({ ...s, category: ikmCategory(s.ikm) }));

    return NextResponse.json({
      active:   true,
      overall:  overallIkm,
      category: ikmCategory(overallIkm),
      services,
    });

  } catch (err) {
    console.error("[/api/public/ikm] error:", err);
    return NextResponse.json({ active: false, overall: 0, services: [] }, { status: 500 });
  }
}
