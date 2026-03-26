// app/action/anomaly.ts
"use server";

import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/app/action/auth";

export interface TopFingerprint {
  hash: string;
  count: number;
  periods: number;
  services: number;
}

export interface ServiceAnomalyRate {
  service: string;
  normal: number;
  suspicious: number;
  low_quality: number;
  spam: number;
  total: number;
  anomalyPct: number;
}

export interface WeeklyQualityPoint {
  week: string;        // "2026-W12"
  weekLabel: string;   // "12 Mar"
  totalCount: number;
  suspiciousCount: number;
  rate: number;        // 0.0–1.0
}

export interface AnomalyStats {
  topFingerprints: TopFingerprint[];
  serviceAnomalyRates: ServiceAnomalyRate[];
  weeklyQualityTrend: WeeklyQualityPoint[];
  totalFlagged: number;
  totalResponden: number;
}

export async function getAnomalyStats(): Promise<AnomalyStats | { error: string }> {
  if (!(await isAdmin())) {
    return { error: "Tidak terautentikasi." };
  }

  // ── Top fingerprints ────────────────────────────────────────────────────
  // Group responses by fingerprintHash, count unique periods and services
  const fpRaw = await prisma.respon.groupBy({
    by: ["fingerprintHash"],
    where: { fingerprintHash: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 20,
  });

  const topFingerprints: TopFingerprint[] = await Promise.all(
    fpRaw
      .filter(r => r.fingerprintHash !== null)
      .map(async r => {
        const hash = r.fingerprintHash as string;
        const [distinctPeriods, distinctServices] = await Promise.all([
          prisma.respon.findMany({
            where: { fingerprintHash: hash },
            select: { periodeId: true },
            distinct: ["periodeId"],
          }),
          prisma.respon.findMany({
            where: { fingerprintHash: hash },
            select: { layananId: true },
            distinct: ["layananId"],
          }),
        ]);
        return {
          hash,
          count:    r._count.id,
          periods:  distinctPeriods.length,
          services: distinctServices.length,
        };
      })
  );

  // ── Service anomaly rates ────────────────────────────────────────────────
  const allRespon = await prisma.respon.findMany({
    select: {
      responStatus: true,
      layanan: { select: { nama: true } },
    },
  });

  const serviceMap = new Map<string, { normal: number; suspicious: number; low_quality: number; spam: number }>();
  for (const r of allRespon) {
    const nama = r.layanan.nama;
    if (!serviceMap.has(nama)) {
      serviceMap.set(nama, { normal: 0, suspicious: 0, low_quality: 0, spam: 0 });
    }
    const bucket = serviceMap.get(nama)!;
    if (r.responStatus === "normal")      bucket.normal++;
    else if (r.responStatus === "suspicious") bucket.suspicious++;
    else if (r.responStatus === "low_quality") bucket.low_quality++;
    else if (r.responStatus === "spam")   bucket.spam++;
  }

  const serviceAnomalyRates: ServiceAnomalyRate[] = Array.from(serviceMap.entries())
    .map(([service, counts]) => {
      const total     = counts.normal + counts.suspicious + counts.low_quality + counts.spam;
      const anomaly   = counts.suspicious + counts.low_quality + counts.spam;
      return {
        service,
        ...counts,
        total,
        anomalyPct: total > 0 ? (anomaly / total) * 100 : 0,
      };
    })
    .sort((a, b) => b.anomalyPct - a.anomalyPct);

  // ── Weekly quality trend (last 12 weeks) ────────────────────────────────
  const twelveWeeksAgo = new Date();
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84); // 12 × 7

  const recentRespon = await prisma.respon.findMany({
    where: { createdAt: { gte: twelveWeeksAgo } },
    select: { createdAt: true, responStatus: true },
    orderBy: { createdAt: "asc" },
  });

  // Build week buckets
  const weekBuckets = new Map<string, { total: number; suspicious: number; firstDate: Date }>();
  for (const r of recentRespon) {
    const d     = new Date(r.createdAt);
    const year  = d.getFullYear();
    // ISO week number
    const jan4  = new Date(year, 0, 4);
    const week  = Math.ceil(((d.getTime() - jan4.getTime()) / 86400000 + jan4.getDay() + 1) / 7);
    const key   = `${year}-W${String(week).padStart(2, "0")}`;
    if (!weekBuckets.has(key)) weekBuckets.set(key, { total: 0, suspicious: 0, firstDate: d });
    const b = weekBuckets.get(key)!;
    b.total++;
    if (r.responStatus !== "normal") b.suspicious++;
  }

  const weeklyQualityTrend: WeeklyQualityPoint[] = Array.from(weekBuckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, b]) => ({
      week,
      weekLabel: b.firstDate.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      totalCount:      b.total,
      suspiciousCount: b.suspicious,
      rate: b.total > 0 ? b.suspicious / b.total : 0,
    }));

  // ── Totals ───────────────────────────────────────────────────────────────
  const totalResponden = allRespon.length;
  const totalFlagged   = allRespon.filter(r => r.responStatus !== "normal").length;

  return {
    topFingerprints,
    serviceAnomalyRates,
    weeklyQualityTrend,
    totalFlagged,
    totalResponden,
  };
}
