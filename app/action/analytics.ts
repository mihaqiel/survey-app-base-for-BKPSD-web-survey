"use server";

import { prisma } from "@/lib/prisma";
import { calcWeightedIkm } from "@/lib/fingerprint";

// Helper to construct the database filter
const getWhereClause = (periodeId: string, layananId?: string) => {
  return {
    periodeId,
    ...(layananId ? { layananId } : {})
  };
};

// 📊 1. EXECUTIVE OVERVIEW
export async function getAnalyticsOverview(periodeId: string, layananId?: string) {
  const responses = await prisma.respon.findMany({
    where: getWhereClause(periodeId, layananId),
    select: {
      u1:true, u2:true, u3:true, u4:true, u5:true,
      u6:true, u7:true, u8:true, u9:true,
      weight: true, responStatus: true,
    }
  });

  const totalRespon  = responses.length;
  const currentIKM   = totalRespon > 0 ? calcWeightedIkm(responses as any) : 0;
  // NRR = IKM / 25 (the Nilai Rata-Rata on the 1-4 scale)
  const currentNRR   = currentIKM / 25;

  const currentPeriodDef = await prisma.periode.findUnique({ where: { id: periodeId } });

  let prevIKM  = 0;
  let comparison = 0;
  let hasPrevious = false;

  if (currentPeriodDef) {
    const prevPeriod = await prisma.periode.findFirst({
      where: {
        createdAt: { lt: currentPeriodDef.createdAt },
        respon: { some: {} }
      },
      orderBy: { createdAt: "desc" }
    });

    if (prevPeriod) {
      hasPrevious = true;
      const prevResponses = await prisma.respon.findMany({
        where: getWhereClause(prevPeriod.id, layananId),
        select: {
          u1:true, u2:true, u3:true, u4:true, u5:true,
          u6:true, u7:true, u8:true, u9:true,
          weight: true, responStatus: true,
        }
      });

      if (prevResponses.length > 0) {
        prevIKM  = calcWeightedIkm(prevResponses as any);
        comparison = prevIKM > 0 ? ((currentIKM - prevIKM) / prevIKM) * 100 : 0;
      }
    }
  }

  return {
    totalRespon,
    ikm: currentIKM.toFixed(2),
    nrr: currentNRR.toFixed(3),
    comparison: comparison.toFixed(1),
    hasPrevious
  };
}

// 📊 2. QUESTION DISTRIBUTION
export async function getQuestionDistribution(periodeId: string, layananId?: string) {
  const responses = await prisma.respon.findMany({
    where: getWhereClause(periodeId, layananId),
    select: {
      u1:true, u2:true, u3:true, u4:true, u5:true,
      u6:true, u7:true, u8:true, u9:true,
      weight: true,
    }
  });

  if (responses.length === 0) return [];

  // Weighted per-unsur average (same scale as scores: 1.0–4.0)
  const totalWeight = responses.reduce((s: number, r: any) => s + (r.weight ?? 1.0), 0);
  const keys = ["u1","u2","u3","u4","u5","u6","u7","u8","u9"] as const;
  const weightedAvg = keys.map(k =>
    totalWeight > 0
      ? parseFloat((responses.reduce((s: number, r: any) => s + (r.weight ?? 1.0) * r[k], 0) / totalWeight).toFixed(2))
      : 0
  );

  const labels = [
    "Persyaratan", "Prosedur", "Waktu",
    "Biaya/Tarif", "Produk", "Kompetensi",
    "Perilaku", "Penanganan", "Sarana"
  ];

  return labels.map((label, idx) => ({
    label: `U${idx+1}`,
    tooltip: label,
    value: weightedAvg[idx],
    code: `U${idx+1}`
  }));
}

// 📊 3. TREND ANALYSIS
export async function getTrendData(periodeId: string, layananId?: string) {
  const responses = await prisma.respon.findMany({
    where: getWhereClause(periodeId, layananId),
    select: { createdAt: true },
    orderBy: { createdAt: "asc" }
  });

  const grouped = new Map<string, number>();
  responses.forEach((r: { createdAt: Date }) => {
    const dateKey = r.createdAt.toISOString().split('T')[0];
    grouped.set(dateKey, (grouped.get(dateKey) || 0) + 1);
  });

  return Array.from(grouped.entries()).map(([date, count]) => ({ date, count }));
}

// 📊 4. SATISFACTION COMPOSITION
export async function getSatisfactionComposition(periodeId: string, layananId?: string) {
  const responses = await prisma.respon.findMany({
    where: getWhereClause(periodeId, layananId),
    select: { u1:true, u2:true, u3:true, u4:true, u5:true, u6:true, u7:true, u8:true, u9:true }
  });

  const counts = { sangatBaik: 0, baik: 0, kurang: 0, buruk: 0 };

  responses.forEach((r: { u1:number; u2:number; u3:number; u4:number; u5:number; u6:number; u7:number; u8:number; u9:number }) => {
    const total = r.u1+r.u2+r.u3+r.u4+r.u5+r.u6+r.u7+r.u8+r.u9;
    const avg = total / 9;
    if (avg >= 3.5) counts.sangatBaik++;
    else if (avg >= 2.6) counts.baik++;
    else if (avg >= 1.6) counts.kurang++;
    else counts.buruk++;
  });

  return [
    { name: "Sangat Baik (A)", value: counts.sangatBaik, fill: "#22c55e" },
    { name: "Baik (B)", value: counts.baik, fill: "#3b82f6" },
    { name: "Kurang Baik (C)", value: counts.kurang, fill: "#eab308" },
    { name: "Tidak Baik (D)", value: counts.buruk, fill: "#ef4444" }
  ];
}

// 📊 5. DEMOGRAPHIC STATS
export async function getDemographicStats(periodeId: string, layananId?: string) {
  const responses = await prisma.respon.findMany({
    where: getWhereClause(periodeId, layananId),
    select: { jenisKelamin: true, pendidikan: true, pekerjaan: true, isDifabel: true }
  });

  type ResponRow = typeof responses[0];

  const groupBy = (key: keyof ResponRow) => {
    const counts: Record<string, number> = {};
    responses.forEach((r: ResponRow) => {
      const val = (r[key] as string) || "Unknown";
      counts[val] = (counts[val] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  };

  return {
    gender: groupBy("jenisKelamin"),
    education: groupBy("pendidikan"),
    job: groupBy("pekerjaan"),
    disability: groupBy("isDifabel")
  };
}