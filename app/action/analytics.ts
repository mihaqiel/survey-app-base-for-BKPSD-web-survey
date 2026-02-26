"use server";

import { prisma } from "@/lib/prisma";

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
    select: { u1:true, u2:true, u3:true, u4:true, u5:true, u6:true, u7:true, u8:true, u9:true }
  });

  const totalRespon = responses.length;

  let totalScore = 0;
  responses.forEach((r: { u1:number; u2:number; u3:number; u4:number; u5:number; u6:number; u7:number; u8:number; u9:number }) => {
    totalScore += (r.u1+r.u2+r.u3+r.u4+r.u5+r.u6+r.u7+r.u8+r.u9);
  });

  const currentNRR = totalRespon > 0 ? totalScore / (9 * totalRespon) : 0;
  const currentIKM = currentNRR * 25;

  const currentPeriodDef = await prisma.periode.findUnique({ where: { id: periodeId } });

  let prevIKM = 0;
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
        select: { u1:true, u2:true, u3:true, u4:true, u5:true, u6:true, u7:true, u8:true, u9:true }
      });

      if (prevResponses.length > 0) {
        let prevTotal = 0;
        prevResponses.forEach((r: { u1:number; u2:number; u3:number; u4:number; u5:number; u6:number; u7:number; u8:number; u9:number }) => {
          prevTotal += (r.u1+r.u2+r.u3+r.u4+r.u5+r.u6+r.u7+r.u8+r.u9);
        });
        const prevNRR = prevTotal / (9 * prevResponses.length);
        prevIKM = prevNRR * 25;
        comparison = ((currentIKM - prevIKM) / prevIKM) * 100;
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
    select: { u1:true, u2:true, u3:true, u4:true, u5:true, u6:true, u7:true, u8:true, u9:true }
  });

  const count = responses.length;
  if (count === 0) return [];

  const sums = [0,0,0,0,0,0,0,0,0];
  responses.forEach((r: { u1:number; u2:number; u3:number; u4:number; u5:number; u6:number; u7:number; u8:number; u9:number }) => {
    sums[0] += r.u1; sums[1] += r.u2; sums[2] += r.u3;
    sums[3] += r.u4; sums[4] += r.u5; sums[5] += r.u6;
    sums[6] += r.u7; sums[7] += r.u8; sums[8] += r.u9;
  });

  const labels = [
    "Persyaratan", "Prosedur", "Waktu",
    "Biaya/Tarif", "Produk", "Kompetensi",
    "Perilaku", "Penanganan", "Sarana"
  ];

  return labels.map((label, idx) => ({
    label: `U${idx+1}`,
    tooltip: label,
    value: parseFloat((sums[idx] / count).toFixed(2)),
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