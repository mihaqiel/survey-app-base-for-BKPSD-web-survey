"use server";

import { prisma } from "@/lib/prisma";

// 📊 1. EXECUTIVE OVERVIEW (METRICS & COMPARISON)
// Reference: Section 4.1 & 4.5
export async function getAnalyticsOverview(periodeId: string) {
  // A. Fetch Current Period Data
  const currentPeriod = await prisma.periode.findUnique({
    where: { id: periodeId },
    include: { 
      respon: { select: { u1:true, u2:true, u3:true, u4:true, u5:true, u6:true, u7:true, u8:true, u9:true } } 
    }
  });

  if (!currentPeriod) return null;

  const totalRespon = currentPeriod.respon.length;
  
  // Calculate Current NRR & IKM
  let totalScore = 0;
  currentPeriod.respon.forEach(r => {
    totalScore += (r.u1+r.u2+r.u3+r.u4+r.u5+r.u6+r.u7+r.u8+r.u9);
  });

  // Formula: Sum / (9 questions * respondents)
  const currentNRR = totalRespon > 0 ? totalScore / (9 * totalRespon) : 0;
  const currentIKM = currentNRR * 25; // Scale 1-4 conversion

  // B. Fetch Previous Period (For Comparison)
  // Logic: Find period with same Service ID, but older Start Date
  const prevPeriod = await prisma.periode.findFirst({
    where: {
      layananId: currentPeriod.layananId,
      tglMulai: { lt: currentPeriod.tglMulai }, // "Less Than" current start date
      respon: { some: {} } // Must have data
    },
    orderBy: { tglMulai: "desc" }, // Get the closest one
    include: { respon: true }
  });

  // Calculate Previous IKM (if exists)
  let prevIKM = 0;
  let comparison = 0; // % Change

  if (prevPeriod && prevPeriod.respon.length > 0) {
    let prevTotal = 0;
    prevPeriod.respon.forEach(r => {
      prevTotal += (r.u1+r.u2+r.u3+r.u4+r.u5+r.u6+r.u7+r.u8+r.u9);
    });
    const prevNRR = prevTotal / (9 * prevPeriod.respon.length);
    prevIKM = prevNRR * 25;

    // Formula: (Current - Prev) / Prev * 100
    comparison = ((currentIKM - prevIKM) / prevIKM) * 100;
  }

  return {
    totalRespon,
    ikm: currentIKM.toFixed(2),
    nrr: currentNRR.toFixed(3),
    comparison: comparison.toFixed(1), // e.g., "+12.5" or "-5.0"
    hasPrevious: !!prevPeriod
  };
}


// 📊 2. QUESTION DISTRIBUTION (WEAKEST LINK ANALYSIS)
// Reference: Section 4.2
export async function getQuestionDistribution(periodeId: string) {
  const responses = await prisma.respon.findMany({
    where: { periodeId },
    select: { u1:true, u2:true, u3:true, u4:true, u5:true, u6:true, u7:true, u8:true, u9:true }
  });

  const count = responses.length;
  if (count === 0) return [];

  // Initialize Sums
  const sums = [0,0,0,0,0,0,0,0,0];

  // Aggregate
  responses.forEach(r => {
    sums[0] += r.u1; sums[1] += r.u2; sums[2] += r.u3;
    sums[3] += r.u4; sums[4] += r.u5; sums[5] += r.u6;
    sums[6] += r.u7; sums[7] += r.u8; sums[8] += r.u9;
  });

  // Labels from Permenpan RB
  const labels = [
    "Persyaratan", "Prosedur", "Waktu", 
    "Biaya/Tarif", "Produk", "Kompetensi", 
    "Perilaku", "Penanganan", "Sarana"
  ];

  // Map to Chart Format
  const data = labels.map((label, idx) => ({
    label: `U${idx+1} - ${label}`,
    value: parseFloat((sums[idx] / count).toFixed(2)), // Average per Question
    code: `U${idx+1}`
  }));

  // Return sorted to help find "Weakest Links" easily
  return data;
}


// 📊 3. TREND ANALYSIS (DAILY SUBMISSIONS)
// Reference: Section 4.3
export async function getTrendData(periodeId: string) {
  // Optimized: Only fetch dates, not full records
  const responses = await prisma.respon.findMany({
    where: { periodeId },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" }
  });

  // Group by Date (JS Map for performance)
  const grouped = new Map<string, number>();

  responses.forEach(r => {
    // Format: YYYY-MM-DD
    const dateKey = r.createdAt.toISOString().split('T')[0];
    grouped.set(dateKey, (grouped.get(dateKey) || 0) + 1);
  });

  // Convert Map to Array for Recharts
  const chartData = Array.from(grouped.entries()).map(([date, count]) => ({
    date,
    count
  }));

  return chartData;
}


// 📊 4. SATISFACTION COMPOSITION (PIE CHART)
// Reference: Section 4.4
export async function getSatisfactionComposition(periodeId: string) {
  const responses = await prisma.respon.findMany({
    where: { periodeId },
    select: { u1:true, u2:true, u3:true, u4:true, u5:true, u6:true, u7:true, u8:true, u9:true }
  });

  // Counters for 1-4 Scale categories
  let counts = {
    sangatBaik: 0, // 4
    baik: 0,       // 3
    kurang: 0,     // 2
    buruk: 0       // 1
  };

  responses.forEach(r => {
    // Calculate Average for THIS individual respondent
    const total = r.u1+r.u2+r.u3+r.u4+r.u5+r.u6+r.u7+r.u8+r.u9;
    const avg = total / 9;

    // Categorize based on Average
    if (avg >= 3.5) counts.sangatBaik++;
    else if (avg >= 2.6) counts.baik++;
    else if (avg >= 1.6) counts.kurang++;
    else counts.buruk++;
  });

  return [
    { name: "Sangat Baik (A)", value: counts.sangatBaik, fill: "#22c55e" }, // Green
    { name: "Baik (B)", value: counts.baik, fill: "#3b82f6" },             // Blue
    { name: "Kurang Baik (C)", value: counts.kurang, fill: "#eab308" },    // Yellow
    { name: "Tidak Baik (D)", value: counts.buruk, fill: "#ef4444" }       // Red
  ];
}