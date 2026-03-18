"use server";

import { prisma } from "@/lib/prisma";

type UnsurFields = {
  u1: number; u2: number; u3: number;
  u4: number; u5: number; u6: number;
  u7: number; u8: number; u9: number;
};

type EmployeeStat = {
  id: string;
  nama: string;
  count: number;
  totalWeightedScore: number;
};

// ----------------------------------------------------------------------
// 1. DASHBOARD OVERVIEW
// ----------------------------------------------------------------------
export async function getAdminDashboardStats(periodeId?: string) {
  // Active period for label fallback only — data filter is controlled by periodeId param
  const activePeriod = await prisma.periode.findFirst({ where: { status: "AKTIF" } });

  // Build filter: periodeId provided = filter that period, omitted = all data
  const responFilter: { periodeId?: string } = periodeId ? { periodeId } : {};

  // Resolve display label
  let periodLabel = "Semua Data";
  if (periodeId) {
    const sel = await prisma.periode.findUnique({ where: { id: periodeId }, select: { label: true } });
    periodLabel = sel?.label ?? "Periode Dipilih";
  } else if (activePeriod) {
    periodLabel = `Semua Data · ${activePeriod.label} aktif`;
  }

  const services = await prisma.layanan.findMany({
    orderBy: { nama: "asc" },
    include: {
      respon: {
        where: responFilter,
        select: {
          u1: true, u2: true, u3: true, u4: true, u5: true,
          u6: true, u7: true, u8: true, u9: true,
          createdAt: true, jenisKelamin: true, nama: true,
          pegawaiId: true, tglLayanan: true,
        }
      }
    }
  });

  const totalResponses = services.reduce((acc: number, s: typeof services[0]) => acc + s.respon.length, 0);

  // ── Weekly trend data (last 6 weeks) — works even with 1 month of data
  const now = new Date();
  const weeks: { label: string; start: Date; end: Date }[] = [];
  for (let i = 5; i >= 0; i--) {
    const end = new Date(now);
    end.setDate(now.getDate() - i * 7);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    const label = start.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    weeks.push({ label, start, end });
  }

  const allRespon = await prisma.respon.findMany({
    where: responFilter,
    select: {
      createdAt: true, u1: true, u2: true, u3: true,
      u4: true, u5: true, u6: true, u7: true, u8: true, u9: true,
    }
  });

  const trendData = weeks.map(w => {
    const weekRespon = allRespon.filter((r: { createdAt: Date }) =>
      r.createdAt >= w.start && r.createdAt <= w.end
    );
    const count = weekRespon.length;
    let ikm = 0;
    if (count > 0) {
      const total = weekRespon.reduce((acc: number, r: UnsurFields) =>
        acc + r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9, 0);
      ikm = parseFloat(((total / (9 * count)) * 25).toFixed(2));
    }
    return { label: w.label, ikm, count };
  }).filter(w => w.count > 0);

  // ── Employee stats
  const pegawaiMap = new Map<string, { id: string; nama: string; count: number; totalScore: number }>();
  services.forEach((s: typeof services[0]) => {
    s.respon.forEach((r: any) => {
      if (!r.pegawaiId) return;
      const cur = pegawaiMap.get(r.pegawaiId) || { id: r.pegawaiId, nama: "", count: 0, totalScore: 0 };
      cur.count++;
      cur.totalScore += (r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9);
      pegawaiMap.set(r.pegawaiId, cur);
    });
  });

  const pegawaiIds = Array.from(pegawaiMap.keys());
  const pegawaiRecords = pegawaiIds.length > 0
    ? await prisma.pegawai.findMany({ where: { id: { in: pegawaiIds } }, select: { id: true, nama: true } })
    : [];
  pegawaiRecords.forEach((p: { id: string; nama: string }) => {
    const cur = pegawaiMap.get(p.id);
    if (cur) { cur.nama = p.nama; pegawaiMap.set(p.id, cur); }
  });

  const employees = Array.from(pegawaiMap.values())
    .map(e => ({ id: e.id, nama: e.nama || "Unknown", count: e.count, ikm: parseFloat(((e.totalScore / (9 * e.count)) * 25).toFixed(2)) }))
    .sort((a, b) => b.ikm - a.ikm);

  // ── Recent responses
  const recentRaw = await prisma.respon.findMany({
    where: responFilter,
    include: { layanan: { select: { nama: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const recentResponses = recentRaw.map((r: any) => {
    const avg = (r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9) / 9;
    return {
      id: r.id,
      nama: r.nama,
      layanan: r.layanan?.nama ?? "—",
      tgl: new Date(r.createdAt).toLocaleDateString("id-ID"),
      ikm: parseFloat((avg * 25).toFixed(2)),
    };
  });

  // ── Gender data
  const genderRaw = await prisma.respon.groupBy({
    by: ["jenisKelamin"],
    where: responFilter,
    _count: { id: true },
  });
  const gender = genderRaw.map((g: any) => ({ label: g.jenisKelamin || "Lainnya", count: g._count.id }));

  // ── Date range
  const firstRespon = await prisma.respon.findFirst({
    where: responFilter,
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });
  const lastRespon = await prisma.respon.findFirst({
    where: responFilter,
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  const fmt = (d: Date) => d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  return {
    periodLabel,
    periodStart: firstRespon ? fmt(new Date(firstRespon.createdAt)) : "",
    periodEnd:   lastRespon  ? fmt(new Date(lastRespon.createdAt))  : "",
    totalResponses,
    services: services.map((s: typeof services[0]) => {
      const total = s.respon.length;
      let ikm = 0;
      if (total > 0) {
        const totalScore = s.respon.reduce((acc: number, r: UnsurFields) =>
          acc + r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9, 0);
        ikm = parseFloat(((totalScore / (9 * total)) * 25).toFixed(1));
      }
      return { id: s.id, nama: s.nama, count: total, ikm };
    }),
    trendData,
    employees,
    recentResponses,
    gender,
  };
}

// ----------------------------------------------------------------------
// 2. PORTAL & SERVICE MANAGEMENT
// ----------------------------------------------------------------------
export async function getAllLayanan() {
  return await prisma.layanan.findMany({ orderBy: { nama: "asc" } });
}

// ----------------------------------------------------------------------
// 3. SERVICE DETAIL: EMPLOYEE ANALYTICS
// ----------------------------------------------------------------------
export async function getServiceEmployeeStats(periodeId: string, layananId: string) {
  const responses = await prisma.respon.findMany({
    where: { periodeId, layananId },
    include: { pegawai: true }
  });

  const statsMap = new Map<string, EmployeeStat>();
  responses.forEach((r: typeof responses[0]) => {
    const empId = r.pegawaiId;
    const current: EmployeeStat = statsMap.get(empId) || { id: empId, nama: r.pegawai?.nama || "Unknown", count: 0, totalWeightedScore: 0 };
    current.count += 1;
    current.totalWeightedScore += ((r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9) / 9) * 25;
    statsMap.set(empId, current);
  });

  return Array.from(statsMap.values())
    .map((s: EmployeeStat) => ({ id: s.id, nama: s.nama, count: s.count, ikm: parseFloat((s.totalWeightedScore / s.count).toFixed(2)) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

// ----------------------------------------------------------------------
// 4. EXCEL EXPORT
// ----------------------------------------------------------------------
export async function getGlobalExportData() {
  const activePeriod = await prisma.periode.findFirst({ where: { status: "AKTIF" } });
  if (!activePeriod) return null;

  const services = await prisma.layanan.findMany({
    orderBy: { nama: "asc" },
    include: { respon: { where: { periodeId: activePeriod.id }, include: { pegawai: true } } }
  });

  return {
    periodLabel: activePeriod.label,
    data: services.map((service: typeof services[0]) => ({
      serviceName: service.nama,
      totalRespondents: service.respon.length,
      rawResponses: service.respon.map((r: typeof service.respon[0], i: number) => ({
        No: i + 1,
        Tanggal: r.tglLayanan ? new Date(r.tglLayanan).toLocaleDateString("id-ID") : new Date(r.createdAt).toLocaleDateString("id-ID"),
        Nama: r.nama, Umur: r.usia, JK: r.jenisKelamin,
        Pendidikan: r.pendidikan, Pekerjaan: r.pekerjaan,
        Difabel: r.isDifabel ?? "Tidak", JenisDisabilitas: r.jenisDisabilitas ?? "-",
        Pegawai: r.pegawai?.nama || "-",
        U1: r.u1, U2: r.u2, U3: r.u3, U4: r.u4, U5: r.u5,
        U6: r.u6, U7: r.u7, U8: r.u8, U9: r.u9,
        Saran: r.saran || "-",
      }))
    }))
  };
}

// ----------------------------------------------------------------------
// 5. SERVICE MANAGEMENT (CRUD)
// ----------------------------------------------------------------------
export async function createLayanan(formData: FormData) {
  const nama = formData.get("nama") as string;
  if (!nama) return;
  await prisma.layanan.create({ data: { nama } });
}

export async function updateLayanan(id: string, formData: FormData) {
  const nama     = formData.get("nama") as string;
  const kategori = formData.get("kategori") as string | null;
  if (!nama) return;
  await prisma.layanan.update({
    where: { id },
    data: { nama, kategori: kategori || null },
  });
}

export async function deleteLayanan(id: string) {
  await prisma.layanan.delete({ where: { id } });
}

// ----------------------------------------------------------------------
// 6. EMPLOYEE MANAGEMENT (CRUD)
// ----------------------------------------------------------------------
export async function getAllPegawai() {
  return await prisma.pegawai.findMany({ orderBy: { nama: "asc" } });
}

export async function createPegawai(formData: FormData) {
  const nama = formData.get("nama") as string;
  if (!nama) return;
  await prisma.pegawai.create({ data: { nama } });
}

export async function updatePegawai(id: string, formData: FormData) {
  const nama = formData.get("nama") as string;
  if (!nama) return;
  await prisma.pegawai.update({ where: { id }, data: { nama } });
}

export async function deletePegawai(id: string) {
  await prisma.pegawai.delete({ where: { id } });
}

// ----------------------------------------------------------------------
// 7. LOGOUT
// ----------------------------------------------------------------------
export async function logout() {
  const { cookies } = await import("next/headers");
  const { redirect } = await import("next/navigation");
  const cookieStore = await cookies();
  cookieStore.delete("skm_token");
  redirect("/enter");
}

// ----------------------------------------------------------------------
// 8. ALL PERIODS (for Riwayat tab MultiComboBox)
// ----------------------------------------------------------------------
export async function getAllPeriode() {
  return await prisma.periode.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, label: true, status: true, createdAt: true },
  });
}

// ----------------------------------------------------------------------
// 9. PERIOD COMPARISON DATA (for Riwayat tab chart)
// ----------------------------------------------------------------------
export async function getPeriodeComparisonData(periodeIds: string[]) {
  if (!periodeIds.length) return [];

  const periods = await prisma.periode.findMany({
    where: { id: { in: periodeIds } },
    select: { id: true, label: true },
  });

  const results = await Promise.all(
    periods.map(async (p: typeof periods[0]) => {
      const respon = await prisma.respon.findMany({
        where: { periodeId: p.id },
        select: {
          u1: true, u2: true, u3: true, u4: true, u5: true,
          u6: true, u7: true, u8: true, u9: true,
          createdAt: true,
        },
      });
      const count = respon.length;
      let ikm = 0;
      if (count > 0) {
        const total = respon.reduce((acc: number, r: any) =>
          acc + r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9, 0);
        ikm = parseFloat(((total / (9 * count)) * 25).toFixed(2));
      }
      return { periodeId: p.id, label: p.label, ikm, count };
    })
  );

  return results;
}

// ----------------------------------------------------------------------
// 10. LAYANAN × PERIOD COMPARISON (for Riwayat tab layanan comparison)
// ----------------------------------------------------------------------
export async function getLayananPeriodeComparison(layananId: string, periodeIds: string[]) {
  if (!layananId || !periodeIds.length) return { layananNama: "", data: [] };

  const [layanan, periods] = await Promise.all([
    prisma.layanan.findUnique({ where: { id: layananId }, select: { nama: true } }),
    prisma.periode.findMany({ where: { id: { in: periodeIds } }, select: { id: true, label: true } }),
  ]);

  const data = await Promise.all(
    periods.map(async (p: { id: string; label: string }) => {
      const respon = await prisma.respon.findMany({
        where: { periodeId: p.id, layananId },
        select: { u1: true, u2: true, u3: true, u4: true, u5: true, u6: true, u7: true, u8: true, u9: true },
      });
      const count = respon.length;
      let ikm = 0;
      if (count > 0) {
        const total = respon.reduce((acc: number, r: UnsurFields) =>
          acc + r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9, 0);
        ikm = parseFloat(((total / (9 * count)) * 25).toFixed(2));
      }
      return { periodeId: p.id, label: p.label, ikm, count };
    })
  );

  return { layananNama: layanan?.nama ?? "", data };
}

// ----------------------------------------------------------------------
// 11. LAYANAN DETAIL WITH RESPONDENTS (for Layanan SKM tabs)
// ----------------------------------------------------------------------
export async function getLayananWithRespondents(layananId: string) {
  const activePeriod = await prisma.periode.findFirst({ where: { status: "AKTIF" } });
  const layanan = await prisma.layanan.findUnique({ where: { id: layananId } });
  if (!layanan || !activePeriod) return null;

  const responses = await prisma.respon.findMany({
    where: { layananId, periodeId: activePeriod.id },
    include: { pegawai: { select: { id: true, nama: true } } },
    orderBy: { createdAt: "desc" },
  });

  const total = responses.length;
  const sums  = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  responses.forEach((r: any) => {
    sums[0] += r.u1; sums[1] += r.u2; sums[2] += r.u3;
    sums[3] += r.u4; sums[4] += r.u5; sums[5] += r.u6;
    sums[6] += r.u7; sums[7] += r.u8; sums[8] += r.u9;
  });

  const totalScore = sums.reduce((a, b) => a + b, 0);
  const ikm        = total > 0 ? parseFloat(((totalScore / (9 * total)) * 25).toFixed(2)) : 0;
  const unsurAvg   = sums.map(s => total > 0 ? parseFloat((s / total).toFixed(2)) : 0);

  return {
    layanan,
    activePeriod,
    ikm,
    total,
    unsurAvg,
    responses: responses.map((r: any) => ({
      id:           r.id,
      nama:         r.nama,
      pegawai:      r.pegawai?.nama ?? "—",
      tglLayanan:   new Date(r.tglLayanan).toLocaleDateString("id-ID"),
      jenisKelamin: r.jenisKelamin,
      pendidikan:   r.pendidikan,
      pekerjaan:    r.pekerjaan,
      rating:       r.rating,
      saran:        r.saran,
      ikm:          parseFloat((((r.u1+r.u2+r.u3+r.u4+r.u5+r.u6+r.u7+r.u8+r.u9) / 9) * 25).toFixed(2)),
    })),
  };
}

// ----------------------------------------------------------------------
// 11. PEGAWAI DETAIL (for Data Pegawai tabs)
// ----------------------------------------------------------------------
export async function getPegawaiDetail(pegawaiId: string) {
  const activePeriod = await prisma.periode.findFirst({ where: { status: "AKTIF" } });
  const pegawai = await prisma.pegawai.findUnique({ where: { id: pegawaiId } });
  if (!pegawai) return null;

  if (!activePeriod) return {
    pegawai, activePeriod: null,
    totalSurveys: 0, ikm: 0, avgRating: 0, negFeedback: 0,
    layananStats: [], respondents: [],
  };

  const responses = await prisma.respon.findMany({
    where: { pegawaiId, periodeId: activePeriod.id },
    include: { layanan: { select: { id: true, nama: true } } },
    orderBy: { createdAt: "desc" },
  });

  const total = responses.length;
  let totalScore = 0;
  let ratingSum  = 0;
  let ratingCount = 0;
  let negFeedback = 0;

  const layananMap = new Map<string, { id: string; nama: string; count: number; score: number }>();

  responses.forEach((r: any) => {
    const score = (r.u1+r.u2+r.u3+r.u4+r.u5+r.u6+r.u7+r.u8+r.u9);
    totalScore += score;
    if (r.rating) { ratingSum += r.rating; ratingCount++; }
    const ikmVal = (score / 9) * 25;
    if (ikmVal < 65) negFeedback++;

    const cur = layananMap.get(r.layananId) || { id: r.layananId, nama: r.layanan?.nama ?? "—", count: 0, score: 0 };
    cur.count++;
    cur.score += score;
    layananMap.set(r.layananId, cur);
  });

  const ikm = total > 0 ? parseFloat(((totalScore / (9 * total)) * 25).toFixed(2)) : 0;
  const avgRating = ratingCount > 0 ? parseFloat((ratingSum / ratingCount).toFixed(1)) : 0;

  const layananStats = Array.from(layananMap.values()).map(l => ({
    layananId:   l.id,
    layananNama: l.nama,
    count:       l.count,
    ikm:         parseFloat(((l.score / (9 * l.count)) * 25).toFixed(2)),
  })).sort((a, b) => b.count - a.count);

  const respondents = responses.map((r: any) => ({
    id:           r.id,
    nama:         r.nama,
    layananNama:  r.layanan?.nama ?? "—",
    tglLayanan:   new Date(r.tglLayanan).toLocaleDateString("id-ID"),
    jenisKelamin: r.jenisKelamin,
    pendidikan:   r.pendidikan,
    rating:       r.rating,
    ikm:          parseFloat((((r.u1+r.u2+r.u3+r.u4+r.u5+r.u6+r.u7+r.u8+r.u9) / 9) * 25).toFixed(2)),
    saran:        r.saran,
  }));

  return { pegawai, activePeriod, totalSurveys: total, ikm, avgRating, negFeedback, layananStats, respondents };
}

// ----------------------------------------------------------------------
// 12. SERVICE IKM ACROSS PERIODS (for Riwayat tab)
// ----------------------------------------------------------------------
export async function getServiceIkmAcrossPeriods(layananId: string, periodeIds: string[]) {
  if (!periodeIds.length) return [];

  const periods = await prisma.periode.findMany({
    where: { id: { in: periodeIds } },
    select: { id: true, label: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const results = await Promise.all(
    periods.map(async (p: typeof periods[0]) => {
      const respon = await prisma.respon.findMany({
        where: { periodeId: p.id, layananId },
        select: { u1: true, u2: true, u3: true, u4: true, u5: true, u6: true, u7: true, u8: true, u9: true },
      });
      const count = respon.length;
      let ikm = 0;
      if (count > 0) {
        const total = respon.reduce((acc: number, r: any) =>
          acc + r.u1 + r.u2 + r.u3 + r.u4 + r.u5 + r.u6 + r.u7 + r.u8 + r.u9, 0);
        ikm = parseFloat(((total / (9 * count)) * 25).toFixed(2));
      }
      return { periodeId: p.id, label: p.label, ikm, count };
    })
  );

  return results;
}

// ----------------------------------------------------------------------
// 13. SERVICES AVAILABLE IN PERIODS (for Riwayat tree)
// ----------------------------------------------------------------------
export async function getServicesInPeriods(periodeIds: string[]) {
  if (!periodeIds.length) return [];

  const respon = await prisma.respon.findMany({
    where: { periodeId: { in: periodeIds } },
    select: { layananId: true, layanan: { select: { id: true, nama: true, kategori: true } } },
    distinct: ["layananId"],
  });

  return respon.map((r: any) => r.layanan).filter(Boolean);
}

// ----------------------------------------------------------------------
// 14. LAYANAN WITH RESPONDENTS FOR SPECIFIC PERIOD
// ----------------------------------------------------------------------
export async function getLayananByPeriod(layananId: string, periodeId: string) {
  const layanan = await prisma.layanan.findUnique({ where: { id: layananId } });
  const periode = await prisma.periode.findUnique({ where: { id: periodeId }, select: { id: true, label: true } });
  if (!layanan || !periode) return null;

  const responses = await prisma.respon.findMany({
    where: { layananId, periodeId },
    include: { pegawai: { select: { id: true, nama: true } } },
    orderBy: { createdAt: "desc" },
  });

  const total = responses.length;
  const sums  = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  responses.forEach((r: any) => {
    sums[0] += r.u1; sums[1] += r.u2; sums[2] += r.u3;
    sums[3] += r.u4; sums[4] += r.u5; sums[5] += r.u6;
    sums[6] += r.u7; sums[7] += r.u8; sums[8] += r.u9;
  });

  const totalScore = sums.reduce((a, b) => a + b, 0);
  const ikm        = total > 0 ? parseFloat(((totalScore / (9 * total)) * 25).toFixed(2)) : 0;
  const unsurAvg   = sums.map(s => total > 0 ? parseFloat((s / total).toFixed(2)) : 0);

  return {
    layanan,
    periode,
    ikm,
    total,
    unsurAvg,
    responses: responses.map((r: any) => ({
      id:           r.id,
      nama:         r.nama,
      pegawai:      r.pegawai?.nama ?? "—",
      tglLayanan:   new Date(r.tglLayanan).toLocaleDateString("id-ID"),
      jenisKelamin: r.jenisKelamin,
      pendidikan:   r.pendidikan,
      pekerjaan:    r.pekerjaan,
      rating:       r.rating,
      saran:        r.saran,
      ikm:          parseFloat((((r.u1+r.u2+r.u3+r.u4+r.u5+r.u6+r.u7+r.u8+r.u9) / 9) * 25).toFixed(2)),
      u1: r.u1, u2: r.u2, u3: r.u3, u4: r.u4, u5: r.u5,
      u6: r.u6, u7: r.u7, u8: r.u8, u9: r.u9,
    })),
  };
}