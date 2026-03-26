// app/api/admin/report/[periodeId]/pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySessionToken, COOKIE_NAME } from "@/lib/session";
import { calcWeightedIkm } from "@/lib/fingerprint";
import {
  Document, Page, Text, View, StyleSheet, renderToBuffer, Font,
} from "@react-pdf/renderer";
import React from "react";

async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  return await verifySessionToken(c.get(COOKIE_NAME)?.value);
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 40,
    color: "#1e293b",
  },
  // Cover
  coverBox: {
    borderTop: "4px solid #1e40af",
    paddingTop: 24,
    marginBottom: 32,
    alignItems: "center",
  },
  coverTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a8a",
    textAlign: "center",
    marginBottom: 6,
  },
  coverSub: {
    fontSize: 11,
    color: "#475569",
    textAlign: "center",
    marginBottom: 4,
  },
  coverPeriode: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 4,
  },
  coverIkm: {
    fontSize: 36,
    fontFamily: "Helvetica-Bold",
    color: "#1d4ed8",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 4,
  },
  coverIkmLabel: {
    fontSize: 10,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 20,
  },
  divider: {
    borderBottom: "1px solid #e2e8f0",
    marginVertical: 12,
  },
  // Section headers
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#1e3a8a",
    marginBottom: 8,
    marginTop: 16,
    borderBottom: "1px solid #bfdbfe",
    paddingBottom: 4,
  },
  // Table
  table: { width: "100%" },
  tableRow: { flexDirection: "row", borderBottom: "1px solid #f1f5f9" },
  tableRowHeader: { flexDirection: "row", backgroundColor: "#1e3a8a", borderRadius: 2 },
  tableCell: { padding: "5 6", flex: 1, fontSize: 9 },
  tableCellBold: { padding: "5 6", flex: 1, fontSize: 9, fontFamily: "Helvetica-Bold" },
  tableCellHeader: { padding: "5 6", flex: 1, fontSize: 9, fontFamily: "Helvetica-Bold", color: "#ffffff" },
  // Quality summary
  qualityRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  qualityCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 4,
    padding: "8 10",
    alignItems: "center",
  },
  qualityValue: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#0f172a" },
  qualityLabel: { fontSize: 8, color: "#64748b", marginTop: 2 },
  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1px solid #e2e8f0",
    paddingTop: 6,
  },
  footerText: { fontSize: 8, color: "#94a3b8" },
});

// ── IKM category label ────────────────────────────────────────────────────────

function ikmCategory(ikm: number): string {
  if (ikm >= 88.31) return "A (Sangat Baik)";
  if (ikm >= 76.61) return "B (Baik)";
  if (ikm >= 65.00) return "C (Kurang Baik)";
  return "D (Tidak Baik)";
}

const UNSUR_LABELS = [
  "U1 – Persyaratan",
  "U2 – Sistem, Mekanisme & Prosedur",
  "U3 – Waktu Penyelesaian",
  "U4 – Biaya/Tarif",
  "U5 – Produk Spesifikasi Jenis Pelayanan",
  "U6 – Kompetensi Pelaksana",
  "U7 – Perilaku Pelaksana",
  "U8 – Penanganan Pengaduan, Saran & Masukan",
  "U9 – Sarana & Prasarana",
];

// ── PDF Document component ────────────────────────────────────────────────────

function IkmReport({
  periode,
  overallIkm,
  totalResponden,
  perLayanan,
  perUnsur,
  qualitySummary,
  exportedAt,
}: {
  periode: { label: string; status: string };
  overallIkm: number;
  totalResponden: number;
  perLayanan: Array<{ nama: string; ikm: number; count: number }>;
  perUnsur: Array<{ label: string; avg: number }>;
  qualitySummary: { normal: number; suspicious: number; low_quality: number; spam: number };
  exportedAt: string;
}) {
  return React.createElement(
    Document,
    { title: `Laporan IKM — ${periode.label}` },
    React.createElement(
      Page,
      { size: "A4", style: styles.page },

      // ── Cover ──
      React.createElement(View, { style: styles.coverBox },
        React.createElement(Text, { style: styles.coverTitle }, "LAPORAN INDEKS KEPUASAN MASYARAKAT"),
        React.createElement(Text, { style: styles.coverSub }, "Berdasarkan Permenpan RB Nomor 14 Tahun 2017"),
        React.createElement(Text, { style: styles.coverSub }, "BKPSDM Kabupaten Kepulauan Anambas"),
        React.createElement(View, { style: styles.divider }),
        React.createElement(Text, { style: styles.coverPeriode }, periode.label),
        React.createElement(Text, { style: styles.coverSub }, `Diekspor: ${exportedAt}`),
        React.createElement(Text, { style: styles.coverIkm }, overallIkm.toFixed(2)),
        React.createElement(Text, { style: styles.coverIkmLabel },
          `Nilai IKM Terbobot — ${ikmCategory(overallIkm)}`
        ),
        React.createElement(Text, { style: { fontSize: 9, color: "#64748b", textAlign: "center" } },
          `Total Responden: ${totalResponden}`
        ),
      ),

      // ── Per-Layanan ──
      React.createElement(Text, { style: styles.sectionTitle }, "1. Nilai IKM per Layanan (Terbobot)"),
      React.createElement(View, { style: styles.table },
        React.createElement(View, { style: styles.tableRowHeader },
          React.createElement(Text, { style: { ...styles.tableCellHeader, flex: 3 } }, "Nama Layanan"),
          React.createElement(Text, { style: { ...styles.tableCellHeader, flex: 1 } }, "Responden"),
          React.createElement(Text, { style: { ...styles.tableCellHeader, flex: 1 } }, "IKM"),
          React.createElement(Text, { style: { ...styles.tableCellHeader, flex: 1.5 } }, "Kategori"),
        ),
        ...perLayanan
          .sort((a, b) => b.ikm - a.ikm)
          .map((l, i) =>
            React.createElement(View, { key: l.nama, style: { ...styles.tableRow, backgroundColor: i % 2 === 0 ? "#f8fafc" : "#ffffff" } },
              React.createElement(Text, { style: { ...styles.tableCell, flex: 3 } }, l.nama),
              React.createElement(Text, { style: styles.tableCell }, String(l.count)),
              React.createElement(Text, { style: { ...styles.tableCellBold } }, l.ikm.toFixed(2)),
              React.createElement(Text, { style: { ...styles.tableCell, flex: 1.5 } }, ikmCategory(l.ikm)),
            )
          ),
      ),

      // ── Per-Unsur ──
      React.createElement(Text, { style: styles.sectionTitle }, "2. Rata-Rata per Unsur Pelayanan"),
      React.createElement(View, { style: styles.table },
        React.createElement(View, { style: styles.tableRowHeader },
          React.createElement(Text, { style: { ...styles.tableCellHeader, flex: 4 } }, "Unsur Pelayanan"),
          React.createElement(Text, { style: { ...styles.tableCellHeader, flex: 1 } }, "Rata-Rata"),
        ),
        ...perUnsur.map((u, i) =>
          React.createElement(View, { key: u.label, style: { ...styles.tableRow, backgroundColor: i % 2 === 0 ? "#f8fafc" : "#ffffff" } },
            React.createElement(Text, { style: { ...styles.tableCell, flex: 4 } }, u.label),
            React.createElement(Text, { style: styles.tableCellBold }, u.avg.toFixed(2)),
          )
        ),
      ),

      // ── Quality Summary ──
      React.createElement(Text, { style: styles.sectionTitle }, "3. Ringkasan Kualitas Data"),
      React.createElement(View, { style: styles.qualityRow },
        React.createElement(View, { style: styles.qualityCard },
          React.createElement(Text, { style: { ...styles.qualityValue, color: "#15803d" } }, String(qualitySummary.normal)),
          React.createElement(Text, { style: styles.qualityLabel }, "Valid"),
        ),
        React.createElement(View, { style: styles.qualityCard },
          React.createElement(Text, { style: { ...styles.qualityValue, color: "#b45309" } }, String(qualitySummary.suspicious)),
          React.createElement(Text, { style: styles.qualityLabel }, "Mencurigakan"),
        ),
        React.createElement(View, { style: styles.qualityCard },
          React.createElement(Text, { style: { ...styles.qualityValue, color: "#b91c1c" } }, String(qualitySummary.low_quality)),
          React.createElement(Text, { style: styles.qualityLabel }, "Kualitas Rendah"),
        ),
        React.createElement(View, { style: styles.qualityCard },
          React.createElement(Text, { style: { ...styles.qualityValue, color: "#475569" } }, String(qualitySummary.spam)),
          React.createElement(Text, { style: styles.qualityLabel }, "Spam"),
        ),
      ),

      // ── Footer ──
      React.createElement(View, { style: styles.footer, fixed: true },
        React.createElement(Text, { style: styles.footerText }, "Permenpan RB No. 14 Tahun 2017 — BKPSDM Kabupaten Kepulauan Anambas"),
        React.createElement(Text, {
          style: styles.footerText,
          render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Halaman ${pageNumber} / ${totalPages}`,
        }),
      ),
    )
  );
}

// ── Route Handler ─────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ periodeId: string }> },
): Promise<Response> {
  if (!await isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { periodeId } = await params;

  // Fetch periode
  const periode = await prisma.periode.findUnique({
    where: { id: periodeId },
    select: { id: true, label: true, status: true },
  });
  if (!periode) {
    return NextResponse.json({ error: "Periode tidak ditemukan." }, { status: 404 });
  }

  // Fetch all responses for this periode with weights
  const responses = await prisma.respon.findMany({
    where: { periodeId },
    select: {
      u1: true, u2: true, u3: true, u4: true, u5: true,
      u6: true, u7: true, u8: true, u9: true,
      weight: true,
      responStatus: true,
      layanan: { select: { nama: true } },
    },
  });

  // Overall IKM
  const overallIkm = calcWeightedIkm(responses as any);
  const totalResponden = responses.length;

  // Per-layanan IKM
  const layananMap = new Map<string, typeof responses>();
  for (const r of responses) {
    const nama = r.layanan.nama;
    if (!layananMap.has(nama)) layananMap.set(nama, []);
    layananMap.get(nama)!.push(r);
  }
  const perLayanan = Array.from(layananMap.entries()).map(([nama, resps]) => ({
    nama,
    ikm: calcWeightedIkm(resps as any),
    count: resps.length,
  }));

  // Per-unsur weighted averages
  const UNSURS = ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8", "u9"] as const;
  const perUnsur = UNSURS.map((key, i) => {
    let weightedSum = 0;
    let totalWeight = 0;
    for (const r of responses) {
      const w = (r as any).weight ?? 1;
      weightedSum += w * (r as any)[key];
      totalWeight += w;
    }
    return {
      label: UNSUR_LABELS[i],
      avg: totalWeight > 0 ? weightedSum / totalWeight : 0,
    };
  });

  // Quality summary
  const qualitySummary = {
    normal:      responses.filter(r => r.responStatus === "normal").length,
    suspicious:  responses.filter(r => r.responStatus === "suspicious").length,
    low_quality: responses.filter(r => r.responStatus === "low_quality").length,
    spam:        responses.filter(r => r.responStatus === "spam").length,
  };

  const exportedAt = new Date().toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  // Generate PDF
  const element = IkmReport({
    periode,
    overallIkm,
    totalResponden,
    perLayanan,
    perUnsur,
    qualitySummary,
    exportedAt,
  });

  const pdfBuffer = await renderToBuffer(element);
  // Convert Node.js Buffer to Uint8Array for the Web Response API
  const pdfBytes  = new Uint8Array(pdfBuffer);

  const filename = `Laporan-IKM-${periode.label.replace(/\s+/g, "-")}.pdf`;

  return new Response(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
